import { useState } from "react";

import { exportBackup } from "../../data/backup";
import { downloadBlob } from "../../utils";
import { DownloadIcon } from "../icons";
import { FilledButton, useToast } from "../ui";

import type { Project } from "../../types";

/** Downloads a zip backup of a single project. */
export const ExportProjectButton = ({ project }: { project: Project }) => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const exportProject = async () => {
    setBusy(true);
    try {
      const { blob, filename } = await exportBackup([project.id]);
      downloadBlob(blob, filename);
      showToast(`Exported “${project.name}”`, { kind: "success" });
    } catch (error) {
      showToast(
        `Export failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { kind: "error" },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <FilledButton
      label="Export project"
      variant="outlined"
      icon={DownloadIcon}
      onClick={exportProject}
      disabled={busy}
    >
      <span className="ButtonText--collapsible">Export project</span>
    </FilledButton>
  );
};
