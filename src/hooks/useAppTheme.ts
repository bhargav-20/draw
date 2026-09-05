import { THEME } from "@excalidraw/excalidraw";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { Theme } from "@excalidraw/excalidraw/element/types";

import { getSettings, updateSettings } from "../data/settings";

import type { ThemeSetting } from "../types";

/** mirrored to localStorage so the FOUC guard in index.html can read it synchronously */
export const THEME_STORAGE_KEY = "excalidraw-projects-theme";

const getDarkThemeMediaQuery = (): MediaQueryList | undefined =>
  window.matchMedia?.("(prefers-color-scheme: dark)");

const readStoredTheme = (): ThemeSetting => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // ignore
  }
  return "system";
};

/**
 * Port of excalidraw-app's `useHandleAppTheme`: a tri-state preference
 * (`light | dark | system`) resolved to the editor's binary theme. The
 * preference is persisted in settings (IndexedDB) and mirrored to localStorage.
 */
export const useAppThemeState = () => {
  const [appTheme, setAppThemeState] = useState<ThemeSetting>(readStoredTheme);
  const [editorTheme, setEditorTheme] = useState<Theme>(THEME.LIGHT);
  /** the user picked a theme in this session – a late settings read must not undo it */
  const userChoseTheme = useRef(false);

  // hydrate from settings once (localStorage is only a mirror)
  useEffect(() => {
    getSettings()
      .then((settings) => {
        if (!userChoseTheme.current) {
          setAppThemeState(settings.theme);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mediaQuery = getDarkThemeMediaQuery();
    const handleChange = (e: MediaQueryListEvent) => {
      setEditorTheme(e.matches ? THEME.DARK : THEME.LIGHT);
    };
    if (appTheme === "system") {
      mediaQuery?.addEventListener("change", handleChange);
    }
    return () => {
      mediaQuery?.removeEventListener("change", handleChange);
    };
  }, [appTheme]);

  useLayoutEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, appTheme);
    } catch {
      // ignore
    }
    const resolved =
      appTheme === "system"
        ? getDarkThemeMediaQuery()?.matches
          ? THEME.DARK
          : THEME.LIGHT
        : appTheme;
    setEditorTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === THEME.DARK);
  }, [appTheme]);

  const setAppTheme = useCallback((theme: ThemeSetting) => {
    userChoseTheme.current = true;
    setAppThemeState(theme);
    updateSettings({ theme }).catch(() => {});
  }, []);

  return { appTheme, editorTheme, setAppTheme };
};

export type AppThemeContextValue = ReturnType<typeof useAppThemeState>;

export const AppThemeContext = createContext<AppThemeContextValue>({
  appTheme: "system",
  editorTheme: THEME.LIGHT,
  setAppTheme: () => {},
});

export const useAppTheme = () => useContext(AppThemeContext);
