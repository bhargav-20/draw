import {
  getNonDeletedElements,
  getSceneVersion,
  serializeAsJSON,
} from "@excalidraw/excalidraw";

import type {
  ExcalidrawElement,
  FileId,
  InitializedExcalidrawImageElement,
} from "@excalidraw/excalidraw/element/types";

import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

import { blobToArrayBuffer } from "../utils";

import { openProjectsDB } from "./db";
import { dbEvents } from "./events";

import type { DesignId, Scene } from "../types";

export const emptyScene = (): Omit<Scene, "designId"> => ({
  elements: [],
  appState: {},
  files: {},
});

const isInitializedImageElement = (
  element: ExcalidrawElement,
): element is InitializedExcalidrawImageElement =>
  element.type === "image" && !!element.fileId;

/** keeps only files still referenced by a non-deleted image element */
export const pruneFiles = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
): BinaryFiles => {
  const referenced = new Set<FileId>();
  for (const element of elements) {
    if (!element.isDeleted && isInitializedImageElement(element)) {
      referenced.add(element.fileId);
    }
  }
  const pruned: BinaryFiles = {};
  for (const id of referenced) {
    if (files[id]) {
      pruned[id] = files[id];
    }
  }
  return pruned;
};

/**
 * Produces the persistable form of a scene using Excalidraw's own `"database"`
 * serializer, i.e. the same appState whitelist excalidraw.com writes to browser
 * storage (transient keys stripped). Deleted elements are dropped, and only
 * files still referenced by an image element are kept.
 */
export const toPersistableScene = (
  designId: DesignId,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): Scene => {
  const nonDeleted = getNonDeletedElements(elements);
  const serialized = JSON.parse(
    serializeAsJSON(nonDeleted, appState, files, "database"),
  ) as { elements: ExcalidrawElement[]; appState: Partial<AppState> };
  // the "database" whitelist is the server one and drops the viewport; keep
  // it (as excalidraw.com's localStorage does) so a design reopens where it
  // was left
  const persistedAppState: Partial<AppState> = { ...serialized.appState };
  if (typeof appState.scrollX === "number") {
    persistedAppState.scrollX = appState.scrollX;
  }
  if (typeof appState.scrollY === "number") {
    persistedAppState.scrollY = appState.scrollY;
  }
  if (appState.zoom && typeof appState.zoom.value === "number") {
    persistedAppState.zoom = { value: appState.zoom.value };
  }
  return {
    designId,
    elements: serialized.elements,
    appState: persistedAppState,
    files: pruneFiles(serialized.elements, files),
  };
};

export const getScene = async (
  designId: DesignId,
): Promise<Scene | undefined> => {
  const db = await openProjectsDB();
  return db.get("scenes", designId);
};

export interface SaveSceneResult {
  /** true when the element set changed since the last save */
  changed: boolean;
  sceneVersion: number;
}

/**
 * Writes the scene. `updatedAt` of the design (and project) only moves when
 * the element version changed – pan/zoom/tool changes are stored but do not
 * count as "edits".
 */
export const saveScene = async (
  designId: DesignId,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): Promise<SaveSceneResult | null> => {
  const scene = toPersistableScene(designId, elements, appState, files);
  const sceneVersion = getSceneVersion(scene.elements);

  const db = await openProjectsDB();
  const tx = db.transaction(["designs", "scenes", "projects"], "readwrite");
  const designs = tx.objectStore("designs");
  const design = await designs.get(designId);
  if (!design) {
    // design was deleted while the editor was open – drop the write
    await tx.done;
    return null;
  }
  const changed = design.sceneVersion !== sceneVersion;
  await tx.objectStore("scenes").put(scene);
  if (changed) {
    const now = Date.now();
    await designs.put({ ...design, sceneVersion, updatedAt: now });
    const projects = tx.objectStore("projects");
    const project = await projects.get(design.projectId);
    if (project) {
      await projects.put({ ...project, updatedAt: now });
    }
  }
  await tx.done;
  dbEvents.emit("scenes");
  if (changed) {
    dbEvents.emit("designs", "projects");
  }
  return { changed, sceneVersion };
};

/**
 * Stores a rendered preview, or clears the stored one when `thumbnail` is
 * `null` (the canvas was emptied, so the old preview would be stale).
 */
export const saveThumbnail = async (
  designId: DesignId,
  thumbnail: Blob | null,
) => {
  // read the bytes *before* opening the transaction (awaiting a non-IDB
  // promise inside it would auto-commit the transaction)
  const bytes = thumbnail ? await blobToArrayBuffer(thumbnail) : null;
  const db = await openProjectsDB();
  const tx = db.transaction("designs", "readwrite");
  const design = await tx.store.get(designId);
  let changed = false;
  if (design && bytes) {
    await tx.store.put({
      ...design,
      thumbnail: bytes,
      thumbnailUpdatedAt: Date.now(),
    });
    changed = true;
  } else if (design && (design.thumbnail || design.thumbnailUpdatedAt)) {
    const { thumbnail: _thumbnail, thumbnailUpdatedAt: _at, ...rest } = design;
    await tx.store.put(rest);
    changed = true;
  }
  await tx.done;
  if (changed) {
    dbEvents.emit("designs");
  }
};
