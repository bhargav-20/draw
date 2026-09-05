import React from "react";

import { createDesign, getDesign } from "../../data/designs";
import { createProject } from "../../data/projects";
import {
  blur,
  click,
  keyDown,
  mount,
  queryByText,
  type,
  waitFor,
} from "../../testUtils";

import { EditorTopRightUI } from "./EditorTopRightUI";

// `Sidebar.Trigger` needs the editor's internal contexts – stub the package
vi.mock("@excalidraw/excalidraw", () => ({
  THEME: { LIGHT: "light", DARK: "dark" },
  Sidebar: {
    Trigger: ({
      children,
      title,
    }: {
      children?: React.ReactNode;
      title?: string;
    }) => (
      <button type="button" title={title}>
        {children}
      </button>
    ),
  },
}));

const setup = async (isMobile = false) => {
  const project = await createProject({ name: "Checkout", emoji: "🛒" });
  const design = await createDesign({ projectId: project.id, name: "v1" });
  const onBack = vi.fn();
  const view = await mount(
    <EditorTopRightUI
      project={project}
      design={design}
      isMobile={isMobile}
      onBack={onBack}
    />,
  );
  const nameButton = () =>
    view.container.querySelector<HTMLButtonElement>(
      ".EditorTopRightUI__design",
    );
  const input = () =>
    view.container.querySelector<HTMLInputElement>(
      'input[aria-label="Design name"]',
    );
  return { project, design, onBack, view, nameButton, input };
};

describe("EditorTopRightUI", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows the breadcrumb, back button and sidebar trigger", async () => {
    const { onBack, view, nameButton } = await setup();
    expect(queryByText(view.container, "Checkout")).not.toBeNull();
    expect(nameButton()?.textContent).toBe("v1");
    expect(queryByText(view.container, "Designs")).not.toBeNull();

    await click(
      view.container.querySelector('button[aria-label="Back to project"]')!,
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renames the design inline on Enter", async () => {
    const { design, nameButton, input } = await setup();
    await click(nameButton()!);
    expect(input()).not.toBeNull();

    await type(input()!, "v2 · side cart");
    await keyDown(input()!, "Enter");
    await waitFor(async () => {
      expect((await getDesign(design.id))?.name).toBe("v2 · side cart");
    });
    expect(input()).toBeNull();
  });

  it("commits on blur and cancels on Escape", async () => {
    const { design, nameButton, input } = await setup();
    await click(nameButton()!);
    await type(input()!, "changed");
    await keyDown(input()!, "Escape");
    expect(input()).toBeNull();
    expect(nameButton()?.textContent).toBe("v1");
    expect((await getDesign(design.id))?.name).toBe("v1");

    await click(nameButton()!);
    await type(input()!, "blurred");
    await blur(input()!);
    await waitFor(async () => {
      expect((await getDesign(design.id))?.name).toBe("blurred");
    });
  });

  it("collapses to back + trigger on mobile", async () => {
    const { view, nameButton } = await setup(true);
    expect(queryByText(view.container, "Checkout")).toBeNull();
    expect(nameButton()).toBeNull();
    expect(
      view.container.querySelector('button[aria-label="Back to project"]'),
    ).not.toBeNull();
    expect(queryByText(view.container, "Designs")).toBeNull();
  });
});
