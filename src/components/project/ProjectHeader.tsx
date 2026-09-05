import React, { useRef, useState } from "react";
import { Link } from "react-router";

import { pluralize } from "../../utils";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  DotsIcon,
  PencilIcon,
  RestoreIcon,
  TrashIcon,
} from "../icons";
import { DropdownMenu, IconButton, Tag, TagList, TextField } from "../ui";

import "./ProjectHeader.scss";

import type { Project } from "../../types";

const formatCreated = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

/**
 * Project page header: back link, emoji tile, inline-editable name, tags,
 * "N designs · created <date>" and the project actions.
 */
export const ProjectHeader = ({
  project,
  designCount,
  onRename,
  onEdit,
  onArchiveToggle,
  onDelete,
  onTagClick,
  actions,
}: {
  project: Project;
  designCount: number;
  onRename: (name: string) => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onTagClick?: (tag: string) => void;
  /** extra buttons (export / import) rendered before the actions menu */
  actions?: React.ReactNode;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  // set once the edit is committed or cancelled: unmounting the input fires
  // a blur, which must not commit (or rename) a second time
  const settled = useRef(false);
  const archived = !!project.archivedAt;

  const startEditing = () => {
    setDraft(project.name);
    settled.current = false;
    setEditing(true);
  };

  const commit = () => {
    if (settled.current) {
      return;
    }
    settled.current = true;
    setEditing(false);
    const name = draft.trim();
    if (name && name !== project.name) {
      onRename(name);
    }
  };

  const cancel = () => {
    settled.current = true;
    setEditing(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
  };

  return (
    <div className="ProjectHeader">
      <Link to="/" className="ProjectHeader__back">
        {ArrowLeftIcon}
        <span>All projects</span>
      </Link>
      <div className="ProjectHeader__row">
        <div
          className="ProjectHeader__emoji"
          style={{ background: `var(--pc-${project.color}-bg)` }}
          aria-hidden
        >
          {project.emoji}
        </div>
        <div className="ProjectHeader__text">
          <div className="ProjectHeader__title-row">
            {editing ? (
              <TextField
                className="ProjectHeader__name-input"
                value={draft}
                onChange={setDraft}
                onKeyDown={onKeyDown}
                onBlur={commit}
                aria-label="Project name"
                autoFocus
                selectOnRender
                maxLength={120}
              />
            ) : (
              <>
                <h1 className="ProjectHeader__name">
                  <button
                    type="button"
                    className="ProjectHeader__name-button text-ellipsis"
                    onClick={startEditing}
                    title="Click to rename"
                  >
                    {project.name}
                  </button>
                </h1>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={PencilIcon}
                  label="Rename project"
                  onClick={startEditing}
                  className="ProjectHeader__rename"
                />
                {archived && <Tag label="Archived" className="Tag--archived" />}
              </>
            )}
          </div>
          <div className="ProjectHeader__meta">
            <span className="muted">
              {pluralize(designCount, "design")} · created{" "}
              {formatCreated(project.createdAt)}
            </span>
            <TagList tags={project.tags} onTagClick={onTagClick} />
          </div>
        </div>
        <div className="ProjectHeader__spacer" />
        <div className="ProjectHeader__actions">
          {actions}
          <DropdownMenu
            trigger={(props) => (
              <IconButton {...props} icon={DotsIcon} label="Project actions" />
            )}
          >
            <DropdownMenu.Item icon={PencilIcon} onSelect={onEdit}>
              Edit project
            </DropdownMenu.Item>
            <DropdownMenu.Item
              icon={archived ? RestoreIcon : ArchiveIcon}
              onSelect={onArchiveToggle}
            >
              {archived ? "Restore" : "Archive"}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item icon={TrashIcon} onSelect={onDelete} danger>
              Delete permanently
            </DropdownMenu.Item>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
