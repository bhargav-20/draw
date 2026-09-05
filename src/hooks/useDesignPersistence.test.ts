import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

import { SAVE_TO_DB_TIMEOUT, THUMBNAIL_IDLE_INTERVAL } from "../constants";
import { DB_BLOCKED_EVENT } from "../data/db";
import { createDesign, getDesign } from "../data/designs";
import { createProject } from "../data/projects";
import { getScene, saveScene } from "../data/scenes";
import { renderThumbnail } from "../data/thumbnails";
import { renderHook, settle } from "../testUtils";

import {
  createDesignPersistence,
  useDesignPersistence,
} from "./useDesignPersistence";

vi.mock("../data/thumbnails", () => ({
  renderThumbnail: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
}));

const rect = (id: string, overrides: Partial<ExcalidrawElement> = {}) =>
  ({
    id,
    type: "rectangle",
    x: 10,
    y: 10,
    width: 100,
    height: 50,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    index: "a0",
    roundness: null,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    ...overrides,
  } as unknown as ExcalidrawElement);

const appState = (overrides: Partial<AppState> = {}) =>
  ({
    isLoading: false,
    viewBackgroundColor: "#ffffff",
    scrollX: 12,
    scrollY: 34,
    theme: "light",
    ...overrides,
  } as AppState);

const setup = async () => {
  const project = await createProject({ name: "P" });
  const design = await createDesign({ projectId: project.id, name: "D" });
  return { project, design };
};

describe("createDesignPersistence", () => {
  beforeEach(() => {
    vi.mocked(renderThumbnail).mockClear();
    // keep setImmediate real so fake-indexeddb keeps working
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces saves and keeps the latest scene", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);

    persistence.onChange([rect("r1")], appState(), {});
    persistence.onChange([rect("r1"), rect("r2")], appState(), {});
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();
    const scene = await getScene(design.id);
    expect(scene?.elements.map((e) => e.id)).toEqual(["r1", "r2"]);
    expect(scene?.appState.scrollX).toBe(12);
    expect(scene?.appState).not.toHaveProperty("isLoading");
  });

  it("flush() writes immediately and renders a thumbnail", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);

    persistence.onChange([rect("r1")], appState(), {});
    await persistence.flush();
    await settle();

    expect((await getScene(design.id))?.elements).toHaveLength(1);
    expect(renderThumbnail).toHaveBeenCalledTimes(1);
    const stored = await getDesign(design.id);
    // (fake-indexeddb can't structured-clone a jsdom Blob, so only check presence)
    expect(stored?.thumbnail).toBeDefined();
    expect(stored?.thumbnailUpdatedAt).toBeTypeOf("number");
  });

  it("throttles thumbnails while editing and skips no-op saves", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);

    persistence.onChange([rect("r1")], appState(), {});
    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();
    // first change → thumbnail right away
    await vi.advanceTimersByTimeAsync(0);
    await settle();
    expect(renderThumbnail).toHaveBeenCalledTimes(1);

    // pan only (same elements) → no thumbnail
    persistence.onChange([rect("r1")], appState({ scrollX: 99 }), {});
    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();
    await vi.advanceTimersByTimeAsync(THUMBNAIL_IDLE_INTERVAL);
    await settle();
    expect(renderThumbnail).toHaveBeenCalledTimes(1);
    expect((await getScene(design.id))?.appState.scrollX).toBe(99);

    // more edits → at most one render per idle interval
    persistence.onChange([rect("r1"), rect("r2")], appState(), {});
    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();
    persistence.onChange([rect("r1"), rect("r2"), rect("r3")], appState(), {});
    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();
    expect(renderThumbnail).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(THUMBNAIL_IDLE_INTERVAL);
    await settle();
    expect(renderThumbnail).toHaveBeenCalledTimes(2);
    expect(vi.mocked(renderThumbnail).mock.calls[1][0]).toHaveLength(3);
  });

  it("ignores changes while the editor is loading and for deleted designs", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);

    persistence.onChange([], appState({ isLoading: true }), {});
    await persistence.flush();
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(0);
    expect(renderThumbnail).not.toHaveBeenCalled();

    const gone = createDesignPersistence("missing");
    gone.onChange([rect("r1")], appState(), {});
    await expect(gone.flush()).resolves.toBeUndefined();
    expect(renderThumbnail).not.toHaveBeenCalled();
  });

  it("writes nothing once disabled (failed scene load must not be overwritten)", async () => {
    const { design } = await setup();
    await saveScene(design.id, [rect("keep")], {}, {});
    const persistence = createDesignPersistence(design.id);
    expect(persistence.enabled).toBe(true);

    // a pending debounced save is dropped too
    persistence.onChange([rect("r1"), rect("r2")], appState(), {});
    persistence.disable();
    expect(persistence.enabled).toBe(false);
    await vi.advanceTimersByTimeAsync(SAVE_TO_DB_TIMEOUT);
    await settle();

    // ...and later changes / flushes are no-ops (the editor's empty fallback)
    persistence.onChange([], appState(), {});
    await persistence.flush();
    await settle();
    persistence.primeThumbnail({ elements: [], appState: {}, files: {} });
    await settle();

    expect((await getScene(design.id))?.elements.map((e) => e.id)).toEqual([
      "keep",
    ]);
    expect(renderThumbnail).not.toHaveBeenCalled();
  });

  it("clears the stored thumbnail when the canvas is emptied", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);

    persistence.onChange([rect("r1")], appState(), {});
    await persistence.flush();
    await settle();
    expect((await getDesign(design.id))?.thumbnail).toBeDefined();

    vi.mocked(renderThumbnail).mockResolvedValueOnce(null);
    persistence.onChange([], appState(), {});
    await persistence.flush();
    await settle();
    const stored = await getDesign(design.id);
    expect(stored?.thumbnail).toBeUndefined();
    expect(stored?.thumbnailUpdatedAt).toBeUndefined();
  });

  it("primes a thumbnail from the loaded scene once", async () => {
    const { design } = await setup();
    const persistence = createDesignPersistence(design.id);
    const scene = { elements: [rect("r1")], appState: {}, files: {} };

    persistence.primeThumbnail(scene);
    persistence.primeThumbnail(scene);
    await settle();
    expect(renderThumbnail).toHaveBeenCalledTimes(1);
    expect((await getDesign(design.id))?.thumbnail).toBeDefined();
  });
});

