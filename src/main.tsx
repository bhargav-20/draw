import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "@excalidraw/excalidraw/index.css";

import "./css/app.scss";

import { App } from "./App";
import { openProjectsDB, StorageUnavailableError } from "./data/db";
import { requestPersistentStorage } from "./data/settings";

const root = createRoot(document.getElementById("root")!);

const renderStorageError = (error: unknown) => {
  const message =
    error instanceof StorageUnavailableError
      ? error.message
      : "Could not open the local database.";
  root.render(
    <div className="excalidraw ProjectsApp">
      <div className="EmptyState" style={{ height: "100%" }}>
        <div className="EmptyState__title">Storage unavailable</div>
        <div>{message}</div>
        <div>
          Try a regular (non-private) window, or a browser with IndexedDB
          enabled.
        </div>
      </div>
    </div>,
  );
};

openProjectsDB()
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    void requestPersistentStorage();
    registerSW({ immediate: true });
  })
  .catch(renderStorageError);
