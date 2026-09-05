import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderWithProviders } from "../../tests/renderWithProviders";

import { ProjectHeader } from "./ProjectHeader";

import type { Project } from "../../types";

const project: Project = {
  id: "p1",
  name: "Checkout",
  emoji: "🛒",
  color: "violet",
  tags: [],
  order: 0,
  createdAt: 0,
  updatedAt: 0,
};

const renderHeader = (onRename = vi.fn()) => {
  renderWithProviders(
    <ProjectHeader
      project={project}
      designCount={2}
      onRename={onRename}
      onEdit={() => {}}
      onArchiveToggle={() => {}}
      onDelete={() => {}}
    />,
  );
  return onRename;
};

describe("ProjectHeader", () => {
  it("renames exactly once when Enter commits (the unmount blur is ignored)", async () => {
    const user = userEvent.setup();
    const onRename = renderHeader();

    await user.click(screen.getByRole("button", { name: "Rename project" }));
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Checkout v2{Enter}");

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename).toHaveBeenCalledWith("Checkout v2");
    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
  });

  it("does not rename when the edit is cancelled with Escape", async () => {
    const user = userEvent.setup();
    const onRename = renderHeader();

    await user.click(screen.getByRole("button", { name: "Rename project" }));
    await user.type(screen.getByLabelText("Project name"), " draft{Escape}");

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Checkout" })).toBeVisible();
  });
});
