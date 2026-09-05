import React, { useState } from "react";

import { CheckIcon } from "../icons";
import { Dialog, DialogActionButton, DialogActions, TagInput } from "../ui";

const TagsForm = ({
  value,
  suggestions,
  onSubmit,
  onCancel,
}: {
  value: string[];
  suggestions: string[];
  onSubmit: (tags: string[]) => Promise<unknown> | void;
  onCancel: () => void;
}) => {
  const [tags, setTags] = useState(value);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(tags);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="EditTagsDialog__form" onSubmit={submit}>
      <TagInput
        label="Tags"
        value={tags}
        onChange={setTags}
        suggestions={suggestions}
      />
      <p className="Dialog__hint">
        Press Enter or type a comma to add a tag. Tags are lower-cased.
      </p>
      <DialogActions>
        <DialogActionButton label="Cancel" onClick={onCancel} disabled={busy} />
        <DialogActionButton
          type="submit"
          actionType="primary"
          label="Save"
          icon={CheckIcon}
          disabled={busy}
        />
      </DialogActions>
    </form>
  );
};

/** Edit the tags of a design. */
export const EditTagsDialog = ({
  open,
  onClose,
  title = "Edit tags",
  value,
  suggestions = [],
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  value: string[];
  suggestions?: string[];
  onSubmit: (tags: string[]) => Promise<unknown> | void;
}) => (
  <Dialog open={open} onClose={onClose} title={title} size="small">
    <TagsForm
      key={value.join(",")}
      value={value}
      suggestions={suggestions}
      onSubmit={onSubmit}
      onCancel={onClose}
    />
  </Dialog>
);
