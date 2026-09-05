import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
  createDesign,
  deleteDesignPermanently,
  duplicateDesign,
  moveDesignToProject,
  reorderDesigns,
  setDesignArchived,
  sortDesigns,
  updateDesign,
} from "../../data/designs";
import {
  deleteProjectPermanently,
  getAllTags,
  setProjectArchived,
  updateProject,
} from "../../data/projects";
import { useDesigns } from "../../hooks/useDesigns";
import { useProject, useProjects } from "../../hooks/useProjects";
import { useSettings } from "../../hooks/useSettings";
import { matchesSearch, pluralize } from "../../utils";
import { ExportProjectButton } from "../backup/ExportProjectButton";
import { ImportExcalidrawButton } from "../backup/ImportExcalidrawButton";
import { ProjectDialog } from "../dashboard/ProjectDialog";
import { SearchBox } from "../dashboard/SearchBox";
import { SortMenu } from "../dashboard/SortMenu";
import { GridIcon, PlusIcon, SearchIcon } from "../icons";
import { AppShell } from "../layout/AppShell";
import { EmptyState } from "../layout/EmptyState";
import { NotFound } from "../layout/NotFound";
import { applyMove } from "../layout/SortableGrid";
import { ConfirmDialog, FilledButton, Switch, useToast } from "../ui";

import { DesignGrid } from "./DesignGrid";
import { EditTagsDialog } from "./EditTagsDialog";
import { MoveDesignDialog } from "./MoveDesignDialog";
import { NewDesignCard } from "./NewDesignCard";
import { ProjectHeader } from "./ProjectHeader";
import { RenameDialog } from "./RenameDialog";

import "./ProjectPage.scss";

import type { ProjectFormValues } from "../dashboard/ProjectDialog";
import type { SortableMove } from "../layout/SortableGrid";

import type { Design, ProjectId } from "../../types";

