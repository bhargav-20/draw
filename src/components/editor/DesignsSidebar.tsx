import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Sidebar } from "@excalidraw/excalidraw";

import {
  createDesign,
  duplicateDesign,
  listDesigns,
  sortDesigns,
} from "../../data/designs";
import { listProjects, sortProjects } from "../../data/projects";
import { useLiveQuery } from "../../hooks/useLiveQuery";
import { useSettings } from "../../hooks/useSettings";
import { useThumbnailUrl } from "../../hooks/useThumbnailUrl";
import { formatRelativeTime, matchesSearch } from "../../utils";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  PlusIcon,
  SearchIcon,
} from "../icons";
import { DropdownMenu, FilledButton, TextField, useToast } from "../ui";

import { DESIGNS_SIDEBAR_NAME } from "./EditorTopRightUI";

import "./DesignsSidebar.scss";

import type { Design, DesignId, Project, ProjectId } from "../../types";

const designPath = (projectId: ProjectId, designId: DesignId) =>
  `/p/${projectId}/d/${designId}`;

const DesignRow = ({
  design,
  current,
  onOpen,
}: {
  design: Design;
  current: boolean;
  onOpen: (design: Design) => void;
}) => {
  const thumbnailUrl = useThumbnailUrl(design);
  return (
    <button
      type="button"
      className={clsx("DesignsSidebar__row", {
        "DesignsSidebar__row--current": current,
      })}
      onClick={() => onOpen(design)}
      aria-current={current ? "page" : undefined}
      title={design.name}
    >
      <span className="DesignsSidebar__thumbnail" aria-hidden>
        {thumbnailUrl && <img src={thumbnailUrl} alt="" />}
      </span>
      <span className="DesignsSidebar__row-text">
        <span className="DesignsSidebar__row-name">{design.name}</span>
        <span className="DesignsSidebar__row-time">
          {formatRelativeTime(design.updatedAt)}
        </span>
      </span>
      {current && (
        <span className="DesignsSidebar__row-check" aria-hidden>
          {CheckIcon}
        </span>
      )}
    </button>
  );
};

export type DesignsSidebarProps = {
  /** only what is shown – the editor passes a memoised view so the sidebar element is stable */
  project: Pick<Project, "id" | "name" | "emoji">;
  design: Pick<Design, "id">;
  /** stores pending edits of the current design before navigating away */
  flush: () => Promise<void>;
};

/**
 * Excalidraw `<Sidebar>` listing the current project's designs for quick
 * switching, with a project switcher and new / duplicate actions.
 */
export const DesignsSidebar = ({
  project,
  design,
  flush,
}: DesignsSidebarProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [docked, setDocked] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: designs } = useLiveQuery(
    () => listDesigns(project.id),
    ["designs"],
    [project.id],
  );
  const { data: projects } = useLiveQuery(listProjects, ["projects"]);

  const visibleDesigns = useMemo(
    () =>
      sortDesigns(
        (designs ?? []).filter((d) => !d.archivedAt && matchesSearch(d, query)),
        settings.designsSort,
      ),
    [designs, query, settings.designsSort],
  );

  const visibleProjects = useMemo(
    () =>
      sortProjects(
        (projects ?? []).filter((p) => !p.archivedAt),
        settings.projectsSort,
      ),
    [projects, settings.projectsSort],
  );

  const goTo = useCallback(
    async (path: string) => {
      await flush();
      navigate(path);
    },
    [flush, navigate],
  );

  const openDesign = useCallback(
    (target: Design) => {
      if (target.id !== design.id) {
        void goTo(designPath(target.projectId, target.id));
      }
    },
    [design.id, goTo],
  );

  const switchProject = async (target: Project) => {
    if (target.id === project.id) {
      return;
    }
    const candidates = sortDesigns(
      (await listDesigns(target.id)).filter((d) => !d.archivedAt),
      "updatedAt",
    );
    await goTo(
      candidates.length
        ? designPath(target.id, candidates[0].id)
        : `/p/${target.id}`,
    );
  };

  const run = async (action: () => Promise<void>, failure: string) => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await action();
    } catch (error) {
      console.error(error);
      showToast(failure, { kind: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onNewDesign = () =>
    run(async () => {
      await flush();
      const created = await createDesign({ projectId: project.id });
      navigate(designPath(project.id, created.id));
    }, "Could not create the design.");

  const onDuplicate = () =>
    run(async () => {
      await flush();
      const copy = await duplicateDesign(design.id);
      navigate(designPath(project.id, copy.id));
    }, "Could not duplicate the design.");

  return (
    <Sidebar
      name={DESIGNS_SIDEBAR_NAME}
      docked={docked}
      onDock={setDocked}
      className="DesignsSidebar"
    >
      <Sidebar.Header>
        <div className="DesignsSidebar__title">Designs</div>
      </Sidebar.Header>
      <div className="DesignsSidebar__body">
        <div className="DesignsSidebar__controls">
          <DropdownMenu
            placement="bottom-start"
            className="DesignsSidebar__project-menu"
            trigger={(props) => (
              <button
                {...props}
                type="button"
                className="DesignsSidebar__project"
                title="Switch project"
              >
                <span className="DesignsSidebar__project-emoji" aria-hidden>
                  {project.emoji}
                </span>
                <span className="DesignsSidebar__project-name">
                  {project.name}
                </span>
                {ChevronDownIcon}
              </button>
            )}
          >
            {visibleProjects.map((p) => (
              <DropdownMenu.Item
                key={p.id}
                icon={<span aria-hidden>{p.emoji}</span>}
                selected={p.id === project.id}
                onSelect={() => void switchProject(p)}
              >
                {p.name}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu>
          <TextField
            value={query}
            onChange={setQuery}
            placeholder="Search designs"
            icon={SearchIcon}
            size="compact"
            type="search"
            fullWidth
          />
        </div>
        <div className="DesignsSidebar__list" role="list">
          {visibleDesigns.map((d) => (
            <div key={d.id} role="listitem">
              <DesignRow
                design={d}
                current={d.id === design.id}
                onOpen={openDesign}
              />
            </div>
          ))}
          {designs && !visibleDesigns.length && (
            <div className="DesignsSidebar__empty">
              {query ? "No designs match your search." : "No designs yet."}
            </div>
          )}
        </div>
        <div className="DesignsSidebar__footer">
          <FilledButton
            label="New design"
            icon={PlusIcon}
            fullWidth
            disabled={busy}
            onClick={onNewDesign}
          />
          <FilledButton
            label="Duplicate current"
            icon={CopyIcon}
            variant="outlined"
            fullWidth
            disabled={busy}
            onClick={onDuplicate}
          />
        </div>
      </div>
    </Sidebar>
  );
};
