import clsx from "clsx";
import React, { useState } from "react";

import { MoveIcon } from "../icons";
import { Dialog, DialogActionButton, DialogActions } from "../ui";

import "./MoveDesignDialog.scss";

import type { Design, Project, ProjectId } from "../../types";

const MoveForm = ({
  design,
  projects,
  onSubmit,
  onCancel,
}: {
  design: Design;
  projects: Project[];
  onSubmit: (projectId: ProjectId) => Promise<unknown> | void;
  onCancel: () => void;
}) => {
  const [target, setTarget] = useState<ProjectId | null>(null);
  const [busy, setBusy] = useState(false);
  // roving tabindex: only the checked (or first) radio is in the tab order
  const tabStop = target ?? projects[0]?.id;

  const onRadioKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? -1
        : 0;
    if (!step || !projects.length) {
      return;
    }
    event.preventDefault();
    const current = projects.findIndex((project) => project.id === target);
    const next = projects[(current + step + projects.length) % projects.length];
    setTarget(next.id);
    event.currentTarget
      .querySelector<HTMLElement>(`[data-id="${next.id}"]`)
      ?.focus();
  };

  const submit = async () => {
    if (!target || busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(target);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="MoveDesignDialog__intro">
        Move “{design.name}” to another project. It keeps its scene, tags and
        thumbnail.
      </p>
      {projects.length ? (
        <div
          className="MoveDesignDialog__list"
          role="radiogroup"
          aria-label="Target project"
          onKeyDown={onRadioKeyDown}
        >
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              role="radio"
              aria-checked={target === project.id}
              tabIndex={project.id === tabStop ? 0 : -1}
              data-id={project.id}
              className={clsx("MoveDesignDialog__option", {
                "MoveDesignDialog__option--selected": target === project.id,
              })}
              onClick={() => setTarget(project.id)}
              onDoubleClick={() => {
                setTarget(project.id);
                void onSubmit(project.id);
              }}
            >
              <span
                className="MoveDesignDialog__emoji"
                style={{ background: `var(--pc-${project.color}-bg)` }}
                aria-hidden
              >
                {project.emoji}
              </span>
              <span className="MoveDesignDialog__name text-ellipsis">
                {project.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="Dialog__hint">
          There is no other project yet. Create one on the dashboard first.
        </p>
      )}
      <DialogActions>
        <DialogActionButton label="Cancel" onClick={onCancel} disabled={busy} />
        <DialogActionButton
          label="Move"
          actionType="primary"
          icon={MoveIcon}
          onClick={submit}
          disabled={!target || busy}
        />
      </DialogActions>
    </>
  );
};

/** Pick another (non-archived) project to move a design into. */
export const MoveDesignDialog = ({
  open,
  onClose,
  design,
  projects,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  design: Design | null;
  /** candidate target projects (the current one already excluded) */
  projects: Project[];
  onSubmit: (projectId: ProjectId) => Promise<unknown> | void;
}) => (
  <Dialog
    open={open && !!design}
    onClose={onClose}
    title="Move to project"
    size="small"
    className="MoveDesignDialog"
  >
    {design && (
      <MoveForm
        key={design.id}
        design={design}
        projects={projects}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    )}
  </Dialog>
);
