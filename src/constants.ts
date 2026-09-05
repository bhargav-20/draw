import type { ProjectColor } from "./types";

export const APP_NAME = "Excalidraw Projects";

export const DB_NAME = "excalidraw-projects";
export const DB_VERSION = 1;

/** matches excalidraw-app's SAVE_TO_LOCAL_STORAGE_TIMEOUT */
export const SAVE_TO_DB_TIMEOUT = 300;
/** min interval between thumbnail renders while editing */
export const THUMBNAIL_IDLE_INTERVAL = 10_000;
export const THUMBNAIL_MAX_WIDTH_OR_HEIGHT = 480;

export const DEFAULT_PROJECT_NAME = "Untitled project";
export const DEFAULT_DESIGN_NAME = "Untitled design";

export const PROJECT_COLORS: readonly ProjectColor[] = [
  "gray",
  "violet",
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
];

export const DEFAULT_PROJECT_EMOJIS = [
  "✏️",
  "📐",
  "🧩",
  "🧭",
  "🚀",
  "🛒",
  "📱",
  "🖥️",
  "🗺️",
  "🏗️",
  "🧪",
  "💡",
  "📊",
  "🎯",
  "🔧",
  "🎨",
  "📦",
  "🔐",
  "🌱",
  "🪄",
] as const;

export const EXCALIDRAW_FILE_EXTENSION = ".excalidraw";
