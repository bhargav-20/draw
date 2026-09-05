import clsx from "clsx";
import { Link } from "react-router";

import { useInlineRename } from "../../hooks/useInlineRename";
import { useThumbnailUrl } from "../../hooks/useThumbnailUrl";
import { formatRelativeTime } from "../../utils";
import { GripIcon, PencilIcon, RectangleIcon } from "../icons";
import { IconButton, Island, Tag, TagList, TextField } from "../ui";

import { DesignMenu } from "./DesignMenu";

import "./DesignCard.scss";

import type { SortableItemHandle } from "../layout/SortableGrid";
import type { DesignMenuActions } from "./DesignMenu";

import type { Design } from "../../types";

/** Like `DesignMenuActions`, but renaming happens on the card itself. */
export type DesignCardActions = Omit<DesignMenuActions, "onRename"> & {
  /** commits an inline rename (Enter or blur on the title field) */
  onRename: (name: string) => void;
};

export type DesignCardProps = {
  design: Design;
  onTagClick?: (tag: string) => void;
  /** present when the card lives in a `SortableGrid` */
  sortable?: SortableItemHandle;
} & DesignCardActions;

export const DesignCard = ({
  design,
  onRename,
  onTagClick,
  sortable,
  ...actions
}: DesignCardProps) => {
  const thumbnailUrl = useThumbnailUrl(design);
  const rename = useInlineRename(design.name, onRename);
  const archived = !!design.archivedAt;

  // The title is the only link; `.DesignCard__link::after` stretches its
  // hit area over the whole card while the buttons sit above it (z-index).
  // While renaming there is no link, so the card stops being clickable and
  // the drag listener is detached (it would swallow drags inside the input).
  return (
    <Island
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={clsx("DesignCard", {
        "DesignCard--archived": archived,
        "DesignCard--dragging": sortable?.isDragging,
        "DesignCard--editing": rename.editing,
      })}
      {...(rename.editing ? undefined : sortable?.pointerProps)}
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
            {RectangleIcon}
            <span className="DesignCard__placeholder-label">
              {design.sceneVersion ? "No preview yet" : "Empty canvas"}
            </span>
          </div>
        )}
        {archived && (
          <div className="DesignCard__badges">
            <Tag label="Archived" className="Tag--archived" />
          </div>
        )}
      </div>
      <div className="DesignCard__body">
        <div className="DesignCard__row">
          <div className="DesignCard__text">
            {rename.editing ? (
              <TextField
                className="DesignCard__name-input"
                value={rename.draft}
                onChange={rename.setDraft}
                onKeyDown={rename.onKeyDown}
                onBlur={rename.commit}
                aria-label="Design name"
                autoFocus
                selectOnRender
                maxLength={120}
              />
            ) : (
              <div className="DesignCard__title">
                <Link
                  to={`/p/${design.projectId}/d/${design.id}`}
                  className="DesignCard__link text-ellipsis"
                  aria-label={`Open design ${design.name}`}
                  draggable={false}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    rename.start();
                  }}
                >
                  {design.name}
                </Link>
              </div>
            )}
            <div className="DesignCard__meta muted">
              edited {formatRelativeTime(design.updatedAt)}
            </div>
          </div>
          {!rename.editing && (
            <div className="DesignCard__actions">
              <IconButton
                variant="ghost"
                size="sm"
                icon={PencilIcon}
                label={`Rename ${design.name}`}
                onClick={rename.start}
                className="DesignCard__rename"
              />
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
              <DesignMenu
                design={design}
                onRename={rename.start}
                {...actions}
              />
            </div>
          )}
        </div>
        {design.tags.length > 0 && (
          <div className="DesignCard__tags">
            <TagList tags={design.tags} onTagClick={onTagClick} />
          </div>
        )}
      </div>
    </Island>
  );
};
