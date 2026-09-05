import { useCallback } from "react";

import { getSettings, updateSettings } from "../data/settings";
import { DEFAULT_SETTINGS } from "../types";

import { useLiveQuery } from "./useLiveQuery";

import type { Settings } from "../types";

export const useSettings = () => {
  const { data } = useLiveQuery(getSettings, ["settings"]);
  const update = useCallback(
    (patch: Partial<Settings>) => updateSettings(patch),
    [],
  );
  return { settings: data ?? DEFAULT_SETTINGS, updateSettings: update };
};