type DialogState =
  | { kind: "rename"; design: Design }
  | { kind: "tags"; design: Design }
  | { kind: "move"; design: Design }
  | { kind: "delete-design"; design: Design }
  | { kind: "edit-project" }
  | { kind: "delete-project" }
  | null;

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const ProjectPage = () => {
  const { projectId = "" } = useParams<"projectId">();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { project, loading } = useProject(projectId);
  const { designs } = useDesigns(projectId);
  const { projects } = useProjects();
  const { settings, updateSettings } = useSettings();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [creating, setCreating] = useState(false);

  const closeDialog = useCallback(() => setDialog(null), []);

  /** runs a data action and reports failures as a toast */
  const run = useCallback(
    async (action: () => Promise<unknown>, failureMessage: string) => {
      try {
        await action();
      } catch (error) {
        showToast(`${failureMessage}: ${describeError(error)}`, {
          kind: "error",
        });
      }
    },
    [showToast],
  );

  const allDesigns = useMemo(() => designs ?? [], [designs]);
  const trimmedQuery = query.trim();

  const activeCount = useMemo(
    () => allDesigns.filter((design) => !design.archivedAt).length,
    [allDesigns],
  );

  const visibleDesigns = useMemo(
    () =>
      sortDesigns(
        allDesigns.filter(
          (design) =>
            (settings.showArchivedDesigns || !design.archivedAt) &&
            matchesSearch(design, trimmedQuery),
        ),
        settings.designsSort,
      ),
    [
      allDesigns,
      settings.showArchivedDesigns,
      settings.designsSort,
      trimmedQuery,
    ],
  );

  const otherProjects = useMemo(
    () =>
      (projects ?? []).filter(
        (candidate) => candidate.id !== projectId && !candidate.archivedAt,
      ),
    [projects, projectId],
  );

  const tagSuggestions = useMemo(
    () => getAllTags([...(projects ?? []), ...allDesigns]),
    [projects, allDesigns],
  );

  if (!project) {
    if (loading) {
      return <AppShell className="ProjectPage">{null}</AppShell>;
    }
    return (
      <NotFound
        title="Project not found"
        description="This project does not exist in this browser's storage – it may have been deleted, or the link belongs to another browser."
      />
    );
  }

  const openDesign = (design: Pick<Design, "id">) =>
    navigate(`/p/${project.id}/d/${design.id}`);

  const handleNewDesign = () => {
    if (creating) {
      return;
    }
    setCreating(true);
    void run(async () => {
      const design = await createDesign({ projectId: project.id });
      openDesign(design);
    }, "Could not create the design").finally(() => setCreating(false));
  };

  const handleDuplicate = (design: Design) =>
    run(async () => {
      const copy = await duplicateDesign(design.id);
      showToast(`Duplicated as “${copy.name}”`, { kind: "success" });
    }, "Could not duplicate the design");

  const handleRename = (design: Design, name: string) =>
    run(async () => {
      await updateDesign(design.id, { name });
      closeDialog();
    }, "Could not rename the design");

  const handleEditTags = (design: Design, tags: string[]) =>
    run(async () => {
      await updateDesign(design.id, { tags });
      closeDialog();
    }, "Could not save the tags");

  const handleMove = (design: Design, targetId: ProjectId) =>
    run(async () => {
      await moveDesignToProject(design.id, targetId);
      const target = otherProjects.find(
        (candidate) => candidate.id === targetId,
      );
      closeDialog();
      showToast(
        `Moved “${design.name}” to ${target ? `“${target.name}”` : "project"}`,
        { kind: "success" },
      );
    }, "Could not move the design");

  const handleArchiveToggle = (design: Design) =>
    run(async () => {
      const archived = !design.archivedAt;
      await setDesignArchived(design.id, archived);
      showToast(
        archived ? `Archived “${design.name}”` : `Restored “${design.name}”`,
        { kind: "success" },
      );
    }, "Could not update the design");

  const handleDeleteDesign = (design: Design) =>
    run(async () => {
      await deleteDesignPermanently(design.id);
      closeDialog();
      showToast(`Deleted “${design.name}”`, { kind: "success" });
    }, "Could not delete the design");

  const handleReorder = (move: SortableMove) =>
    run(async () => {
      // the grid may be filtered: apply the drop to every design (in the
      // order the user currently sees) so hidden ones keep their place
      const ids = sortDesigns(allDesigns, settings.designsSort).map(
        (design) => design.id,
      );
      await reorderDesigns(project.id, applyMove(ids, move));
      if (settings.designsSort !== "manual") {
        await updateSettings({ designsSort: "manual" });
        showToast("Sorted manually");
      }
    }, "Could not save the new order");

  const handleRenameProject = (name: string) =>
    run(
      () => updateProject(project.id, { name }),
      "Could not rename the project",
    );

  const handleEditProject = (values: ProjectFormValues) =>
    run(async () => {
      await updateProject(project.id, values);
      closeDialog();
    }, "Could not save the project");

  const handleArchiveProject = () =>
    run(async () => {
      const archived = !project.archivedAt;
      await setProjectArchived(project.id, archived);
      showToast(
        archived ? `Archived “${project.name}”` : `Restored “${project.name}”`,
        { kind: "success" },
      );
    }, "Could not update the project");

  const handleDeleteProject = () =>
    run(async () => {
      await deleteProjectPermanently(project.id);
      closeDialog();
      showToast(`Deleted “${project.name}”`, { kind: "success" });
      navigate("/");
    }, "Could not delete the project");

  const designActions = (design: Design) => ({
    onOpen: () => openDesign(design),
    onDuplicate: () => handleDuplicate(design),
    onRename: () => setDialog({ kind: "rename", design }),
    onEditTags: () => setDialog({ kind: "tags", design }),
    onMove: () => setDialog({ kind: "move", design }),
    onArchiveToggle: () => handleArchiveToggle(design),
    onDelete: () => setDialog({ kind: "delete-design", design }),
  });

  const renderContent = () => {
    if (!designs) {
      return null;
    }
    if (!allDesigns.length) {
      return (
        <EmptyState
          icon={GridIcon}
          title="Create your first design"
          description="A design is one Excalidraw canvas. Duplicate it later to branch a new iteration."
          actions={
            <>
              <FilledButton
                label="Create your first design"
                icon={PlusIcon}
                size="large"
                onClick={handleNewDesign}
                disabled={creating}
              />
              <ImportExcalidrawButton projectId={project.id} />
            </>
          }
        />
      );
    }
    if (!visibleDesigns.length) {
      if (trimmedQuery) {
        return (
          <EmptyState
            icon={SearchIcon}
            title={`No designs match “${trimmedQuery}”`}
            description="Try another name or tag, or clear the search."
            actions={
              <FilledButton
                label="Clear search"
                variant="outlined"
                onClick={() => setQuery("")}
              />
            }
          />
        );
      }
      if (!settings.showArchivedDesigns) {
        return (
          <EmptyState
            icon={GridIcon}
            title="All designs are archived"
            description="Turn on “Show archived” to restore one, or start a new design."
            actions={
              <FilledButton
                label="New design"
                icon={PlusIcon}
                onClick={handleNewDesign}
                disabled={creating}
              />
            }
          />
        );
      }
    }
    return (
      <DesignGrid
        designs={visibleDesigns}
        onReorder={handleReorder}
        onTagClick={(tag) => setQuery(`#${tag}`)}
        actions={designActions}
        leading={
          <NewDesignCard onClick={handleNewDesign} disabled={creating} />
        }
      />
    );
  };

  const dialogDesign = dialog && "design" in dialog ? dialog.design : null;

  return (
    <AppShell className="ProjectPage">
      <ProjectHeader
        project={project}
        designCount={activeCount}
        onRename={handleRenameProject}
        onEdit={() => setDialog({ kind: "edit-project" })}
        onArchiveToggle={handleArchiveProject}
        onDelete={() => setDialog({ kind: "delete-project" })}
        onTagClick={(tag) => setQuery(`#${tag}`)}
        actions={
          <>
            <ImportExcalidrawButton projectId={project.id} />
            <ExportProjectButton project={project} />
          </>
        }
      />

      <div className="Toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search designs"
          narrow
        />
        <SortMenu
          value={settings.designsSort}
          onChange={(sort) => void updateSettings({ designsSort: sort })}
        />
        <Switch
          name="show-archived-designs"
          label="Show archived"
          checked={settings.showArchivedDesigns}
          onChange={(value) =>
            void updateSettings({ showArchivedDesigns: value })
          }
        />
        <div className="Toolbar__spacer" />
        <FilledButton
          label="New design"
          icon={PlusIcon}
          onClick={handleNewDesign}
          disabled={creating}
        >
          <span className="ButtonText--collapsible">New design</span>
        </FilledButton>
      </div>

      {renderContent()}

      <RenameDialog
        open={dialog?.kind === "rename"}
        onClose={closeDialog}
        value={dialog?.kind === "rename" ? dialog.design.name : ""}
        onSubmit={(name) =>
          dialog?.kind === "rename"
            ? handleRename(dialog.design, name)
            : undefined
        }
      />

      <EditTagsDialog
        open={dialog?.kind === "tags"}
        onClose={closeDialog}
        value={dialog?.kind === "tags" ? dialog.design.tags : []}
        suggestions={tagSuggestions}
        onSubmit={(tags) =>
          dialog?.kind === "tags"
            ? handleEditTags(dialog.design, tags)
            : undefined
        }
      />

      <MoveDesignDialog
        open={dialog?.kind === "move"}
        onClose={closeDialog}
        design={dialog?.kind === "move" ? dialog.design : null}
        projects={otherProjects}
        onSubmit={(targetId) =>
          dialog?.kind === "move"
            ? handleMove(dialog.design, targetId)
            : undefined
        }
      />

      <ConfirmDialog
        open={dialog?.kind === "delete-design"}
        onClose={closeDialog}
        title="Delete design permanently?"
        confirmLabel="Delete permanently"
        danger
        onConfirm={() =>
          dialog?.kind === "delete-design"
            ? handleDeleteDesign(dialog.design)
            : undefined
        }
      >
        “{dialogDesign?.name}” and its scene will be removed from this browser.
        This cannot be undone.
      </ConfirmDialog>

      <ProjectDialog
        open={dialog?.kind === "edit-project"}
        onClose={closeDialog}
        project={project}
        tagSuggestions={tagSuggestions}
        onSubmit={handleEditProject}
      />

      <ConfirmDialog
        open={dialog?.kind === "delete-project"}
        onClose={closeDialog}
        title="Delete project permanently?"
        confirmLabel="Delete permanently"
        danger
        onConfirm={handleDeleteProject}
      >
        “{project.name}” and its {pluralize(allDesigns.length, "design")} will
        be removed from this browser. This cannot be undone – export the project
        first if you want to keep a copy.
      </ConfirmDialog>
    </AppShell>
  );
};
