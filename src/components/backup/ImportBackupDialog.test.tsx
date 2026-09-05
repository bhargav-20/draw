import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { exportBackup } from "../../data/backup";
import { createDesign, listDesigns } from "../../data/designs";
import {
  createProject,
  deleteProjectPermanently,
  listProjects,
} from "../../data/projects";
import { renderWithProviders } from "../../tests/renderWithProviders";

import { ImportBackupDialog } from "./ImportBackupDialog";

const backupFile = async (name = "excalidraw-projects-backup.zip") => {
  const { blob } = await exportBackup();
  return new File([blob], name, { type: "application/zip" });
};

const selectFile = (file: File) => {
  const input = screen.getByTestId("import-backup-input");
  fireEvent.change(input, { target: { files: [file] } });
};

describe("ImportBackupDialog", () => {
  it("previews the backup and merges it", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Checkout", emoji: "🛒" });
    await createDesign({ projectId: project.id, name: "v1" });
    await createDesign({ projectId: project.id, name: "v2" });
    const file = await backupFile();
    await deleteProjectPermanently(project.id);
    expect(await listProjects()).toHaveLength(0);

    const onClose = vi.fn();
    const onImported = vi.fn();
    renderWithProviders(
      <ImportBackupDialog open onClose={onClose} onImported={onImported} />,
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Import" }),
    ).toBeDisabled();

    selectFile(file);
    expect(
      await within(dialog).findByText(/1 project · 2 designs · exported/),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/Merge into this browser/),
    ).toBeChecked();

    await user.click(
      within(dialog).getByRole("button", { name: "Import 1 project" }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onImported).toHaveBeenCalledWith(
      expect.objectContaining({ projectsAdded: 1, designsAdded: 2 }),
    );
    const projects = await listProjects();
    expect(projects.map((p) => p.name)).toEqual(["Checkout"]);
    expect(await listDesigns(project.id)).toHaveLength(2);
    expect(
      await screen.findByText("Imported 1 project, 2 designs"),
    ).toBeVisible();
  });

  it("asks for confirmation before replacing everything", async () => {
    const user = userEvent.setup();
    const keep = await createProject({ name: "Keep" });
    const file = await backupFile();
    await createProject({ name: "Local only" });

    const onClose = vi.fn();
    renderWithProviders(
      <ImportBackupDialog open onClose={onClose} localProjectCount={2} />,
    );
    const dialog = await screen.findByRole("dialog");
    selectFile(file);
    await within(dialog).findByText(/1 project · 0 designs/);

    await user.click(within(dialog).getByLabelText(/Replace everything/));
    await user.click(
      within(dialog).getByRole("button", { name: "Replace everything" }),
    );
    expect(
      within(dialog).getByText(/permanently delete all 2 local projects/),
    ).toBeInTheDocument();
    // nothing happened yet
    expect(await listProjects()).toHaveLength(2);

    await user.click(
      within(dialog).getByRole("button", { name: "Yes, replace everything" }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect((await listProjects()).map((p) => p.id)).toEqual([keep.id]);
  });

  it("reports unreadable files", async () => {
    renderWithProviders(<ImportBackupDialog open onClose={() => {}} />);
    const dialog = await screen.findByRole("dialog");
    selectFile(new File(["not a zip"], "broken.zip"));
    expect(
      await within(dialog).findByText(/Could not read “broken.zip”/),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Import" }),
    ).toBeDisabled();
  });
});
