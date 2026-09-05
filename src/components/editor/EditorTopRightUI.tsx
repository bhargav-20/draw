import React, { useEffect, useRef, useState } from "react";

import { Sidebar } from "@excalidraw/excalidraw";

import { updateDesign } from "../../data/designs";
import { ArrowLeftIcon, SidebarRightIcon } from "../icons";
import { IconButton, Island, TextField } from "../ui";

import "./EditorTopRightUI.scss";

import type { Design, Project } from "../../types";

export const DESIGNS_SIDEBAR_NAME = "designs";

export type EditorTopRightUIProps = {
  /** only what is shown – the editor passes a memoised view so the toolbar is stable */
  project: Pick<Project, "id" | "name" | "emoji">;
  design: Pick<Design, "id" | "name">;
  isMobile: boolean;
  /** navigate back to the project page (the caller flushes pending saves) */
  onBack: () => void;
};

/**
 * Breadcrumb island (back · project emoji · project name / design name) plus
 * the "Designs" sidebar trigger, rendered through `renderTopRightUI`.
 */
export const EditorTopRightUI = ({
  project,
  design,
  isMobile,
  onBack,
}: EditorTopRightUIProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(design.name);
  // Enter commits and unmounts the input, whose blur then fires `commit`
  // again – the first one to finish an edit wins
  const editDone = useRef(true);

  // keep the draft in sync when not editing (e.g. renamed from the sidebar)
  useEffect(() => {
    if (!editing) {
      setDraft(design.name);
    }
  }, [design.name, editing]);

  const startEditing = () => {
    editDone.current = false;
    setDraft(design.name);
    setEditing(true);
  };

  const commit = () => {
    if (editDone.current) {
      return;
    }
    editDone.current = true;
    setEditing(false);
    const name = draft.trim();
    if (name && name !== design.name) {
      updateDesign(design.id, { name }).catch((error) =>
        console.error("[editor] rename failed", error),
      );
    } else {
      setDraft(design.name);
    }
  };

  const cancel = () => {
    editDone.current = true;
    setEditing(false);
    setDraft(design.name);
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
    <>
      <Island className="EditorTopRightUI" padding={1}>
        <IconButton
          variant="ghost"
          size="sm"
          icon={ArrowLeftIcon}
          label="Back to project"
          onClick={onBack}
        />
        {!isMobile && (
          <>
            <span className="EditorTopRightUI__emoji" aria-hidden>
              {project.emoji}
            </span>
            <span className="EditorTopRightUI__project" title={project.name}>
              {project.name}
            </span>
            <span className="EditorTopRightUI__separator" aria-hidden>
              /
            </span>
            {editing ? (
              <TextField
                className="EditorTopRightUI__rename"
                value={draft}
                onChange={setDraft}
                onKeyDown={onKeyDown}
                onBlur={commit}
                size="compact"
                autoFocus
                selectOnRender
                aria-label="Design name"
                maxLength={120}
              />
            ) : (
              <button
                type="button"
                className="EditorTopRightUI__design"
                title="Rename design"
                onClick={startEditing}
              >
                {design.name}
              </button>
            )}
          </>
        )}
      </Island>
      <Sidebar.Trigger
        name={DESIGNS_SIDEBAR_NAME}
        icon={SidebarRightIcon}
        title="Designs"
        className="EditorTopRightUI__trigger"
      >
        {!isMobile && "Designs"}
      </Sidebar.Trigger>
    </>
  );
};
