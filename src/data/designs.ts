import { DEFAULT_DESIGN_NAME } from "../constants";
import { copyName, nextUntitledName, normalizeTags, randomId } from "../utils";

import { openProjectsDB } from "./db";
import { dbEvents } from "./events";
import { emptyScene } from "./scenes";

import type { Design, DesignId, ProjectId, Scene, SortKey } from "../types";

export interface CreateDesignInput {
  projectId: ProjectId;
  name?: string;
  tags?: string[];
  /** initial scene (e.g. from an imported .excalidraw file) */
  scene?: Omit<Scene, "designId">;
  /** insert right after this design (manual order) */
  after?: DesignId;
}

export type UpdateDesignInput = Partial<Pick<Design, "name" | "tags">>;

export const listDesigns = async (projectId: ProjectId): Promise<Design[]> => {
  const db = await openProjectsDB();
  return db.getAllFromIndex("designs", "projectId", projectId);
};

export const listAllDesigns = async (): Promise<Design[]> => {
  const db = await openProjectsDB();
  return db.getAll("designs");
};

export const getDesign = async (id: DesignId): Promise<Design | undefined> => {
  const db = await openProjectsDB();
  return db.get("designs", id);
};

export const createDesign = async (
  input: CreateDesignInput,
): Promise<Design> => {
  const db = await openProjectsDB();
  const tx = db.transaction(["projects", "designs", "scenes"], "readwrite");
  const projects = tx.objectStore("projects");
  const designs = tx.objectStore("designs");

  const project = await projects.get(input.projectId);
  if (!project) {
    throw new Error(`Project ${input.projectId} not found`);
  }
  const siblings = (
    await designs.index("projectId").getAll(input.projectId)
  ).sort((a, b) => a.order - b.order);

  const now = Date.now();
  const scene = input.scene ?? emptyScene();
  const design: Design = {
    id: randomId(),
    projectId: input.projectId,
    name:
      input.name?.trim() ||
      nextUntitledName(
        DEFAULT_DESIGN_NAME,
        siblings.map((d) => d.name),
      ),
    tags: normalizeTags(input.tags ?? []),
    order: 0,
    createdAt: now,
    updatedAt: now,
    sceneVersion: scene.elements.length ? -1 : 0,
  };

  // compute order: append, or insert after a sibling and shift the rest
  const afterIndex = input.after
    ? siblings.findIndex((d) => d.id === input.after)
    : -1;
  if (afterIndex === -1) {
    design.order = siblings.reduce((max, d) => Math.max(max, d.order), -1) + 1;
  } else {
    design.order = siblings[afterIndex].order + 1;
    await Promise.all(
      siblings
        .slice(afterIndex + 1)
        .map((d) => designs.put({ ...d, order: d.order + 1 })),
    );
  }

  await designs.put(design);
  await tx.objectStore("scenes").put({ ...scene, designId: design.id });
  await projects.put({ ...project, updatedAt: now });
  await tx.done;
  dbEvents.emit("projects", "designs", "scenes");
  return design;
};

export const updateDesign = async (
  id: DesignId,
  patch: UpdateDesignInput,
): Promise<Design> => {
  const db = await openProjectsDB();
  const tx = db.transaction("designs", "readwrite");
  const current = await tx.store.get(id);
  if (!current) {
    throw new Error(`Design ${id} not found`);
  }
  const next: Design = {
    ...current,
    name:
      patch.name !== undefined
        ? patch.name.trim() || current.name
        : current.name,
    tags: patch.tags ? normalizeTags(patch.tags) : current.tags,
    updatedAt: Date.now(),
  };
  await tx.store.put(next);
  await tx.done;
  dbEvents.emit("designs");
  return next;
};

export const setDesignArchived = async (id: DesignId, archived: boolean) => {
  const db = await openProjectsDB();
  const tx = db.transaction("designs", "readwrite");
  const current = await tx.store.get(id);
  if (!current) {
    throw new Error(`Design ${id} not found`);
  }
  const next: Design = { ...current, updatedAt: Date.now() };
  if (archived) {
    next.archivedAt = Date.now();
  } else {
    delete next.archivedAt;
  }
  await tx.store.put(next);
  await tx.done;
  dbEvents.emit("designs");
  return next;
};

