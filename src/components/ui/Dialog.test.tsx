import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../../tests/renderWithProviders";

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("keeps Tab / Shift+Tab inside the dialog and labels it by its title", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <button type="button">Outside</button>
        <Dialog open onClose={() => {}} title="Move to project">
          <input aria-label="Name" />
          <button type="button">Save</button>
        </Dialog>
      </>,
    );

    const dialog = screen.getByRole("dialog", { name: "Move to project" });
    expect(dialog).toBeInTheDocument();
    const name = screen.getByLabelText("Name");
    await waitFor(() => expect(name).toHaveFocus());

    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    // last → first (the close button comes first in DOM order)
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    // first → last
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Outside" })).not.toHaveFocus();
  });

  it("gives each open dialog its own title id", () => {
    renderWithProviders(
      <>
        <Dialog open onClose={() => {}} title="First">
          one
        </Dialog>
        <Dialog open onClose={() => {}} title="Second">
          two
        </Dialog>
      </>,
    );
    const [first, second] = screen.getAllByRole("dialog");
    expect(first.getAttribute("aria-labelledby")).not.toBe(
      second.getAttribute("aria-labelledby"),
    );
    expect(first).toHaveAccessibleName("First");
    expect(second).toHaveAccessibleName("Second");
  });
});
