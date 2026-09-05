import {
  getSceneVersion,
  loadFromBlob,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import { APP_NAME, EXCALIDRAW_FILE_EXTENSION } from "../constants";
import { BACKUP_FORMAT_VERSION } from "../types";
import {
  blobToArrayBuffer,
  formatDateForFilename,
  normalizeTags,
  randomId,
  slugify,
} from "../utils";

import { openProjectsDB } from "./db";
import { createDesign } from "./designs";
import { dbEvents } from "./events";
import { newProjectRecord, nextProjectOrder } from "./projects";
import { toPersistableScene } from "./scenes";

import type { Zippable } from "fflate";

import type {
  BackupDesignEntry,
  BackupManifest,
  BackupProjectEntry,
  Design,
  ImportMode,
  ImportSummary,
  Project,
  ProjectId,
  Scene,
} from "../types";

const MANIFEST_PATH = "manifest.json";
const PROJECTS_DIR = "projects";

/* ---------------------------------------------------------------------------
 * .excalidraw files
 * ------------------------------------------------------------------------- */

/** A standard `.excalidraw` file (files embedded) for one design. */
export const serializeDesignFile = (scene: Omit<Scene, "designId">): string =>
  serializeAsJSON(scene.elements, scene.appState, scene.files, "local");

export const designFileName = (design: Pick<Design, "name" | "id">) =>
  `${slugify(design.name)}--${design.id}${EXCALIDRAW_FILE_EXTENSION}`;

const projectDirName = (project: Pick<Project, "name" | "id">) =>
  `${PROJECTS_DIR}/${slugify(project.name)}--${project.id}`;

/** Parses a `.excalidraw` blob into a persistable scene using Excalidraw's own loader. */
export const sceneFromExcalidrawBlob = async (
  blob: Blob,
): Promise<Omit<Scene, "designId">> => {
  const restored = await loadFromBlob(blob, null, null);
  const { elements, appState, files } = toPersistableScene(
    "",
    restored.elements,
    restored.appState,
    restored.files,
  );
  return { elements, appState, files };
};

/* ---------------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------------- */

/**
 * Normalises to the current realm's Uint8Array. fflate checks `instanceof`
 * against its captured global, which fails for cross-realm arrays (jsdom).
 */
const asU8 = (bytes: Uint8Array): Uint8Array =>
  bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

const blobToU8 = async (blob: Blob) =>
  new Uint8Array(await blobToArrayBuffer(blob));

const textToU8 = (text: string) => asU8(strToU8(text));

/** `Uint8Array` views may be backed by a SharedArrayBuffer type-wise; copy into a plain buffer for Blob */
const u8ToBlob = (bytes: Uint8Array, type: string) =>
  new Blob([bytes.slice()], { type });

export interface BackupBundle {
  blob: Blob;
  filename: string;
  manifest: BackupManifest;
}

/**
 * Builds a zip backup. With `projectIds` only those projects are included
 * (single-project export); otherwise everything, archived items included.
 */
export const exportBackup = async (
  projectIds?: ProjectId[],
): Promise<BackupBundle> => {
  const db = await openProjectsDB();

  // Read everything inside one readonly transaction first. IndexedDB
  // transactions auto-commit as soon as we await anything that is not an IDB
  // request, so no Blob/zip work may happen before `tx.done`.
  const tx = db.transaction(["projects", "designs", "scenes"], "readonly");
  const allProjects = await tx.objectStore("projects").getAll();
  const projects = projectIds
    ? allProjects.filter((p) => projectIds.includes(p.id))
    : allProjects;
  const designsPerProject = await Promise.all(
    projects.map((project) =>
      tx.objectStore("designs").index("projectId").getAll(project.id),
    ),
  );
  const scenesPerProject = await Promise.all(
    designsPerProject.map((designs) =>
      Promise.all(
        designs.map((design) => tx.objectStore("scenes").get(design.id)),
      ),
    ),
  );
  await tx.done;

  const zipEntries: Zippable = {};
  const manifestProjects: BackupProjectEntry[] = [];

  for (const [index, project] of projects.entries()) {
    const dir = projectDirName(project);
    const designs = designsPerProject[index];
    const scenes = scenesPerProject[index];
    const entries: BackupDesignEntry[] = [];
    for (const [designIndex, design] of designs.entries()) {
      const scene = scenes[designIndex];
      const file = `${dir}/${designFileName(design)}`;
      zipEntries[file] = textToU8(
        serializeDesignFile(scene ?? { elements: [], appState: {}, files: {} }),
      );
      const { thumbnail, thumbnailUpdatedAt, ...meta } = design;
      const entry: BackupDesignEntry = { ...meta, file };
      if (thumbnail) {
        const thumbnailFile = `${dir}/thumbnails/${design.id}.png`;
        // png is already compressed
        zipEntries[thumbnailFile] = [new Uint8Array(thumbnail), { level: 0 }];
        entry.thumbnailFile = thumbnailFile;
      }
      entries.push(entry);
    }
    manifestProjects.push({ ...project, designs: entries });
  }

  const manifest: BackupManifest = {
    formatVersion: BACKUP_FORMAT_VERSION,
    app: APP_NAME,
    exportedAt: new Date().toISOString(),
    projects: manifestProjects,
  };
  zipEntries[MANIFEST_PATH] = textToU8(JSON.stringify(manifest, null, 2));

  const bytes = zipSync(zipEntries, { level: 6 });
  const blob = u8ToBlob(bytes, "application/zip");
  const date = formatDateForFilename();
  const filename =
    projects.length === 1 && projectIds
      ? `${slugify(projects[0].name)}-${date}.zip`
      : `${slugify(APP_NAME)}-backup-${date}.zip`;
  return { blob, filename, manifest };
};

/* ---------------------------------------------------------------------------
 * Import
 * ------------------------------------------------------------------------- */

export interface ParsedBackup {
  manifest: BackupManifest | null;
  files: Record<string, Uint8Array>;
  /** paths of every `.excalidraw` file found (used when there is no manifest) */
  excalidrawFiles: string[];
}

export const parseBackup = async (zip: Blob): Promise<ParsedBackup> => {
  const files = unzipSync(asU8(await blobToU8(zip)));
  let manifest: BackupManifest | null = null;
  if (files[MANIFEST_PATH]) {
    const parsed = JSON.parse(
      strFromU8(files[MANIFEST_PATH]),
    ) as BackupManifest;
    if (parsed?.formatVersion !== BACKUP_FORMAT_VERSION) {
      throw new Error(
        `Unsupported backup format version ${String(parsed?.formatVersion)}`,
      );
    }
    manifest = parsed;
  }
  const excalidrawFiles = Object.keys(files).filter(
    (path) => path.endsWith(EXCALIDRAW_FILE_EXTENSION) && !path.endsWith("/"),
  );
  return { manifest, files, excalidrawFiles };
};

const emptySummary = (): ImportSummary => ({
  projectsAdded: 0,
  projectsUpdated: 0,
  designsAdded: 0,
  designsUpdated: 0,
  skipped: 0,
  warnings: [],
});

const jsonBlob = (bytes: Uint8Array) => u8ToBlob(bytes, "application/json");

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sanitizeProject = (entry: BackupProjectEntry): Project => {
  const { designs: _designs, ...project } = entry;
  return {
    ...project,
    name: String(project.name || "Untitled project"),
    emoji: String(project.emoji || "✏️"),
    color: project.color || "gray",
    tags: normalizeTags(project.tags ?? []),
    order: Number(project.order) || 0,
    createdAt: Number(project.createdAt) || Date.now(),
    updatedAt: Number(project.updatedAt) || Date.now(),
  };
};

const sanitizeDesign = (
  entry: BackupDesignEntry,
  projectId: ProjectId,
): Design => {
  const { file: _file, thumbnailFile: _thumb, ...design } = entry;
  return {
    ...design,
    projectId,
    name: String(design.name || "Untitled design"),
    tags: normalizeTags(design.tags ?? []),
    order: Number(design.order) || 0,
    createdAt: Number(design.createdAt) || Date.now(),
    updatedAt: Number(design.updatedAt) || Date.now(),
    sceneVersion: Number(design.sceneVersion) || 0,
  };
};

/** A design fully parsed from the zip, ready to be written. */
type IncomingDesign = {
  design: Design;
  scene: Omit<Scene, "designId">;
  thumbnail?: ArrayBuffer;
};

/** Everything an import will write, decoded in memory before any IDB work. */
type ImportPlan = {
  projects: Project[];
  designs: IncomingDesign[];
  /** the zip had no manifest: the project is new and its order is assigned on write */
  loose: boolean;
};

const readDesignScene = async (
  bytes: Uint8Array | undefined,
  path: string,
  designName: string,
  summary: ImportSummary,
): Promise<Omit<Scene, "designId"> | null> => {
  if (!bytes) {
    summary.warnings.push(`Missing file "${path}" for design "${designName}"`);
    summary.skipped++;
    return null;
  }
  try {
    return await sceneFromExcalidrawBlob(jsonBlob(bytes));
  } catch (error) {
    summary.warnings.push(`Could not read "${path}": ${describeError(error)}`);
    summary.skipped++;
    return null;
  }
};

const planManifestImport = async (
  parsed: ParsedBackup,
  manifest: BackupManifest,
  summary: ImportSummary,
): Promise<ImportPlan> => {
  const plan: ImportPlan = { projects: [], designs: [], loose: false };
  for (const entry of manifest.projects) {
    const project = sanitizeProject(entry);
    plan.projects.push(project);
    for (const designEntry of entry.designs ?? []) {
      const design = sanitizeDesign(designEntry, project.id);
      const scene = await readDesignScene(
        parsed.files[designEntry.file],
        designEntry.file,
        design.name,
        summary,
      );
      if (!scene) {
        continue;
      }
      const thumbnailBytes = designEntry.thumbnailFile
        ? parsed.files[designEntry.thumbnailFile]
        : undefined;
      plan.designs.push({
        design,
        scene,
        thumbnail: thumbnailBytes ? thumbnailBytes.slice().buffer : undefined,
      });
    }
  }
  return plan;
};

const looseProjectName = (sourceName?: string) => {
  const name = sourceName?.replace(/\.zip$/i, "").trim();
  return name || "Imported drawings";
};

/** zip without manifest: every `.excalidraw` becomes a design in one new project */
const planLooseImport = async (
  parsed: ParsedBackup,
  summary: ImportSummary,
  sourceName: string | undefined,
): Promise<ImportPlan> => {
  if (!parsed.excalidrawFiles.length) {
    throw new Error("No manifest.json or .excalidraw files found in the zip");
  }
  const now = Date.now();
  // `order` is assigned inside the write transaction (needs the existing projects)
  const project = newProjectRecord(
    { name: looseProjectName(sourceName) },
    0,
    now,
  );
  const plan: ImportPlan = { projects: [project], designs: [], loose: true };
  for (const path of parsed.excalidrawFiles) {
    const name = path
      .split("/")
      .pop()!
      .replace(EXCALIDRAW_FILE_EXTENSION, "")
      .replace(/--[0-9a-f-]{36}$/i, "");
    const scene = await readDesignScene(
      parsed.files[path],
      path,
      name,
      summary,
    );
    if (!scene) {
      continue;
    }
    plan.designs.push({
      design: {
        id: randomId(),
        projectId: project.id,
        name,
        tags: [],
        order: plan.designs.length,
        createdAt: now,
        updatedAt: now,
        sceneVersion: getSceneVersion(scene.elements),
      },
      scene,
    });
  }
  return plan;
};

/**
 * Imports a backup zip.
 * - `merge`: adds unknown projects/designs; for known ids keeps whichever is newer.
 * - `replace`: wipes local data first – but only once the whole zip has been
 *   decoded successfully, so a corrupt backup can never leave the browser empty.
 *
 * Every design file is parsed into memory first; the clear and all writes then
 * happen in one `readwrite` transaction (nothing but IDB requests is awaited
 * inside it), so the import either lands completely or not at all.
 *
 * `sourceName` (the zip's file name) names the project a manifest-less zip is
 * imported into.
 */
export const importBackup = async (
  zip: Blob,
  mode: ImportMode = "merge",
  sourceName?: string,
): Promise<ImportSummary> => {
  const parsed = await parseBackup(zip);
  const summary = emptySummary();

  const plan = parsed.manifest
    ? await planManifestImport(parsed, parsed.manifest, summary)
    : await planLooseImport(parsed, summary, sourceName);

  if (mode === "replace" && summary.warnings.length) {
    throw new Error(
      `The backup contains unreadable design files – nothing was replaced. Use “Merge” to import the readable ones. (${summary.warnings.join(
        "; ",
      )})`,
    );
  }

  const db = await openProjectsDB();
  const tx = db.transaction(["projects", "designs", "scenes"], "readwrite");
  const projects = tx.objectStore("projects");
  const designs = tx.objectStore("designs");
  const scenes = tx.objectStore("scenes");

  if (mode === "replace") {
    await Promise.all([projects.clear(), designs.clear(), scenes.clear()]);
  }

  if (plan.loose) {
    plan.projects[0].order = nextProjectOrder(await projects.getAll());
  }

  for (const incoming of plan.projects) {
    const existing = await projects.get(incoming.id);
    if (!existing) {
      await projects.put(incoming);
      summary.projectsAdded++;
    } else if (incoming.updatedAt > existing.updatedAt) {
      await projects.put({ ...existing, ...incoming });
      summary.projectsUpdated++;
    } else {
      summary.skipped++;
    }
  }

  for (const { design: incoming, scene, thumbnail } of plan.designs) {
    const existing = await designs.get(incoming.id);
    if (existing && incoming.updatedAt <= existing.updatedAt) {
      summary.skipped++;
      continue;
    }
    const design: Design = {
      ...(existing ?? {}),
      ...incoming,
      thumbnail: thumbnail ?? existing?.thumbnail,
      thumbnailUpdatedAt: thumbnail
        ? incoming.updatedAt
        : existing?.thumbnailUpdatedAt,
    };
    await Promise.all([
      designs.put(design),
      scenes.put({ ...scene, designId: design.id }),
    ]);
    if (existing) {
      summary.designsUpdated++;
    } else {
      summary.designsAdded++;
    }
  }

  await tx.done;
  dbEvents.emit("projects", "designs", "scenes");
  return summary;
};

/** Imports one or more `.excalidraw` files as new designs of a project. */
export const importExcalidrawFiles = async (
  projectId: ProjectId,
  files: File[],
): Promise<{ designs: Design[]; errors: string[] }> => {
  const designs: Design[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      const scene = await sceneFromExcalidrawBlob(file);
      const name = file.name.replace(/\.(excalidraw|json)$/i, "");
      designs.push(await createDesign({ projectId, name, scene }));
    } catch (error) {
      errors.push(
        `${file.name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  return { designs, errors };
};
