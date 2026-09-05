import clsx from "clsx";
import React, { useRef, useState } from "react";

import { importBackup, parseBackup } from "../../data/backup";
import { pluralize } from "../../utils";
import { FileZipIcon, UploadIcon } from "../icons";
import { Dialog, DialogActionButton, DialogActions, useToast } from "../ui";

import "./ImportBackupDialog.scss";

import type { ParsedBackup } from "../../data/backup";

import type { ImportMode, ImportSummary } from "../../types";

type Preview = {
  file: File;
  parsed: ParsedBackup;
  projectCount: number;
  designCount: number;
  exportedAt: Date | null;
};

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const toPreview = (file: File, parsed: ParsedBackup): Preview => {
  if (parsed.manifest) {
    const exportedAt = new Date(parsed.manifest.exportedAt);
    return {
      file,
      parsed,
      projectCount: parsed.manifest.projects.length,
      designCount: parsed.manifest.projects.reduce(
        (sum, project) => sum + (project.designs?.length ?? 0),
        0,
      ),
      exportedAt: Number.isNaN(exportedAt.getTime()) ? null : exportedAt,
    };
  }
  // zip without a manifest: every .excalidraw file becomes a design of one new project
  return {
    file,
    parsed,
    projectCount: 1,
    designCount: parsed.excalidrawFiles.length,
    exportedAt: null,
  };
};

export const summarizeImport = (summary: ImportSummary) => {
  const parts = [
    `Imported ${pluralize(summary.projectsAdded, "project")}, ${pluralize(
      summary.designsAdded,
      "design",
    )}`,
  ];
  const updated = summary.projectsUpdated + summary.designsUpdated;
  if (updated) {
    parts.push(`${updated} updated`);
  }
  if (summary.skipped) {
    parts.push(`${summary.skipped} skipped`);
  }
  return parts.join(" · ");
};

/**
 * Import a backup zip: pick/drop a file, preview what is inside, choose
 * merge (default) or replace-everything (confirmed), then import with the
 * dialog locked. Reports a summary toast.
 */
