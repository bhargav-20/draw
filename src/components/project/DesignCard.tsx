import clsx from "clsx";
import { Link } from "react-router";

import { useThumbnailUrl } from "../../hooks/useThumbnailUrl";
import { formatRelativeTime } from "../../utils";
import { GridIcon, GripIcon } from "../icons";
import { Island, Tag, TagList } from "../ui";

import { DesignMenu } from "./DesignMenu";

import "./DesignCard.scss";

import type { SortableItemHandle } from "../layout/SortableGrid";
import type { DesignMenuActions } from "./DesignMenu";

import type { Design } from "../../types";

export type DesignCardProps = {
  design: Design;
  onTagClick?: (tag: string) => void;
  /** present when the card lives in a `SortableGrid` */
  sortable?: SortableItemHandle;
} & DesignMenuActions;

export const DesignCard = ({
  design,
  onTagClick,
  sortable,
  ...actions
}: DesignCardProps) => {
  const thumbnailUrl = useThumbnailUrl(design);
  const archived = !!design.archivedAt;

  // The title is the only link; `.DesignCard__link::after` stretches its
  // hit area over the whole card while the buttons sit above it (z-index).
  return (
    <Island
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={clsx("DesignCard", {
        "DesignCard--archived": archived,
        "DesignCard--dragging": sortable?.isDragging,
      })}
      {...sortable?.pointerProps}
    >
      <div className="DesignCard__thumbnail">
        {thumbnailUrl ? (
          <img
            className="DesignCard__image"
            src={thumbnailUrl}
            alt=""
            draggable={false}
          />
        ) : (
          <div className="DesignCard__placeholder" aria-hidden>
            {GridIcon}
            <span>
              {design.sceneVersion ? "No preview yet" : "Empty canvas"}
            </span>
          </div>
        )}
      </div>
      <div className="DesignCard__body">
        <div className="DesignCard__row">
          <div className="DesignCard__text">
            <div className="DesignCard__title">
              <Link
                to={`/p/${design.projectId}/d/${design.id}`}
                className="DesignCard__link text-ellipsis"
                aria-label={`Open design ${design.name}`}
                draggable={false}
              >
                {design.name}
              </Link>
            </div>
            <div className="DesignCard__meta muted">
              edited {formatRelativeTime(design.updatedAt)}
            </div>
          </div>
          <div className="DesignCard__actions">
            {sortable && (
              <button
                type="button"
                className="IconButton IconButton--ghost IconButton--sm DesignCard__handle"
                aria-label={`Drag to reorder ${design.name}`}
                title="Drag to reorder"
                {...sortable.handleProps}
              >
                {GripIcon}
              </button>
            )}
            <DesignMenu design={design} {...actions} />
          </div>
        </div>
        {(archived || design.tags.length > 0) && (
          <div className="DesignCard__tags">
            {archived && <Tag label="Archived" className="Tag--archived" />}
            <TagList tags={design.tags} onTagClick={onTagClick} />
          </div>
        )}
      </div>
    </Island>
  );
};
