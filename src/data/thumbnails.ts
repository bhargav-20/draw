import { exportToBlob, getNonDeletedElements } from "@excalidraw/excalidraw";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

import { THUMBNAIL_MAX_WIDTH_OR_HEIGHT } from "../constants";

/**
 * Renders a small PNG preview of a scene. Returns `null` for empty scenes or
 * when rendering fails (thumbnails are best-effort).
 */
export const renderThumbnail = async (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): Promise<Blob | null> => {
  const visible = getNonDeletedElements(elements);
  if (!visible.length) {
    return null;
  }
  try {
    return await exportToBlob({
      elements: visible,
      files,
      appState: {
        ...appState,
        exportBackground: true,
        exportWithDarkMode: false,
        exportEmbedScene: false,
        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
      },
      mimeType: "image/png",
      maxWidthOrHeight: THUMBNAIL_MAX_WIDTH_OR_HEIGHT,
      exportPadding: 24,
    });
  } catch (error) {
    console.warn("[thumbnail] render failed", error);
    return null;
  }
};
