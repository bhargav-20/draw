import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createDesign } from "../../data/designs";
import { createProject, listProjects } from "../../data/projects";
import {
  LocationProbe,
  renderWithProviders,
} from "../../tests/renderWithProviders";

import { DashboardPage } from "./DashboardPage";

/** the card surrounding a card's title link */
const cardOf = (link: HTMLElement) =>
  link.closest<HTMLElement>(".ProjectCard")!;

const renderDashboard = () =>
  renderWithProviders(<DashboardPage />, {
    routes: {
      "/p/:projectId": <LocationProbe />,
      "/p/:projectId/d/:designId": <LocationProbe />,
    },
  });

describe("DashboardPage", () => {
  it("shows the empty state when there are no projects", async () => {
    renderDashboard();
    expect(
      await screen.findByText("Create your first project", {
        selector: ".EmptyState__title",
      }),
    ).toBeInTheDocument();
  });

  it("renders project cards with design counts and tags", async () => {
    const checkout = await createProject({
      name: "Checkout redesign",
      emoji: "🛒",
      color: "violet",
      tags: ["web", "payments"],
    });
    await createProject({ name: "Mobile onboarding" });
    await createDesign({ projectId: checkout.id, name: "v1" });
    await createDesign({ projectId: checkout.id, name: "v2" });

    renderDashboard();

    const card = cardOf(
      await screen.findByRole("link", {
        name: "Open project Checkout redesign",
      }),
    );
    // same race as the project header: the counts come from a second query
    expect(await within(card).findByText(/2 designs/)).toBeInTheDocument();
    expect(within(card).getByText("web")).toBeInTheDocument();
    expect(within(card).getByText("payments")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open project Mobile onboarding" }),
    ).toBeInTheDocument();
  });

  it("fans the project's most recent designs on its card", async () => {
    const checkout = await createProject({ name: "Checkout redesign" });
    for (const name of ["v1", "v2", "v3", "v4"]) {
      await createDesign({ projectId: checkout.id, name });
    }
    await createProject({ name: "Nothing here yet" });

    renderDashboard();

    const busy = cardOf(
      await screen.findByRole("link", {
        name: "Open project Checkout redesign",
      }),
    );
    // four designs, three sheets — the fan caps at PROJECT_PREVIEW_COUNT
    await waitFor(() =>
      expect(busy.querySelectorAll(".ProjectCard__sheet")).toHaveLength(3),
    );

    const empty = cardOf(
      screen.getByRole("link", { name: "Open project Nothing here yet" }),
    );
    expect(empty.querySelectorAll(".ProjectCard__sheet")).toHaveLength(0);
    expect(within(empty).getByText("No designs yet")).toBeInTheDocument();
  });

  it("creates a project from the dialog and opens it", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("Create your first project", {
      selector: ".EmptyState__title",
    });

    await user.click(screen.getByRole("button", { name: "New project" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Auth flows");
    await user.click(within(dialog).getByLabelText("red"));
    await user.click(
      within(dialog).getByRole("button", { name: "Create project" }),
    );

    await waitFor(async () => {
      const projects = await listProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("Auth flows");
      expect(projects[0].color).toBe("red");
    });
    const [project] = await listProjects();
    expect(await screen.findByTestId("location")).toHaveTextContent(
      `/p/${project.id}`,
    );
  });

  it("filters projects by search and lists matching designs", async () => {
    const user = userEvent.setup();
    const checkout = await createProject({
      name: "Checkout redesign",
      tags: ["web"],
    });
    await createProject({ name: "Platform architecture", tags: ["infra"] });
    const design = await createDesign({
      projectId: checkout.id,
      name: "Payment methods",
    });

    renderDashboard();
    await screen.findByRole("link", { name: "Open project Checkout redesign" });

    const search = screen.getByLabelText("Search projects, designs, #tags");
    await user.type(search, "#infra");
    expect(
      screen.queryByRole("link", { name: "Open project Checkout redesign" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open project Platform architecture" }),
    ).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "payment");
    const results = await screen.findByRole("region", {
      name: "Matching designs",
    });
    await user.click(within(results).getByText("Payment methods"));
    expect(await screen.findByTestId("location")).toHaveTextContent(
      `/p/${checkout.id}/d/${design.id}`,
    );
  });

  it("archives a project via the card menu and reveals it with the toggle", async () => {
    const user = userEvent.setup();
    await createProject({ name: "Old idea" });
    renderDashboard();
    await screen.findByRole("link", { name: "Open project Old idea" });

    await user.click(
      screen.getByRole("button", { name: "Project actions for Old idea" }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Archive" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Open project Old idea" }),
      ).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("All projects are archived")).toBeVisible();

    await user.click(screen.getByLabelText("Show archived"));
    const card = cardOf(
      await screen.findByRole("link", { name: "Open project Old idea" }),
    );
    expect(within(card).getByText("Archived")).toBeInTheDocument();
  });
});
