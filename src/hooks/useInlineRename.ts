import { useRef, useState } from "react";

import type React from "react";

export type InlineRename = {
  editing: boolean;
  draft: string;
  setDraft: (draft: string) => void;
  /** enter edit mode with a fresh draft */
  start: () => void;
  /** save the draft (no-op when blank or unchanged) and leave edit mode */
  commit: () => void;
  /** leave edit mode, discarding the draft */
  cancel: () => void;
  /** Enter commits, Escape cancels */
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

/**
 * Click-to-rename state for a title that swaps into a text field: the draft
 * starts from `value`, commits on Enter or blur and reverts on Escape.
 */
export const useInlineRename = (
  value: string,
  onRename: (name: string) => void,
): InlineRename => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  // set once the edit is committed or cancelled: unmounting the input fires
  // a blur, which must not commit (or rename) a second time
  const settled = useRef(false);

  const start = () => {
    setDraft(value);
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
    if (name && name !== value) {
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

  return { editing, draft, setDraft, start, commit, cancel, onKeyDown };
};
