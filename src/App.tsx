import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { AlertIcon } from "./components/icons";
import { NotFound } from "./components/layout/NotFound";
import { FilledButton, Portal, ToastProvider } from "./components/ui";
import { DB_BLOCKED_EVENT } from "./data/db";
import { AppThemeContext, useAppThemeState } from "./hooks/useAppTheme";

import "./App.scss";

const DashboardPage = lazy(() =>
  import("./components/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ProjectPage = lazy(() =>
  import("./components/project/ProjectPage").then((m) => ({
    default: m.ProjectPage,
  })),
);
// the editor pulls in the whole excalidraw bundle – keep it out of the dashboard chunk
const EditorPage = lazy(() =>
  import("./components/editor/EditorPage").then((m) => ({
    default: m.EditorPage,
  })),
);

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

/**
 * Shown once another tab upgraded the database: this tab's connection was
 * closed and every further read/write fails until it reloads.
 */
const DbBlockedBanner = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onBlocked = () => setBlocked(true);
    window.addEventListener(DB_BLOCKED_EVENT, onBlocked);
    return () => window.removeEventListener(DB_BLOCKED_EVENT, onBlocked);
  }, []);

  if (!blocked) {
    return null;
  }
  return (
    <Portal kind="popover">
      <div className="Island DbBlockedBanner" role="alert">
        <span className="DbBlockedBanner__icon" aria-hidden>
          {AlertIcon}
        </span>
        <span className="DbBlockedBanner__message">
          This app was updated in another tab – reload to continue.
        </span>
        <FilledButton
          label="Reload"
          color="warning"
          onClick={() => window.location.reload()}
        />
      </div>
    </Portal>
  );
};

export const App = () => {
  const theme = useAppThemeState();
  return (
    <AppThemeContext.Provider value={theme}>
      <ToastProvider>
        <BrowserRouter basename={basename}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/p/:projectId" element={<ProjectPage />} />
              <Route
                path="/p/:projectId/d/:designId"
                element={<EditorPage />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <DbBlockedBanner />
      </ToastProvider>
    </AppThemeContext.Provider>
  );
};
