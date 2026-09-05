import clsx from "clsx";
import React from "react";
import { Link } from "react-router";

import { useThumbnailUrl } from "../../hooks/useThumbnailUrl";
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

import type { Design, Project } from "../../types";

/** the fan is at most three sheets; more would just thicken the stack */
export const PROJECT_PREVIEW_COUNT = 3;

/** degrees / vertical offset per sheet, so 1–3 previews all sit centred */
const FAN = [[0], [-5, 5], [-7, 0, 7]];
const LIFT = [[0], [3, 3], [4, -4, 4]];

/** One sheet of the fan: a design's thumbnail, or blank paper when it has none. */
const PreviewSheet = ({
  design,
  index,
  count,
}: {
  design: Design;
  index: number;
  count: number;
}) => {
  const url = useThumbnailUrl(design);
  return (
    <div
      className="ProjectCard__sheet"
      style={{
        transform: `rotate(${FAN[count - 1][index]}deg) translateY(${
          LIFT[count - 1][index]
        }px)`,
        zIndex: FAN[count - 1][index] === 0 ? 1 : undefined,
      }}
    >
      {url && <img className="ProjectCard__sheet-image" src={url} alt="" />}
    </div>
  );
};

export type ProjectCardProps = {
  project: Project;
  designCount: number;
  /** up to `PROJECT_PREVIEW_COUNT` designs, most recently edited first */
  previews?: Design[];
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
  previews = [],
  onOpen,
  onEdit,
  onExport,
  onArchiveToggle,
  onDelete,
  onTagClick,
  sortable,
}: ProjectCardProps) => {
  const archived = !!project.archivedAt;
  const sheets = previews.slice(0, PROJECT_PREVIEW_COUNT);

  // The title is the only link; `.ProjectCard__link::after` stretches its
  // hit area over the whole card while the buttons sit above it (z-index).
  return (
    <Island
      ref={sortable?.setNodeRef}
      style={
        {
          ...sortable?.style,
          "--card-accent": `var(--pc-${project.color})`,
          "--card-accent-bg": `var(--pc-${project.color}-bg)`,
        } as React.CSSProperties
      }
      className={clsx("ProjectCard", {
        "ProjectCard--archived": archived,
        "ProjectCard--dragging": sortable?.isDragging,
      })}
      {...sortable?.pointerProps}
    >
      {/* the project's own designs are the artwork – an icon would say less */}
      <div className="ProjectCard__preview" aria-hidden>
        {sheets.length ? (
          <div className="ProjectCard__fan">
            {sheets.map((design, index) => (
              <PreviewSheet
                key={design.id}
                design={design}
                index={index}
                count={sheets.length}
              />
            ))}
          </div>
        ) : (
          <span className="ProjectCard__preview-empty">No designs yet</span>
        )}
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
      <div className="ProjectCard__body">
        <div className="ProjectCard__title">
          <span className="ProjectCard__emoji" aria-hidden>
            {project.emoji}
          </span>
          <Link
            to={`/p/${project.id}`}
            className="ProjectCard__link text-ellipsis"
            aria-label={`Open project ${project.name}`}
            draggable={false}
          >
            {project.name}
          </Link>
        </div>
        <div className="ProjectCard__foot">
          <span className="ProjectCard__meta muted">
            {pluralize(designCount, "design")} · edited{" "}
            {formatRelativeTime(project.updatedAt)}
          </span>
          {(archived || project.tags.length > 0) && (
            <div className="ProjectCard__tags">
              {archived && <Tag label="Archived" className="Tag--archived" />}
              <TagList tags={project.tags} onTagClick={onTagClick} />
            </div>
          )}
        </div>
      </div>
    </Island>
  );
};
