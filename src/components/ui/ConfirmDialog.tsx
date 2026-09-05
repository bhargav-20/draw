import React, { useState } from "react";

import { Dialog, DialogActionButton, DialogActions } from "./Dialog";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger styling for destructive actions */
  danger?: boolean;
  onConfirm: () => Promise<unknown> | void;
};

/** Small yes/no dialog. The dialog is locked while `onConfirm` is in flight. */
export const ConfirmDialog = ({
  open,
  onClose,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
}: ConfirmDialogProps) => {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="small"
      locked={busy}
      className="ConfirmDialog"
    >
      <div className="ConfirmDialog__message">{children}</div>
      <DialogActions>
        <DialogActionButton
          label={cancelLabel}
          onClick={onClose}
          disabled={busy}
        />
        <DialogActionButton
          label={confirmLabel}
          actionType={danger ? "danger" : "primary"}
          onClick={confirm}
          disabled={busy}
        />
      </DialogActions>
    </Dialog>
  );
};
