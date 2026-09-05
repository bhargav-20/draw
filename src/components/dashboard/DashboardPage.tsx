import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { exportBackup } from "../../data/backup";
import {
  createProject,
  deleteProjectPermanently,
  getAllTags,
  reorderProjects,
  setProjectArchived,
  sortProjects,
  updateProject,
} from "../../data/projects";
import { useAllDesigns } from "../../hooks/useDesigns";
import { useProjects } from "../../hooks/useProjects";
import { useSettings } from "../../hooks/useSettings";
import { downloadBlob, matchesSearch, pluralize } from "../../utils";
import { ExportAllButton } from "../backup/ExportAllButton";
import { ImportBackupDialog } from "../backup/ImportBackupDialog";
import { GridIcon, LockIcon, PlusIcon, SearchIcon, UploadIcon } from "../icons";
import { AppShell } from "../layout/AppShell";
import { EmptyState } from "../layout/EmptyState";
import { applyMove } from "../layout/SortableGrid";
import {
  ConfirmDialog,
  FilledButton,
  IconButton,
  Switch,
  useToast,
} from "../ui";

import { DesignSearchResults } from "./DesignSearchResults";
import { ProjectDialog } from "./ProjectDialog";
import { ProjectGrid } from "./ProjectGrid";
import { SearchBox } from "./SearchBox";
import { SortMenu } from "./SortMenu";

import "./DashboardPage.scss";

import type { SortableMove } from "../layout/SortableGrid";
import type { DesignSearchResult } from "./DesignSearchResults";
import type { ProjectFormValues } from "./ProjectDialog";

import type { Project } from "../../types";

type DialogState =
  | { kind: "create" }
  | { kind: "edit"; project: Project }
  | { kind: "delete"; project: Project }
  | { kind: "import" }
  | null;

