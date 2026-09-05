import { DEFAULT_SETTINGS } from "../types";

import { openProjectsDB, SETTINGS_KEY } from "./db";
import { dbEvents } from "./events";

import type { Settings } from "../types";

export const getSettings = async (): Promise<Settings> => {
  const db = await openProjectsDB();
  const record = await db.get("settings", SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...((record?.value as Partial<Settings> | undefined) ?? {}),
  };
};

export const updateSettings = async (
  patch: Partial<Settings>,
): Promise<Settings> => {
  const db = await openProjectsDB();
  const tx = db.transaction("settings", "readwrite");
  const current = (await tx.store.get(SETTINGS_KEY))?.value as
    | Partial<Settings>
    | undefined;
  const next: Settings = { ...DEFAULT_SETTINGS, ...current, ...patch };
  await tx.store.put({ key: SETTINGS_KEY, value: next });
  await tx.done;
  dbEvents.emit("settings");
  return next;
};

/**
 * Best-effort request for durable storage so the browser does not evict our
 * IndexedDB under storage pressure. Only asked once.
 */
export const requestPersistentStorage = async () => {
  try {
    const settings = await getSettings();
    if (settings.persistRequested) {
      return;
    }
    if (navigator.storage?.persist) {
      await navigator.storage.persist();
    }
    await updateSettings({ persistRequested: true });
  } catch {
    // non-fatal
  }
};
