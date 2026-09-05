import { useRef, useState } from "react";

import { importExcalidrawFiles } from "../../data/backup";
import { pluralize } from "../../utils";
import { FileIcon } from "../icons";
import { FilledButton, useToast } from "../ui";

import type { Design, ProjectId } from "../../types";

/**
 * Picks one or more `.excalidraw` (or `.json`) files and imports each as a
 * new design of the project.
 */
export const ImportExcalidrawButton = ({
  projectId,
  onImported,
}: {
  projectId: ProjectId;
  onImported?: (designs: Design[]) => void;
}) => {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const importFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) {
      return;
    }
    setBusy(true);
    try {
      const { designs, errors } = await importExcalidrawFiles(projectId, files);
      if (designs.length) {
        showToast(`Imported ${pluralize(designs.length, "design")}`, {
          kind: "success",
        });
        onImported?.(designs);
      }
      if (errors.length) {
        showToast(
          <>
            {pluralize(errors.length, "file")} could not be imported:
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </>,
          { kind: "error" },
        );
      }
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".excalidraw,.json,application/json"
        multiple
        hidden
        aria-label="Import .excalidraw files"
        data-testid="import-excalidraw-input"
        onChange={(event) => importFiles(event.target.files)}
      />
      <FilledButton
        label="Import .excalidraw"
        variant="outlined"
        icon={FileIcon}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <span className="ButtonText--collapsible">Import .excalidraw</span>
      </FilledButton>
    </>
  );
};