describe("useDesignPersistence", () => {
  beforeEach(() => {
    vi.mocked(renderThumbnail).mockClear();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flushes when the tab is hidden and on unmount / design switch", async () => {
    const { project, design } = await setup();
    const other = await createDesign({ projectId: project.id, name: "E" });

    const { result, rerender, unmount } = await renderHook(
      ({ id }) => useDesignPersistence(id),
      { id: design.id },
    );

    result.current.onChange([rect("r1")], appState(), {});
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(1);

    // pending edit of the first design is stored when switching designs
    result.current.onChange([rect("r1"), rect("r2")], appState(), {});
    await rerender({ id: other.id });
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(2);

    // ...and on unmount
    result.current.onChange([rect("x1")], appState(), {});
    await unmount();
    await settle();
    expect((await getScene(other.id))?.elements.map((e) => e.id)).toEqual([
      "x1",
    ]);
  });

  it("exposes disable() and stays disabled for that design", async () => {
    const { design } = await setup();
    const { result } = await renderHook(({ id }) => useDesignPersistence(id), {
      id: design.id,
    });
    const persistence = result.current;
    expect(persistence.enabled).toBe(true);
    persistence.disable();
    expect(persistence.enabled).toBe(false);
    persistence.onChange([rect("r1")], appState(), {});
    await persistence.flush();
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(0);
  });

  it("flushes and then stops when another tab upgrades the database", async () => {
    const { design } = await setup();
    const { result } = await renderHook(({ id }) => useDesignPersistence(id), {
      id: design.id,
    });
    result.current.onChange([rect("r1")], appState(), {});
    window.dispatchEvent(new Event(DB_BLOCKED_EVENT));
    await settle();
    expect((await getScene(design.id))?.elements).toHaveLength(1);
    expect(result.current.enabled).toBe(false);
  });
});
