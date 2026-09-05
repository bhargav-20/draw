import { SortableGrid } from "../layout/SortableGrid";

import { ProjectCard } from "./ProjectCard";

import type { SortableMove } from "../layout/SortableGrid";
import type { ProjectCardProps } from "./ProjectCard";

import type { Project } from "../../types";

type ProjectGridProps = {
  projects: Project[];
  designCounts: ReadonlyMap<string, number>;
  onReorder: (move: SortableMove) => void;
  onTagClick?: (tag: string) => void;
  /** per-card action callbacks */
  actions: (
    project: Project,
  ) => Omit<
    ProjectCardProps,
    "project" | "designCount" | "sortable" | "onTagClick"
  >;
};

/** Drag-sortable grid of project cards. */
export const ProjectGrid = ({
  projects,
  designCounts,
  onReorder,
  onTagClick,
  actions,
}: ProjectGridProps) => (
  <SortableGrid
    items={projects}
    onReorder={onReorder}
    renderItem={(project, sortable) => (
      <ProjectCard
        project={project}
        designCount={designCounts.get(project.id) ?? 0}
        sortable={sortable}
        onTagClick={onTagClick}
        {...actions(project)}
      />
    )}
  />
);
