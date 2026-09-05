import type { LibraryItems } from "@excalidraw/excalidraw/types";

import { LIBRARY_KEY, openProjectsDB } from "./db";
import { dbEvents } from "./events";

/**
 * One shared Excalidraw library across all designs (mirrors excalidraw.com's
 * `LibraryIndexedDBAdapter`).
 */
export const libraryAdapter = {
  async load(): Promise<LibraryItems | null> {
    const db = await openProjectsDB();
    const record = await db.get("library", LIBRARY_KEY);
    return record?.items ?? null;
  },
  async save(items: LibraryItems): Promise<void> {
    const db = await openProjectsDB();
    await db.put("library", { key: LIBRARY_KEY, items });
    dbEvents.emit("library");
  },
};