const MAX_DESIGN_RESULTS = 24;

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { projects, loading } = useProjects();
  const { designs: allDesigns } = useAllDesigns();
  const { settings, updateSettings } = useSettings();
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

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

  const allProjects = useMemo(() => projects ?? [], [projects]);
  const trimmedQuery = query.trim();

  const designCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const design of allDesigns ?? []) {
      if (!design.archivedAt) {
        counts.set(design.projectId, (counts.get(design.projectId) ?? 0) + 1);
      }
    }
    return counts;
  }, [allDesigns]);

  const tagSuggestions = useMemo(() => getAllTags(allProjects), [allProjects]);

  const visibleProjects = useMemo(
    () =>
      sortProjects(
        allProjects.filter(
          (project) =>
            (settings.showArchivedProjects || !project.archivedAt) &&
            matchesSearch(project, trimmedQuery),
        ),
        settings.projectsSort,
      ),
    [
      allProjects,
      settings.showArchivedProjects,
      settings.projectsSort,
      trimmedQuery,
    ],
  );

  const designResults = useMemo<DesignSearchResult[]>(() => {
    if (!trimmedQuery) {
      return [];
    }
    const byId = new Map(allProjects.map((project) => [project.id, project]));
    return (allDesigns ?? [])
      .filter(
        (design) => !design.archivedAt && matchesSearch(design, trimmedQuery),
      )
      .map((design) => ({ design, project: byId.get(design.projectId) }))
      .filter(
        (result): result is DesignSearchResult =>
          !!result.project && !result.project.archivedAt,
      )
      .sort((a, b) => b.design.updatedAt - a.design.updatedAt)
      .slice(0, MAX_DESIGN_RESULTS);
  }, [allDesigns, allProjects, trimmedQuery]);

  const openProject = (project: Project) => navigate(`/p/${project.id}`);

  const handleCreate = async (values: ProjectFormValues) => {
    await run(async () => {
      const project = await createProject(values);
      closeDialog();
      navigate(`/p/${project.id}`);
    }, "Could not create the project");
  };

  const handleEdit = async (project: Project, values: ProjectFormValues) => {
    await run(async () => {
      await updateProject(project.id, values);
      closeDialog();
    }, "Could not save the project");
  };

  const handleExport = (project: Project) =>
    run(async () => {
      const { blob, filename } = await exportBackup([project.id]);
      downloadBlob(blob, filename);
      showToast(`Exported “${project.name}”`, { kind: "success" });
    }, "Export failed");

  const handleArchiveToggle = (project: Project) =>
    run(async () => {
      const archived = !project.archivedAt;
      await setProjectArchived(project.id, archived);
      showToast(
        archived ? `Archived “${project.name}”` : `Restored “${project.name}”`,
        { kind: "success" },
      );
    }, "Could not update the project");

  const handleDelete = (project: Project) =>
    run(async () => {
      await deleteProjectPermanently(project.id);
      closeDialog();
      showToast(`Deleted “${project.name}”`, { kind: "success" });
    }, "Could not delete the project");

  const handleReorder = (move: SortableMove) =>
    run(async () => {
      // the grid may be filtered: apply the drop to every project (in the
      // order the user currently sees) so hidden ones keep their place
      const ids = sortProjects(allProjects, settings.projectsSort).map(
        (project) => project.id,
      );
      await reorderProjects(applyMove(ids, move));
      if (settings.projectsSort !== "manual") {
        await updateSettings({ projectsSort: "manual" });
        showToast("Sorted manually");
      }
    }, "Could not save the new order");

  const hasProjects = allProjects.length > 0;
  const hasArchivedOnly =
    hasProjects && allProjects.every((project) => !!project.archivedAt);

  const renderContent = () => {
    if (loading) {
      return null;
    }
    if (!hasProjects) {
      return (
        <EmptyState
          icon={GridIcon}
          title="Create your first project"
          description="A project groups every iteration of one piece of work. Designs inside it are Excalidraw scenes."
          actions={
            <FilledButton
              label="Create your first project"
              icon={PlusIcon}
              size="large"
              onClick={() => setDialog({ kind: "create" })}
            />
          }
        />
      );
    }
    if (!visibleProjects.length && !designResults.length) {
      if (trimmedQuery) {
        return (
          <EmptyState
            icon={SearchIcon}
            title={`No projects match “${trimmedQuery}”`}
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
      if (hasArchivedOnly && !settings.showArchivedProjects) {
        return (
          <EmptyState
            icon={GridIcon}
            title="All projects are archived"
            description="Turn on “Show archived” to restore one, or start something new."
            actions={
              <FilledButton
                label="New project"
                icon={PlusIcon}
                onClick={() => setDialog({ kind: "create" })}
              />
            }
          />
        );
      }
    }
    return (
      <>
        {visibleProjects.length > 0 && (
          <ProjectGrid
            projects={visibleProjects}
            designCounts={designCounts}
            onReorder={handleReorder}
            onTagClick={(tag) => setQuery(`#${tag}`)}
            actions={(project) => ({
              onOpen: () => openProject(project),
              onEdit: () => setDialog({ kind: "edit", project }),
              onExport: () => handleExport(project),
              onArchiveToggle: () => handleArchiveToggle(project),
              onDelete: () => setDialog({ kind: "delete", project }),
            })}
          />
        )}
        {trimmedQuery && !visibleProjects.length && (
          <div className="muted">No projects match “{trimmedQuery}”.</div>
        )}
        <DesignSearchResults
          results={designResults}
          onOpen={({ design }) =>
            navigate(`/p/${design.projectId}/d/${design.id}`)
          }
        />
      </>
    );
  };

  return (
    <AppShell
      className="DashboardPage"
      headerCenter={
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search projects, designs, #tags"
        />
      }
      headerRight={
        <>
          <IconButton
            icon={UploadIcon}
            label="Import backup"
            onClick={() => setDialog({ kind: "import" })}
          />
          <ExportAllButton />
          <FilledButton
            label="New project"
            icon={PlusIcon}
            onClick={() => setDialog({ kind: "create" })}
          >
            <span className="ButtonText--collapsible">New project</span>
          </FilledButton>
        </>
      }
    >
      <div className="PageTitle">
        <h1>Projects</h1>
        {hasProjects && (
          <span className="PageTitle__count">{visibleProjects.length}</span>
        )}
        <div className="PageTitle__spacer" />
        <Switch
          name="show-archived-projects"
          label="Show archived"
          checked={settings.showArchivedProjects}
          onChange={(value) =>
            void updateSettings({ showArchivedProjects: value })
          }
        />
        <SortMenu
          value={settings.projectsSort}
          onChange={(sort) => void updateSettings({ projectsSort: sort })}
        />
      </div>

      {renderContent()}

      <div className="StorageNote">
        {LockIcon}
        <span>
          Everything is stored in this browser (IndexedDB). Export a backup to
          keep a copy on disk.
        </span>
      </div>

      <ProjectDialog
        open={dialog?.kind === "create" || dialog?.kind === "edit"}
        onClose={closeDialog}
        project={dialog?.kind === "edit" ? dialog.project : undefined}
        tagSuggestions={tagSuggestions}
        onSubmit={(values) =>
          dialog?.kind === "edit"
            ? handleEdit(dialog.project, values)
            : handleCreate(values)
        }
      />

      <ConfirmDialog
        open={dialog?.kind === "delete"}
        onClose={closeDialog}
        title="Delete project permanently?"
        confirmLabel="Delete permanently"
        danger
        onConfirm={() =>
          dialog?.kind === "delete" ? handleDelete(dialog.project) : undefined
        }
      >
        {dialog?.kind === "delete" && (
          <>
            “{dialog.project.name}” and its{" "}
            {pluralize(
              (allDesigns ?? []).filter(
                (design) => design.projectId === dialog.project.id,
              ).length,
              "design",
            )}{" "}
            will be removed from this browser. This cannot be undone – export
            the project first if you want to keep a copy.
          </>
        )}
      </ConfirmDialog>

      <ImportBackupDialog
        open={dialog?.kind === "import"}
        onClose={closeDialog}
        localProjectCount={allProjects.length}
      />
    </AppShell>
  );
};
