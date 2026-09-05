import { DEFAULT_PROJECT_EMOJIS, DEFAULT_PROJECT_NAME } from "../constants";
import { normalizeTags, randomId } from "../utils";

import { openProjectsDB } from "./db";
import { dbEvents } from "./events";

import type { Project, ProjectColor, ProjectId, SortKey } from "../types";

export interface CreateProjectInput {
  name?: string;
  emoji?: string;
  color?: ProjectColor;
  tags?: string[];
}

export type UpdateProjectInput = Partial<
  Pick<Project, "name" | "emoji" | "color" | "tags">
>;

const randomEmoji = () =>
  DEFAULT_PROJECT_EMOJIS[
    Math.floor(Math.random() * DEFAULT_PROJECT_EMOJIS.length)
  ];

export const listProjects = async (): Promise<Project[]> => {
  const db = await openProjectsDB();
  return db.getAll("projects");
};

export const getProject = async (
  id: ProjectId,
): Promise<Project | undefined> => {
  const db = await openProjectsDB();
  return db.get("projects", id);
};

/** Builds a new project record (not stored); `order` is the caller's slot. */
export const newProjectRecord = (
  input: CreateProjectInput,
  order: number,
  now = Date.now(),
): Project => ({
  id: randomId(),
  name: input.name?.trim() || DEFAULT_PROJECT_NAME,
  emoji: input.emoji || randomEmoji(),
  color: input.color || "gray",
  tags: normalizeTags(input.tags ?? []),
  order,
  createdAt: now,
  updatedAt: now,
});

export const nextProjectOrder = (projects: readonly Project[]) =>
  projects.reduce((max, p) => Math.max(max, p.order), -1) + 1;

export const createProject = async (
  input: CreateProjectInput = {},
): Promise<Project> => {
  const db = await openProjectsDB();
  const tx = db.transaction("projects", "readwrite");
  const all = await tx.store.getAll();
  const project = newProjectRecord(input, nextProjectOrder(all));
  await tx.store.put(project);
  await tx.done;
  dbEvents.emit("projects");
  return project;
};

export const updateProject = async (
  id: ProjectId,
  patch: UpdateProjectInput,
): Promise<Project> => {
  const db = await openProjectsDB();
  const tx = db.transaction("projects", "readwrite");
  const current = await tx.store.get(id);
  if (!current) {
    throw new Error(`Project ${id} not found`);
  }
  const next: Project = {
    ...current,
    ...patch,
    name:
      patch.name !== undefined
        ? patch.name.trim() || current.name
        : current.name,
    tags: patch.tags ? normalizeTags(patch.tags) : current.tags,
    updatedAt: Date.now(),
  };
  await tx.store.put(next);
  await tx.done;
  dbEvents.emit("projects");
  return next;
};

/** bumps `updatedAt` without touching other fields (called when a design changes) */
export const touchProject = async (id: ProjectId, timestamp = Date.now()) => {
  const db = await openProjectsDB();
  const tx = db.transaction("projects", "readwrite");
  const current = await tx.store.get(id);
  if (current) {
    await tx.store.put({ ...current, updatedAt: timestamp });
  }
  await tx.done;
  dbEvents.emit("projects");
};

export const setProjectArchived = async (id: ProjectId, archived: boolean) => {
  const db = await openProjectsDB();
  const tx = db.transaction("projects", "readwrite");
  const current = await tx.store.get(id);
  if (!current) {
    throw new Error(`Project ${id} not found`);
  }
  const next: Project = { ...current, updatedAt: Date.now() };
  if (archived) {
    next.archivedAt = Date.now();
  } else {
    delete next.archivedAt;
  }
  await tx.store.put(next);
  await tx.done;
  dbEvents.emit("projects");
  return next;
};

/** Hard delete: removes the project, all its designs and their scenes. */
export const deleteProjectPermanently = async (id: ProjectId) => {
  const db = await openProjectsDB();
  const tx = db.transaction(["projects", "designs", "scenes"], "readwrite");
  const designs = await tx.objectStore("designs").index("projectId").getAll(id);
  await Promise.all([
    ...designs.flatMap((design) => [
      tx.objectStore("designs").delete(design.id),
      tx.objectStore("scenes").delete(design.id),
    ]),
    tx.objectStore("projects").delete(id),
  ]);
  await tx.done;
  dbEvents.emit("projects", "designs", "scenes");
};

/** Persists a manual order: `orderedIds` become 0..n-1, others keep relative order after. */
export const reorderProjects = async (orderedIds: ProjectId[]) => {
  const db = await openProjectsDB();
  const tx = db.transaction("projects", "readwrite");
  const all = await tx.store.getAll();
  const position = new Map(orderedIds.map((id, index) => [id, index]));
  const rest = all
    .filter((p) => !position.has(p.id))
    .sort((a, b) => a.order - b.order);
  rest.forEach((p, index) => position.set(p.id, orderedIds.length + index));
  await Promise.all(
    all.map((p) => {
      const order = position.get(p.id)!;
      return p.order === order
        ? Promise.resolve()
        : tx.store.put({ ...p, order });
    }),
  );
  await tx.done;
  dbEvents.emit("projects");
};

export const sortProjects = (projects: Project[], sort: SortKey): Project[] => {
  const sorted = [...projects];
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

export const getAllTags = (items: { tags: string[] }[]): string[] => {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
};