export const ImportBackupDialog = ({
  open,
  onClose,
  localProjectCount = 0,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  /** number of projects currently in this browser (for the replace warning) */
  localProjectCount?: number;
  onImported?: (summary: ImportSummary) => void;
}) => {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setPreview(null);
    setParseError(null);
    setMode("merge");
    setConfirmingReplace(false);
    setDragOver(false);
    setImporting(false);
  };

  const close = () => {
    if (importing) {
      return;
    }
    reset();
    onClose();
  };

  const pickFile = async (file: File | undefined | null) => {
    if (!file) {
      return;
    }
    setParseError(null);
    setPreview(null);
    setConfirmingReplace(false);
    try {
      const parsed = await parseBackup(file);
      if (!parsed.manifest && !parsed.excalidrawFiles.length) {
        throw new Error("No manifest.json or .excalidraw files found");
      }
      setPreview(toPreview(file, parsed));
    } catch (error) {
      setParseError(`Could not read “${file.name}”: ${describeError(error)}`);
    }
  };

  const runImport = async () => {
    if (!preview) {
      return;
    }
    setImporting(true);
    try {
      const summary = await importBackup(preview.file, mode, preview.file.name);
      showToast(summarizeImport(summary), { kind: "success" });
      if (summary.warnings.length) {
        showToast(
          <>
            {pluralize(summary.warnings.length, "warning")} during import:
            <ul>
              {summary.warnings.slice(0, 5).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
              {summary.warnings.length > 5 && <li>…</li>}
            </ul>
          </>,
          { kind: "error" },
        );
      }
      onImported?.(summary);
      reset();
      onClose();
    } catch (error) {
      setImporting(false);
      showToast(`Import failed: ${describeError(error)}`, { kind: "error" });
    }
  };

  const onPrimaryClick = () => {
    if (mode === "replace" && !confirmingReplace) {
      setConfirmingReplace(true);
      return;
    }
    void runImport();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (!importing) {
      void pickFile(event.dataTransfer.files?.[0]);
    }
  };

  const primaryLabel = importing
    ? "Importing…"
    : !preview
    ? "Import"
    : mode === "replace"
    ? confirmingReplace
      ? "Yes, replace everything"
      : "Replace everything"
    : preview.parsed.manifest
    ? `Import ${pluralize(preview.projectCount, "project")}`
    : `Import ${pluralize(preview.designCount, "drawing")}`;

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Import backup"
      size="small"
      locked={importing}
      className="ImportBackupDialog"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        hidden
        aria-label="Backup file"
        data-testid="import-backup-input"
        onChange={(event) => {
          void pickFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {preview ? (
        <div className="ImportBackupDialog__file">
          <div className="ImportBackupDialog__file-icon" aria-hidden>
            {FileZipIcon}
          </div>
          <div className="ImportBackupDialog__file-text">
            <div className="ImportBackupDialog__file-name text-ellipsis">
              {preview.file.name}
            </div>
            <div className="ImportBackupDialog__file-meta muted">
              {preview.parsed.manifest ? (
                <>
                  {pluralize(preview.projectCount, "project")} ·{" "}
                  {pluralize(preview.designCount, "design")}
                  {preview.exportedAt &&
                    ` · exported ${preview.exportedAt.toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}`}
                </>
              ) : (
                <>
                  {pluralize(preview.designCount, "drawing")} · no manifest –
                  will be imported as one new project
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="ImportBackupDialog__change"
            onClick={() => inputRef.current?.click()}
            disabled={importing}
          >
            Change file
          </button>
        </div>
      ) : (
        <div
          className={clsx("ImportBackupDialog__dropzone", {
            "ImportBackupDialog__dropzone--active": dragOver,
          })}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="ImportBackupDialog__dropzone-icon" aria-hidden>
            {UploadIcon}
          </div>
          <div className="ImportBackupDialog__dropzone-title">
            Drop a backup zip here
          </div>
          <div className="muted">
            or{" "}
            <button
              type="button"
              className="ImportBackupDialog__browse"
              onClick={() => inputRef.current?.click()}
            >
              choose a file
            </button>
          </div>
        </div>
      )}

      {parseError && (
        <div className="ImportBackupDialog__error" role="alert">
          {parseError}
        </div>
      )}

      <fieldset
        className="ImportBackupDialog__modes"
        disabled={importing || !preview}
      >
        <legend className="Dialog__field-label">
          How should it be imported?
        </legend>
        <label
          className={clsx("ImportMode", {
            "ImportMode--selected": mode === "merge",
          })}
        >
          <input
            type="radio"
            name="import-mode"
            value="merge"
            checked={mode === "merge"}
            onChange={() => {
              setMode("merge");
              setConfirmingReplace(false);
            }}
          />
          <span className="ImportMode__text">
            <span className="ImportMode__title">Merge into this browser</span>
            <span className="ImportMode__hint muted">
              Adds projects and designs you don't have. For ones you already
              have, the newer copy wins.
            </span>
          </span>
        </label>
        <label
          className={clsx("ImportMode ImportMode--danger", {
            "ImportMode--selected": mode === "replace",
          })}
        >
          <input
            type="radio"
            name="import-mode"
            value="replace"
            checked={mode === "replace"}
            onChange={() => setMode("replace")}
          />
          <span className="ImportMode__text">
            <span className="ImportMode__title">Replace everything</span>
            <span className="ImportMode__hint ImportMode__hint--danger">
              Deletes all local projects first. Cannot be undone.
            </span>
          </span>
        </label>
      </fieldset>

      {confirmingReplace && mode === "replace" && (
        <div className="ImportBackupDialog__confirm" role="alert">
          This will permanently delete{" "}
          {localProjectCount
            ? `all ${pluralize(localProjectCount, "local project")}`
            : "everything stored in this browser"}{" "}
          and their designs before importing. Export a backup first if you want
          to keep them.
        </div>
      )}

      <DialogActions>
        <DialogActionButton
          label={confirmingReplace ? "Keep my data" : "Cancel"}
          onClick={
            confirmingReplace ? () => setConfirmingReplace(false) : close
          }
          disabled={importing}
        />
        <DialogActionButton
          label={primaryLabel}
          actionType={mode === "replace" ? "danger" : "primary"}
          icon={UploadIcon}
          onClick={onPrimaryClick}
          disabled={!preview || importing}
        />
      </DialogActions>
    </Dialog>
  );
};
