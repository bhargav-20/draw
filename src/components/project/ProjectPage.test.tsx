import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createDesign, listDesigns } from "../../data/designs";
import { createProject } from "../../data/projects";
import {
  LocationProbe,
  renderWithProviders,
} from "../../tests/renderWithProviders";

import { ProjectPage } from "./ProjectPage";

import type { Project } from "../../types";

/** the card surrounding a card's title link */
const cardOf = (link: HTMLElement) => link.closest<HTMLElement>(".DesignCard")!;

const renderProjectPage = (project: Project) =>
  renderWithProviders(<ProjectPage />, {
    route: `/p/${project.id}`,
    path: "/p/:projectId",
    routes: {
      "/": <LocationProbe />,
      "/p/:projectId/d/:designId": <LocationProbe />,
    },
  });

describe("ProjectPage", () => {
  it("renders the header and design cards", async () => {
    const project = await createProject({
      name: "Checkout redesign",
      emoji: "🛒",
      tags: ["web"],
    });
    await createDesign({ projectId: project.id, name: "v1 · stepper" });
    await createDesign({
      projectId: project.id,
      name: "v2 · single page",
      tags: ["current"],
    });

    renderProjectPage(project);

    expect(
      await screen.findByRole("heading", { name: "Checkout redesign" }),
    ).toBeInTheDocument();
    // the designs live query settles after the project's, so the header's
    // count arrives a render later than the heading
    expect(await screen.findByText(/2 designs · created/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open design v1 · stepper" }),
    ).toBeInTheDocument();
    const second = cardOf(
      screen.getByRole("link", { name: "Open design v2 · single page" }),
    );
    expect(within(second).getByText("current")).toBeInTheDocument();
    // toolbar button + the dashed card
    expect(screen.getAllByRole("button", { name: "New design" })).toHaveLength(
      2,
    );
  });

  it("shows the not-found page for an unknown project", async () => {
    renderWithProviders(<ProjectPage />, {
      route: "/p/does-not-exist",
      path: "/p/:projectId",
    });
    expect(await screen.findByText("Project not found")).toBeInTheDocument();
  });

  it("creates a new design and opens the editor", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Empty" });
    renderProjectPage(project);

    await user.click(
      await screen.findByRole("button", { name: "Create your first design" }),
    );
    await waitFor(async () =>
      expect(await listDesigns(project.id)).toHaveLength(1),
    );
    const [design] = await listDesigns(project.id);
    expect(await screen.findByTestId("location")).toHaveTextContent(
      `/p/${project.id}/d/${design.id}`,
    );
  });

  it("duplicates a design via the card menu", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Checkout" });
    await createDesign({ projectId: project.id, name: "v1" });
    renderProjectPage(project);

    await screen.findByRole("link", { name: "Open design v1" });
    await user.click(
      screen.getByRole("button", { name: "Design actions for v1" }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Duplicate" }),
    );

    expect(
      await screen.findByRole("link", { name: "Open design v1 copy" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Duplicated as “v1 copy”")).toBeVisible();
    expect(await listDesigns(project.id)).toHaveLength(2);
  });

  it("archives a design and reveals it with the toggle", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Checkout" });
    await createDesign({ projectId: project.id, name: "v1" });
    await createDesign({ projectId: project.id, name: "v2" });
    renderProjectPage(project);

    await screen.findByRole("link", { name: "Open design v1" });
    await user.click(
      screen.getByRole("button", { name: "Design actions for v1" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Archive" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Open design v1" }),
      ).not.toBeInTheDocument(),
    );
    expect(await screen.findByText(/1 design · created/)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Show archived"));
    const card = cardOf(
      await screen.findByRole("link", { name: "Open design v1" }),
    );
    expect(within(card).getByText("Archived")).toBeInTheDocument();

    await user.click(
      within(card).getByRole("button", { name: "Design actions for v1" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Restore" }));
    await waitFor(() =>
      expect(screen.getByText(/2 designs · created/)).toBeInTheDocument(),
    );
  });

  it("renames a design inline on the card", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Checkout" });
    await createDesign({ projectId: project.id, name: "v1" });
    renderProjectPage(project);

    await screen.findByRole("link", { name: "Open design v1" });
    await user.click(screen.getByRole("button", { name: "Rename v1" }));
    const input = await screen.findByLabelText("Design name");
    await user.clear(input);
    await user.type(input, "v1 · stepper{Enter}");

    expect(
      await screen.findByRole("link", { name: "Open design v1 · stepper" }),
    ).toBeInTheDocument();
  });

  it("starts the inline rename from the card menu and reverts on Escape", async () => {
    const user = userEvent.setup();
    const project = await createProject({ name: "Checkout" });
    await createDesign({ projectId: project.id, name: "v1" });
    renderProjectPage(project);

    await screen.findByRole("link", { name: "Open design v1" });
    await user.click(
      screen.getByRole("button", { name: "Design actions for v1" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Rename" }));

    const input = await screen.findByLabelText("Design name");
    await user.clear(input);
    await user.type(input, "discarded{Escape}");

    expect(
      await screen.findByRole("link", { name: "Open design v1" }),
    ).toBeInTheDocument();
    expect(await listDesigns(project.id)).toMatchObject([{ name: "v1" }]);
  });
});
