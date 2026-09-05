import { openDB } from "idb";

import type { LibraryItems } from "@excalidraw/excalidraw/types";

import { DB_NAME, DB_VERSION } from "../constants";

import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from "idb";

import type { Design, Project, Scene, Settings } from "../types";

export interface ProjectsDBSchema extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { updatedAt: number };
  };
  designs: {
    key: string;
    value: Design;
    indexes: { projectId: string; updatedAt: number };
  };
  scenes: {
    key: string;
    value: Scene;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
  library: {
    key: string;
    value: { key: string; items: LibraryItems };
  };
}

export type ProjectsDB = IDBPDatabase<ProjectsDBSchema>;
export type ProjectsTx<
  Stores extends StoreNames<ProjectsDBSchema>[],
  Mode extends IDBTransactionMode = "readwrite",
> = IDBPTransaction<ProjectsDBSchema, Stores, Mode>;

let dbPromise: Promise<ProjectsDB> | null = null;
/** set once another tab upgraded the schema; this tab must reload */
let blockedByUpgrade = false;

/**
 * Dispatched on `window` right before this tab's connection is closed because
 * another tab opened a newer schema version. Listeners (an open editor) get
 * one chance to flush pending writes; afterwards `openProjectsDB()` rejects.
 */
export const DB_BLOCKED_EVENT = "excalidraw-projects:db-blocked";

export class StorageUnavailableError extends Error {
  constructor(cause: unknown) {
    super(
      "IndexedDB is not available in this browser context. Excalidraw Projects stores everything locally and cannot run without it.",
    );
    this.name = "StorageUnavailableError";
    this.cause = cause;
  }
}

/**
 * Schema migrations run inside `upgrade()`. Add a new `if (oldVersion < N)`
 * block for every schema bump and increase `DB_VERSION`.
 */
export const openProjectsDB = (): Promise<ProjectsDB> => {
  if (blockedByUpgrade) {
    return Promise.reject(
      new StorageUnavailableError(
        new Error("The database was upgraded in another tab; reload this tab"),
      ),
    );
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      if (typeof indexedDB === "undefined") {
        throw new StorageUnavailableError(new Error("indexedDB is undefined"));
      }
      try {
        return await openDB<ProjectsDBSchema>(DB_NAME, DB_VERSION, {
          upgrade(db, oldVersion) {
            if (oldVersion < 1) {
              const projects = db.createObjectStore("projects", {
                keyPath: "id",
              });
              projects.createIndex("updatedAt", "updatedAt");

              const designs = db.createObjectStore("designs", {
                keyPath: "id",
              });
              designs.createIndex("projectId", "projectId");
              designs.createIndex("updatedAt", "updatedAt");

              db.createObjectStore("scenes", { keyPath: "designId" });
              db.createObjectStore("settings", { keyPath: "key" });
              db.createObjectStore("library", { keyPath: "key" });
            }
          },
          blocked() {
            // another tab holds an older version open – nothing we can do but wait
            console.warn("[db] open blocked by another tab");
          },
          blocking() {
            // A newer version wants to open in another tab. Reopening at our
            // (old) DB_VERSION after that upgrade would throw, so this tab is
            // done: notify listeners first so an open editor can flush – its
            // write transaction starts within microtasks, and a transaction
            // created before `close()` still commits – then close so the
            // other tab can upgrade.
            window.dispatchEvent(new Event(DB_BLOCKED_EVENT));
            const closing = dbPromise;
            window.setTimeout(() => {
              blockedByUpgrade = true;
              dbPromise = null;
              closing?.then((db) => db.close()).catch(() => {});
            }, 0);
          },
          terminated() {
            dbPromise = null;
          },
        });
      } catch (error) {
        dbPromise = null;
        throw new StorageUnavailableError(error);
      }
    })();
  }
  return dbPromise;
};

/** test-only: drop the cached connection so a fresh DB (e.g. fake-indexeddb) is opened */
export const _resetDBForTests = async () => {
  if (dbPromise) {
    try {
      (await dbPromise).close();
    } catch {
      // ignore
    }
  }
  dbPromise = null;
  blockedByUpgrade = false;
};

export const SETTINGS_KEY = "settings";
export const LIBRARY_KEY = "library";

export type { Settings };
