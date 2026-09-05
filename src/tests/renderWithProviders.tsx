import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

import { ToastProvider } from "../components/ui";
import { AppThemeContext } from "../hooks/useAppTheme";

import type { AppThemeContextValue } from "../hooks/useAppTheme";

const themeValue: AppThemeContextValue = {
  appTheme: "light",
  editorTheme: "light",
  setAppTheme: () => {},
};

/** Renders the current pathname so tests can assert navigation. */
export const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

/**
 * Wraps `ui` in the providers our pages expect: theme context, toasts and a
 * memory router. Pass `routes` to mount the ui at `path` alongside probe
 * routes (`{ "/p/:projectId": <LocationProbe /> }`).
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    route = "/",
    path = "/",
    routes = {},
  }: {
    route?: string;
    path?: string;
    routes?: Record<string, React.ReactElement>;
  } = {},
) =>
  render(
    <AppThemeContext.Provider value={themeValue}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            {Object.entries(routes).map(([routePath, element]) => (
              <Route key={routePath} path={routePath} element={element} />
            ))}
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AppThemeContext.Provider>,
  );
