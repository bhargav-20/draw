import clsx from "clsx";
import { Link } from "react-router";

import { formatRelativeTime, pluralize } from "../../utils";
import {
  ArchiveIcon,
  ArrowRightIcon,
  DotsIcon,
  DownloadIcon,
  GripIcon,
  PencilIcon,
  RestoreIcon,
  TrashIcon,
} from "../icons";
import { DropdownMenu, IconButton, Island, Tag, TagList } from "../ui";

import "./ProjectCard.scss";

import type { SortableItemHandle } from "../layout/SortableGrid";

import type { Project } from "../../types";

export type ProjectCardProps = {
  project: Project;
  designCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onExport: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onTagClick?: (tag: string) => void;
  /** present when the card lives in a `SortableGrid` */
  sortable?: SortableItemHandle;
};

export const ProjectCard = ({
  project,
  designCount,
  onOpen,
  onEdit,
  onExport,
  onArchiveToggle,
  onDelete,
  onTagClick,
  sortable,
}: ProjectCardProps) => {
  const archived = !!project.archivedAt;

  // The title is the only link; `.ProjectCard__link::after` stretches its
  // hit area over the whole card while the buttons sit above it (z-index).
  return (
    <Island
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={clsx("ProjectCard", {
        "ProjectCard--archived": archived,
        "ProjectCard--dragging": sortable?.isDragging,
      })}
      {...sortable?.pointerProps}
    >
      <div className="ProjectCard__top">
        <div
          className="ProjectCard__emoji"
          style={{ background: `var(--pc-${project.color}-bg)` }}
          aria-hidden
        >
          {project.emoji}
        </div>
        <div className="ProjectCard__actions">
          {sortable && (
            <button
              type="button"
              className="IconButton IconButton--ghost IconButton--sm ProjectCard__handle"
              aria-label={`Drag to reorder ${project.name}`}
              title="Drag to reorder"
              {...sortable.handleProps}
            >
              {GripIcon}
            </button>
          )}
          <DropdownMenu
            trigger={(props) => (
              <IconButton
                {...props}
                variant="ghost"
                size="sm"
                icon={DotsIcon}
                label={`Project actions for ${project.name}`}
              />
            )}
          >
            <DropdownMenu.Item icon={ArrowRightIcon} onSelect={onOpen}>
              Open
            </DropdownMenu.Item>
            <DropdownMenu.Item icon={PencilIcon} onSelect={onEdit}>
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item icon={DownloadIcon} onSelect={onExport}>
              Export project
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              icon={archived ? RestoreIcon : ArchiveIcon}
              onSelect={onArchiveToggle}
            >
              {archived ? "Restore" : "Archive"}
            </DropdownMenu.Item>
            <DropdownMenu.Item icon={TrashIcon} onSelect={onDelete} danger>
              Delete permanently
            </DropdownMenu.Item>
          </DropdownMenu>
        </div>
      </div>
      <div className="ProjectCard__body">
        <div className="ProjectCard__title">
          <Link
            to={`/p/${project.id}`}
            className="ProjectCard__link text-ellipsis"
            aria-label={`Open project ${project.name}`}
            draggable={false}
          >
            {project.name}
          </Link>
        </div>
        <div className="ProjectCard__meta muted">
          {pluralize(designCount, "design")} · edited{" "}
          {formatRelativeTime(project.updatedAt)}
        </div>
      </div>
      {(archived || project.tags.length > 0) && (
        <div className="ProjectCard__tags">
          {archived && <Tag label="Archived" className="Tag--archived" />}
          <TagList tags={project.tags} onTagClick={onTagClick} />
        </div>
      )}
    </Island>
  );
};
