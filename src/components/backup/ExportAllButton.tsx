import { useState } from "react";

import { exportBackup } from "../../data/backup";
import { downloadBlob, pluralize } from "../../utils";
import { DownloadIcon } from "../icons";
import { IconButton, useToast } from "../ui";

/** Downloads a zip backup of every project (archived ones included). */
export const ExportAllButton = () => {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    setBusy(true);
    try {
      const { blob, filename, manifest } = await exportBackup();
      if (!manifest.projects.length) {
        showToast("Nothing to export yet – create a project first.");
        return;
      }
      downloadBlob(blob, filename);
      showToast(`Exported ${pluralize(manifest.projects.length, "project")}`, {
        kind: "success",
      });
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
    <IconButton
      icon={DownloadIcon}
      label="Export all projects"
      onClick={exportAll}
      disabled={busy}
    />
  );
};
