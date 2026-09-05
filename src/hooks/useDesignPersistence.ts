import { useEffect, useMemo } from "react";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

import { SAVE_TO_DB_TIMEOUT, THUMBNAIL_IDLE_INTERVAL } from "../constants";
import { DB_BLOCKED_EVENT } from "../data/db";
import { saveScene, saveThumbnail } from "../data/scenes";
import { renderThumbnail } from "../data/thumbnails";
import { debounce } from "../utils";

import type { DesignId } from "../types";

export type SceneSnapshot = {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
};

export interface DesignPersistence {
  designId: DesignId;
  /** `<Excalidraw onChange>` handler: debounced write to IndexedDB */
  onChange: (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void;
  /**
   * Writes any pending change immediately and renders a thumbnail if the
   * scene changed since the last one. Resolves once both are stored.
   */
  flush: () => Promise<void>;
  /** flushes and stops the thumbnail scheduler (call on unmount) */
  destroy: () => void;
  /**
   * `false` once persistence was switched off for this design – because the
   * stored scene could not be loaded (autosaving the editor's empty fallback
   * would destroy it) or the database was closed by another tab's upgrade.
   */
  readonly enabled: boolean;
  /** Switches persistence off. Writes already queued still complete. */
  disable: () => void;
  /**
   * Renders and stores a thumbnail from an already-loaded scene (a design
   * imported without a PNG has none until it is edited). Once per instance;
   * best-effort and non-blocking.
   */
  primeThumbnail: (scene: SceneSnapshot) => void;
}

/**
 * The excalidraw.com persistence pattern (`LocalData.save` + `flushSave`)
 * retargeted to IndexedDB, for one design. Framework-free so it can be unit
 * tested directly; `useDesignPersistence` wires it to the component lifecycle.
 */
export const createDesignPersistence = (
  designId: DesignId,
): DesignPersistence => {
  let enabled = true;
  let latest: SceneSnapshot | null = null;
  /** the element set changed since the last thumbnail render */
  let thumbnailPending = false;
  let thumbnailTimer = 0;
  let lastThumbnailAt = 0;
  let primed = false;
  /** saves are chained so they never interleave and `flush()` can await them */
  let queue: Promise<void> = Promise.resolve();

  const renderPendingThumbnail = async () => {
    const scene = latest;
    if (!enabled || !thumbnailPending || !scene) {
      return;
    }
    thumbnailPending = false;
    lastThumbnailAt = Date.now();
    window.clearTimeout(thumbnailTimer);
    thumbnailTimer = 0;
    try {
      const blob = await renderThumbnail(
        scene.elements,
        scene.appState,
        scene.files,
      );
      // `null` = nothing to draw (the canvas was emptied) – clears the stale one
      await saveThumbnail(designId, blob);
    } catch {
      // thumbnails are best-effort
    }
  };

  /** throttled: at most one render per THUMBNAIL_IDLE_INTERVAL while editing */
  const scheduleThumbnail = () => {
    if (thumbnailTimer) {
      return;
    }
    const wait = Math.max(
      0,
      THUMBNAIL_IDLE_INTERVAL - (Date.now() - lastThumbnailAt),
    );
    thumbnailTimer = window.setTimeout(() => {
      thumbnailTimer = 0;
      void renderPendingThumbnail();
    }, wait);
  };

  const persist = async (scene: SceneSnapshot) => {
    try {
      const result = await saveScene(
        designId,
        scene.elements,
        scene.appState,
        scene.files,
      );
      // `null` = the design was deleted while the editor was open – drop it
      if (result?.changed) {
        thumbnailPending = true;
        scheduleThumbnail();
      }
    } catch (error) {
      console.error("[persistence] failed to save scene", error);
    }
  };

  const save = debounce((scene: SceneSnapshot) => {
    queue = queue.then(() => persist(scene));
  }, SAVE_TO_DB_TIMEOUT);

  const flush = async () => {
    if (!enabled) {
      return;
    }
    save.flush();
    await queue;
    await renderPendingThumbnail();
  };

  return {
    designId,
    get enabled() {
      return enabled;
    },
    onChange: (elements, appState, files) => {
      // the editor doesn't emit while loading, but never risk overwriting a
      // stored scene with the empty pre-init one
      if (!enabled || appState.isLoading) {
        return;
      }
      latest = { elements, appState, files };
      save(latest);
    },
    flush,
    disable: () => {
      enabled = false;
      save.cancel();
      window.clearTimeout(thumbnailTimer);
      thumbnailTimer = 0;
    },
    primeThumbnail: (scene) => {
      if (!enabled || primed) {
        return;
      }
      primed = true;
      // an edit may already have arrived; the newest scene wins
      latest ??= scene;
      thumbnailPending = true;
      void renderPendingThumbnail();
    },
    destroy: () => {
      window.clearTimeout(thumbnailTimer);
      thumbnailTimer = 0;
      void flush();
    },
  };
};

/**
 * Persists a design's scene from `<Excalidraw onChange>`: debounced writes,
 * flushed when the tab is hidden / unloaded / blurred, when the design
 * changes and on unmount. Thumbnails are regenerated after real edits.
 *
 * The returned object is stable per `designId`, so it can be used as an
 * effect / callback dependency.
 */
export const useDesignPersistence = (designId: DesignId) => {
  const persistence = useMemo(
    () => createDesignPersistence(designId),
    [designId],
  );

  useEffect(() => {
    const flush = () => {
      void persistence.flush();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        flush();
      }
    };
    // another tab is upgrading the database: store what we have, then stop –
    // this tab's connection is about to close for good
    const onDbBlocked = () => {
      flush();
      persistence.disable();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flush);
    window.addEventListener("blur", flush);
    window.addEventListener(DB_BLOCKED_EVENT, onDbBlocked);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("blur", flush);
      window.removeEventListener(DB_BLOCKED_EVENT, onDbBlocked);
      persistence.destroy();
    };
  }, [persistence]);

  return useMemo(
    () => ({
      onChange: persistence.onChange,
      flush: persistence.flush,
      disable: persistence.disable,
      primeThumbnail: persistence.primeThumbnail,
      get enabled() {
        return persistence.enabled;
      },
    }),
    [persistence],
  );
};
