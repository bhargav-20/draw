import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  Excalidraw,
  getNonDeletedElements,
  restore,
  useHandleLibrary,
} from "@excalidraw/excalidraw";

import type { LibraryPersistenceAdapter } from "@excalidraw/excalidraw/data/library";

import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
  UIOptions,
} from "@excalidraw/excalidraw/types";

import { APP_NAME } from "../../constants";
import { getDesign } from "../../data/designs";
import { libraryAdapter } from "../../data/library";
import { getProject } from "../../data/projects";
import { getScene } from "../../data/scenes";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useDesignPersistence } from "../../hooks/useDesignPersistence";
import { useLiveQuery } from "../../hooks/useLiveQuery";
import { NotFound } from "../layout/NotFound";
import { useToast } from "../ui";

import { DesignsSidebar } from "./DesignsSidebar";
import { EditorTopRightUI } from "./EditorTopRightUI";

import "./EditorPage.scss";

import type { Design, DesignId, Project } from "../../types";

// the stock menu stays untouched; we only enable its theme toggle so the
// app-wide theme can be changed from inside the editor
const UI_OPTIONS: Partial<UIOptions> = {
  canvasActions: { toggleTheme: true },
};

/** `useHandleLibrary` adapter over the shared IndexedDB library store */
const LIBRARY_ADAPTER: LibraryPersistenceAdapter = {
  async load() {
    const libraryItems = await libraryAdapter.load();
    return libraryItems ? { libraryItems } : null;
  },
  save({ libraryItems }) {
    return libraryAdapter.save(libraryItems);
  },
};

/**
 * Loads the stored scene. The persisted appState carries scroll/zoom, so a
 * scene saved at least once reopens exactly where it was left; only a scene
 * without saved viewport (fresh / imported) is centred on its content.
 */
const loadInitialData = async (
  designId: DesignId,
): Promise<ExcalidrawInitialDataState> => {
  const scene = await getScene(designId);
  const hasViewport =
    typeof scene?.appState.scrollX === "number" &&
    typeof scene?.appState.scrollY === "number";
  const restored = restore(
    scene
      ? {
          elements: scene.elements,
          appState: scene.appState,
          files: scene.files,
        }
      : null,
    null,
    null,
    { repairBindings: true },
  );
  return {
    elements: restored.elements,
    appState: restored.appState,
    files: restored.files,
    scrollToContent: !hasViewport,
  };
};

const LOAD_FAILED_MESSAGE =
  "Could not load this design – autosave is off; reload to try again";

const Editor = ({ project, design }: { project: Project; design: Design }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { editorTheme, setAppTheme } = useAppTheme();
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const persistence = useDesignPersistence(design.id);
  /** id of the design whose scene failed to load (persistence is off for it) */
  const [failedDesignId, setFailedDesignId] = useState<DesignId | null>(null);

  useHandleLibrary({ excalidrawAPI: api, adapter: LIBRARY_ADAPTER });

  const initialData = useMemo(() => {
    const designId = design.id;
    return loadInitialData(designId).catch((error: unknown) => {
      // Excalidraw swallows a rejected `initialData` and starts with an empty
      // canvas, which autosave would then write over the stored scene. Stop
      // persisting before that can happen and show an error state instead.
      console.error("[editor] failed to load the scene", error);
      persistence.disable();
      setFailedDesignId(designId);
      return null;
    });
  }, [design.id, persistence]);

  const loadFailed = failedDesignId === design.id;
  useEffect(() => {
    if (loadFailed) {
      showToast(LOAD_FAILED_MESSAGE, { kind: "error" });
    }
  }, [loadFailed, showToast]);

  // a design imported without a preview gets one from its stored scene
  const hasThumbnail = !!design.thumbnail;
  useEffect(() => {
    if (hasThumbnail) {
      return;
    }
    void initialData.then((data) => {
      if (!data?.elements || !getNonDeletedElements(data.elements).length) {
        return;
      }
      persistence.primeThumbnail({
        elements: data.elements,
        appState: data.appState ?? {},
        files: data.files ?? {},
      });
    });
  }, [hasThumbnail, initialData, persistence]);

  // theme sync: the stock toggle changes `appState.theme`; mirror it to the
  // app-wide setting. Compared against the current value so it can't loop.
  const editorThemeRef = useRef(editorTheme);
  editorThemeRef.current = editorTheme;

  const onChange = useCallback<NonNullable<ExcalidrawProps["onChange"]>>(
    (elements, appState: AppState, files: BinaryFiles) => {
      if (!appState.isLoading && appState.theme !== editorThemeRef.current) {
        setAppTheme(appState.theme);
      }
      persistence.onChange(elements, appState, files);
    },
    [persistence, setAppTheme],
  );

  const projectId = project.id;
  const onBack = useCallback(() => {
    void persistence.flush().then(() => navigate(`/p/${projectId}`));
  }, [persistence, projectId, navigate]);

  // The live `design` / `project` objects change on every autosave and
  // thumbnail write. The extension-point props only depend on what they
  // display, so they stay referentially stable and `<Excalidraw>` (memoised
  // on its props) is not re-rendered while drawing.
  const projectView = useMemo(
    () => ({ id: project.id, name: project.name, emoji: project.emoji }),
    [project.id, project.name, project.emoji],
  );
  const designView = useMemo(
    () => ({ id: design.id, name: design.name }),
    [design.id, design.name],
  );

  const renderTopRightUI = useCallback<
    NonNullable<ExcalidrawProps["renderTopRightUI"]>
  >(
    (isMobile) => (
      <EditorTopRightUI
        project={projectView}
        design={designView}
        isMobile={isMobile}
        onBack={onBack}
      />
    ),
    [projectView, designView, onBack],
  );

  const sidebar = useMemo(
    () => (
      <DesignsSidebar
        project={projectView}
        design={designView}
        flush={persistence.flush}
      />
    ),
    [projectView, designView, persistence.flush],
  );

  if (loadFailed) {
    return (
      <NotFound
        title="Could not load this design"
        description="Its stored scene could not be read. Autosave is off so nothing gets overwritten – reload the page to try again."
      />
    );
  }

  return (
    <Excalidraw
      key={design.id}
      excalidrawAPI={setApi}
      initialData={initialData}
      onChange={onChange}
      theme={editorTheme}
      name={design.name}
      UIOptions={UI_OPTIONS}
      renderTopRightUI={renderTopRightUI}
      autoFocus
      handleKeyboardGlobally={false}
    >
      {sidebar}
    </Excalidraw>
  );
};

export const EditorPage = () => {
  const { projectId = "", designId = "" } = useParams();

  // one query for both records, keyed on the route: switching to another
  // project's design never renders a mismatched (old project, new design) pair
  const { data, loading } = useLiveQuery(
    () => Promise.all([getProject(projectId), getDesign(designId)]),
    ["projects", "designs"],
    [projectId, designId],
  );
  const [project, design] = data ?? [];

  const projectName = project?.name;
  const designName = design?.name;
  useEffect(() => {
    if (!projectName || !designName) {
      return;
    }
    const previous = document.title;
    document.title = `${designName} · ${projectName} · ${APP_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [projectName, designName]);

  if (loading) {
    return <div className="EditorPage" />;
  }
  if (!project || !design || design.projectId !== project.id) {
    return (
      <NotFound
        title="Design not found"
        description="This design doesn't exist in this browser's storage. It may have been deleted."
      />
    );
  }

  return (
    <div className="EditorPage">
      <Editor project={project} design={design} />
    </div>
  );
};
