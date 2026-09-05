import React, { useState } from "react";

import { CheckIcon } from "../icons";
import { Dialog, DialogActionButton, DialogActions, TextField } from "../ui";

const RenameForm = ({
  value,
  label,
  onSubmit,
  onCancel,
}: {
  value: string;
  label: string;
  onSubmit: (name: string) => Promise<unknown> | void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(value);
  const [busy, setBusy] = useState(false);
  const trimmed = name.trim();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed || busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="RenameDialog__form" onSubmit={submit}>
      <TextField
        label={label}
        value={name}
        onChange={setName}
        autoFocus
        selectOnRender
        fullWidth
        maxLength={120}
      />
      <DialogActions>
        <DialogActionButton label="Cancel" onClick={onCancel} disabled={busy} />
        <DialogActionButton
          type="submit"
          actionType="primary"
          label="Save"
          icon={CheckIcon}
          disabled={!trimmed || busy}
        />
      </DialogActions>
    </form>
  );
};

/** Single-field rename dialog (used for designs). */
export const RenameDialog = ({
  open,
  onClose,
  title = "Rename design",
  label = "Name",
  value,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  label?: string;
  value: string;
  onSubmit: (name: string) => Promise<unknown> | void;
}) => (
  <Dialog open={open} onClose={onClose} title={title} size="small">
    <RenameForm
      key={value}
      value={value}
      label={label}
      onSubmit={onSubmit}
      onCancel={onClose}
    />
  </Dialog>
);