export const deleteDesignPermanently = async (id: DesignId) => {
  const db = await openProjectsDB();
  const tx = db.transaction(["designs", "scenes"], "readwrite");
  await Promise.all([
    tx.objectStore("designs").delete(id),
    tx.objectStore("scenes").delete(id),
  ]);
  await tx.done;
  dbEvents.emit("designs", "scenes");
};

/**
 * Copies a design (scene, files and thumbnail) into the same project, placed
 * right after the source. One transaction, so a failure leaves no half-copy.
 */
export const duplicateDesign = async (id: DesignId): Promise<Design> => {
  const db = await openProjectsDB();
  const tx = db.transaction(["projects", "designs", "scenes"], "readwrite");
  const designs = tx.objectStore("designs");
  const scenes = tx.objectStore("scenes");
  const projects = tx.objectStore("projects");

  const [source, scene] = await Promise.all([designs.get(id), scenes.get(id)]);
  if (!source) {
    throw new Error(`Design ${id} not found`);
  }
  const siblings = (
    await designs.index("projectId").getAll(source.projectId)
  ).sort((a, b) => a.order - b.order);
  const sourceIndex = siblings.findIndex((d) => d.id === source.id);

  const now = Date.now();
  // the copy is a fresh, non-archived design; everything else (tags,
  // sceneVersion, thumbnail) carries over
  const { archivedAt: _archivedAt, ...base } = source;
  const copy: Design = {
    ...base,
    id: randomId(),
    name: copyName(
      source.name,
      siblings.map((d) => d.name),
    ),
    order: source.order + 1,
    createdAt: now,
    updatedAt: now,
  };
  // shift the designs after the source so the copy sits right behind it
  await Promise.all(
    siblings
      .slice(sourceIndex + 1)
      .map((d) => designs.put({ ...d, order: d.order + 1 })),
  );
  await designs.put(copy);
  await scenes.put({ ...(scene ?? emptyScene()), designId: copy.id });
  const project = await projects.get(source.projectId);
  if (project) {
    await projects.put({ ...project, updatedAt: now });
  }
  await tx.done;
  dbEvents.emit("projects", "designs", "scenes");
  return copy;
};

export const moveDesignToProject = async (
  id: DesignId,
  targetProjectId: ProjectId,
): Promise<Design> => {
  const db = await openProjectsDB();
  const tx = db.transaction(["projects", "designs"], "readwrite");
  const designs = tx.objectStore("designs");
  const projects = tx.objectStore("projects");
  const [current, target] = await Promise.all([
    designs.get(id),
    projects.get(targetProjectId),
  ]);
  if (!current) {
    throw new Error(`Design ${id} not found`);
  }
  if (!target) {
    throw new Error(`Project ${targetProjectId} not found`);
  }
  const siblings = await designs.index("projectId").getAll(targetProjectId);
  const now = Date.now();
  const next: Design = {
    ...current,
    projectId: targetProjectId,
    order: siblings.reduce((max, d) => Math.max(max, d.order), -1) + 1,
    updatedAt: now,
  };
  await designs.put(next);
  await projects.put({ ...target, updatedAt: now });
  const source = await projects.get(current.projectId);
  if (source) {
    await projects.put({ ...source, updatedAt: now });
  }
  await tx.done;
  dbEvents.emit("projects", "designs");
  return next;
};

export const reorderDesigns = async (
  projectId: ProjectId,
  orderedIds: DesignId[],
) => {
  const db = await openProjectsDB();
  const tx = db.transaction("designs", "readwrite");
  const all = await tx.store.index("projectId").getAll(projectId);
  const position = new Map(orderedIds.map((id, index) => [id, index]));
  const rest = all
    .filter((d) => !position.has(d.id))
    .sort((a, b) => a.order - b.order);
  rest.forEach((d, index) => position.set(d.id, orderedIds.length + index));
  await Promise.all(
    all.map((d) => {
      const order = position.get(d.id)!;
      return d.order === order
        ? Promise.resolve()
        : tx.store.put({ ...d, order });
    }),
  );
  await tx.done;
  dbEvents.emit("designs");
};

export const sortDesigns = (designs: Design[], sort: SortKey): Design[] => {
  const sorted = [...designs];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
    case "createdAt":
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case "manual":
      return sorted.sort((a, b) => a.order - b.order);
    case "updatedAt":
    default:
      return sorted.sort((a, b) => b.updatedAt - a.updatedAt);
  }
};
