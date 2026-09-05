import { applyMove } from "./SortableGrid";

describe("applyMove", () => {
  const ids = ["a", "b", "c", "d", "e"];

  it("moves an item forward onto the drop target", () => {
    expect(applyMove(ids, { activeId: "a", overId: "d" })).toEqual([
      "b",
      "c",
      "d",
      "a",
      "e",
    ]);
  });

  it("moves an item backward onto the drop target", () => {
    expect(applyMove(ids, { activeId: "e", overId: "b" })).toEqual([
      "a",
      "e",
      "b",
      "c",
      "d",
    ]);
  });

  it("keeps hidden (filtered-out) items in place", () => {
    // the grid only showed a, c, e and the user dragged e onto a
    expect(applyMove(ids, { activeId: "e", overId: "a" })).toEqual([
      "e",
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("returns the input untouched for unknown ids or a no-op drop", () => {
    expect(applyMove(ids, { activeId: "x", overId: "a" })).toBe(ids);
    expect(applyMove(ids, { activeId: "a", overId: "a" })).toBe(ids);
  });
});
