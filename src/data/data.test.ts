import { strFromU8, unzipSync, zipSync, strToU8 } from "fflate";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { blobToArrayBuffer } from "../utils";

import { exportBackup, importBackup, importExcalidrawFiles } from "./backup";
import {
  createDesign,
  deleteDesignPermanently,
  duplicateDesign,
  getDesign,
  listDesigns,
  moveDesignToProject,
  reorderDesigns,
  setDesignArchived,
  sortDesigns,
  updateDesign,
} from "./designs";
import {
  createProject,
  deleteProjectPermanently,
  getProject,
  listProjects,
  reorderProjects,
  setProjectArchived,
  sortProjects,
  updateProject,
} from "./projects";
import { getScene, saveScene, saveThumbnail } from "./scenes";
import { getSettings, updateSettings } from "./settings";

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

describe("projects", () => {
  it("creates with defaults and lists", async () => {
    const project = await createProject({
      name: "  Checkout  ",
      tags: ["#Web", "web"],
    });
    expect(project.name).toBe("Checkout");
    expect(project.tags).toEqual(["web"]);
    expect(project.order).toBe(0);
    const second = await createProject();
    expect(second.name).toBe("Untitled project");
    expect(second.order).toBe(1);
    expect(await listProjects()).toHaveLength(2);
  });

  it("updates, archives and deletes (with cascading designs)", async () => {
    const project = await createProject({ name: "A" });
    const updated = await updateProject(project.id, {
      name: "B",
      color: "red",
    });
    expect(updated.name).toBe("B");
    expect(updated.color).toBe("red");

    const archived = await setProjectArchived(project.id, true);
    expect(archived.archivedAt).toBeTypeOf("number");
    expect(
      (await setProjectArchived(project.id, false)).archivedAt,
    ).toBeUndefined();

    const design = await createDesign({ projectId: project.id });
    await deleteProjectPermanently(project.id);
    expect(await getProject(project.id)).toBeUndefined();
    expect(await getScene(design.id)).toBeUndefined();
  });

  it("sorts and reorders", async () => {
    const a = await createProject({ name: "b" });
    const b = await createProject({ name: "a" });
    const c = await createProject({ name: "c" });
    expect(
      sortProjects(await listProjects(), "name").map((p) => p.name),
    ).toEqual(["a", "b", "c"]);
    await reorderProjects([c.id, a.id]);
    expect(
      sortProjects(await listProjects(), "manual").map((p) => p.id),
    ).toEqual([c.id, a.id, b.id]);
  });
});

describe("designs", () => {
  it("auto-numbers untitled designs and inserts after a sibling", async () => {
    const project = await createProject();
    const d1 = await createDesign({ projectId: project.id });
    const d2 = await createDesign({ projectId: project.id });
    expect([d1.name, d2.name]).toEqual([
      "Untitled design",
      "Untitled design 2",
    ]);
    const d3 = await createDesign({
      projectId: project.id,
      name: "mid",
      after: d1.id,
    });
    const manual = sortDesigns(await listDesigns(project.id), "manual");
    expect(manual.map((d) => d.id)).toEqual([d1.id, d3.id, d2.id]);
  });

  it("duplicates scene + files and names the copy", async () => {
    const project = await createProject();
    const d1 = await createDesign({ projectId: project.id, name: "Flow" });
    await saveScene(d1.id, [rect("r1")], { viewBackgroundColor: "#fff" }, {});
    const copy = await duplicateDesign(d1.id);
    expect(copy.name).toBe("Flow copy");
    const scene = await getScene(copy.id);
    expect(scene?.elements).toHaveLength(1);
    const manual = sortDesigns(await listDesigns(project.id), "manual");
    expect(manual.map((d) => d.id)).toEqual([d1.id, copy.id]);
    const copy2 = await duplicateDesign(d1.id);
    expect(copy2.name).toBe("Flow copy 2");
  });

  it("duplicates thumbnail and scene version, never the archived flag", async () => {
    const project = await createProject();
    const d1 = await createDesign({ projectId: project.id, name: "Flow" });
    const { sceneVersion } = (await saveScene(d1.id, [rect("r1")], {}, {}))!;
    await saveThumbnail(
      d1.id,
      new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
    );
    await setDesignArchived(d1.id, true);

    const copy = await duplicateDesign(d1.id);
    const stored = (await getDesign(copy.id))!;
    expect(stored.sceneVersion).toBe(sceneVersion);
    expect(stored.thumbnail?.byteLength).toBe(3);
    expect(stored.thumbnailUpdatedAt).toBeTypeOf("number");
    expect(stored.archivedAt).toBeUndefined();
    expect((await getScene(copy.id))?.elements).toHaveLength(1);

    // a source without thumbnail still copies its version (no `-1` sentinel)
    const plain = await createDesign({ projectId: project.id, name: "Plain" });
    const plainVersion = (await saveScene(plain.id, [rect("p1")], {}, {}))!
      .sceneVersion;
    const plainCopy = await duplicateDesign(plain.id);
    expect((await getDesign(plainCopy.id))?.sceneVersion).toBe(plainVersion);
  });

  it("archives, renames, moves and deletes", async () => {
    const p1 = await createProject({ name: "p1" });
    const p2 = await createProject({ name: "p2" });
    const d = await createDesign({ projectId: p1.id });
    expect(
      (await updateDesign(d.id, { name: "x", tags: ["A", "a"] })).tags,
    ).toEqual(["a"]);
    expect((await setDesignArchived(d.id, true)).archivedAt).toBeTypeOf(
      "number",
    );
    const moved = await moveDesignToProject(d.id, p2.id);
    expect(moved.projectId).toBe(p2.id);
    expect(await listDesigns(p1.id)).toHaveLength(0);
    await deleteDesignPermanently(d.id);
    expect(await listDesigns(p2.id)).toHaveLength(0);
  });

  it("reorders within a project", async () => {
    const project = await createProject();
    const a = await createDesign({ projectId: project.id });
    const b = await createDesign({ projectId: project.id });
    const c = await createDesign({ projectId: project.id });
    await reorderDesigns(project.id, [c.id, b.id, a.id]);
    expect(
      sortDesigns(await listDesigns(project.id), "manual").map((d) => d.id),
    ).toEqual([c.id, b.id, a.id]);
  });
});

describe("scenes", () => {
  it("persists non-deleted elements + whitelisted appState and bumps updatedAt only on change", async () => {
    const project = await createProject();
    const design = await createDesign({ projectId: project.id });
    const before = (await listDesigns(project.id))[0].updatedAt;
    await new Promise((r) => setTimeout(r, 5));

    const result = await saveScene(
      design.id,
      [rect("r1"), rect("r2", { isDeleted: true })],
      {
        viewBackgroundColor: "#123456",
        // transient keys must be stripped
        selectedElementIds: { r1: true },
        isLoading: true,
      },
      {},
    );
    expect(result?.changed).toBe(true);
    const scene = await getScene(design.id);
    expect(scene?.elements.map((e) => e.id)).toEqual(["r1"]);
    expect(scene?.appState.viewBackgroundColor).toBe("#123456");
    expect(scene?.appState).not.toHaveProperty("selectedElementIds");
    expect(scene?.appState).not.toHaveProperty("isLoading");

    const after = (await listDesigns(project.id))[0].updatedAt;
    expect(after).toBeGreaterThan(before);

    // same elements again → no change
    const again = await saveScene(design.id, [rect("r1")], {}, {});
    expect(again?.changed).toBe(false);
    expect((await listDesigns(project.id))[0].updatedAt).toBe(after);
  });

  it("stores and clears thumbnails", async () => {
    const project = await createProject();
    const design = await createDesign({ projectId: project.id });
    await saveThumbnail(
      design.id,
      new Blob([new Uint8Array([9, 9])], { type: "image/png" }),
    );
    expect((await getDesign(design.id))?.thumbnail?.byteLength).toBe(2);

    await saveThumbnail(design.id, null);
    const cleared = (await getDesign(design.id))!;
    expect(cleared.thumbnail).toBeUndefined();
    expect(cleared.thumbnailUpdatedAt).toBeUndefined();
    expect(cleared.updatedAt).toBe(design.updatedAt);
  });

  it("drops a write for a deleted design", async () => {
    expect(await saveScene("missing", [], {}, {})).toBeNull();
  });
});

describe("settings", () => {
  it("merges defaults", async () => {
    expect((await getSettings()).theme).toBe("system");
    await updateSettings({ theme: "dark" });
    expect((await getSettings()).theme).toBe("dark");
    expect((await getSettings()).projectsSort).toBe("updatedAt");
  });
});

describe("backup", () => {
  it("round-trips export → import (merge) and keeps newer records", async () => {
    const project = await createProject({
      name: "Checkout",
      emoji: "🛒",
      tags: ["web"],
    });
    const design = await createDesign({ projectId: project.id, name: "v1" });
    await saveScene(
      design.id,
      [rect("r1")],
      { viewBackgroundColor: "#fafafa" },
      {},
    );
    await setDesignArchived(
      (
        await createDesign({ projectId: project.id, name: "old" })
      ).id,
      true,
    );

    const { blob, filename, manifest } = await exportBackup();
    expect(filename).toMatch(
      /excalidraw-projects-backup-\d{4}-\d{2}-\d{2}\.zip/,
    );
    expect(manifest.projects).toHaveLength(1);
    expect(manifest.projects[0].designs).toHaveLength(2);

    const entries = unzipSync(new Uint8Array(await blobToArrayBuffer(blob)));
    const paths = Object.keys(entries);
    expect(paths).toContain("manifest.json");
    const designFile = paths.find((p) => p.includes("v1--"))!;
    expect(designFile).toMatch(
      /^projects\/checkout--[^/]+\/v1--[^/]+\.excalidraw$/,
    );
    const parsed = JSON.parse(strFromU8(entries[designFile]));
    expect(parsed.type).toBe("excalidraw");
    expect(parsed.elements).toHaveLength(1);

    // wipe & restore
    await deleteProjectPermanently(project.id);
    expect(await listProjects()).toHaveLength(0);
    const summary = await importBackup(blob, "merge");
    expect(summary).toMatchObject({
      projectsAdded: 1,
      designsAdded: 2,
      skipped: 0,
    });
    const restoredProject = await getProject(project.id);
    expect(restoredProject?.emoji).toBe("🛒");
    const restoredDesigns = await listDesigns(project.id);
    expect(
      restoredDesigns.find((d) => d.name === "old")?.archivedAt,
    ).toBeTypeOf("number");
    const restoredScene = await getScene(design.id);
    expect(restoredScene?.elements).toHaveLength(1);
    expect(restoredScene?.appState.viewBackgroundColor).toBe("#fafafa");

    // importing again skips everything (nothing newer)
    const second = await importBackup(blob, "merge");
    expect(second.projectsAdded + second.designsAdded).toBe(0);
    expect(second.skipped).toBe(3);

    // local edit newer than backup wins
    await updateProject(project.id, { name: "Checkout v2" });
    await importBackup(blob, "merge");
    expect((await getProject(project.id))?.name).toBe("Checkout v2");
  });

  it("exports thumbnails without breaking the read transaction", async () => {
    const project = await createProject({ name: "Thumbs" });
    const design = await createDesign({ projectId: project.id, name: "one" });
    await saveScene(design.id, [rect("r1")], {}, {});
    await saveThumbnail(
      design.id,
      new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }),
    );
    await createDesign({ projectId: project.id, name: "two" });

    const { blob, manifest } = await exportBackup([project.id]);
    const entry = manifest.projects[0].designs.find((d) => d.name === "one")!;
    expect(entry.thumbnailFile).toMatch(/thumbnails\/.+\.png$/);
    const entries = unzipSync(new Uint8Array(await blobToArrayBuffer(blob)));
    expect(entries[entry.thumbnailFile!]).toHaveLength(4);

    await deleteProjectPermanently(project.id);
    await importBackup(blob, "merge");
    const restored = (await listDesigns(project.id)).find(
      (d) => d.name === "one",
    );
    expect(restored?.thumbnail?.byteLength).toBe(4);
  });

  it("replace mode wipes local data first", async () => {
    const keep = await createProject({ name: "keep" });
    const { blob } = await exportBackup([keep.id]);
    await createProject({ name: "local-only" });
    await importBackup(blob, "replace");
    expect((await listProjects()).map((p) => p.name)).toEqual(["keep"]);
  });

  it("replace mode keeps local data intact when the backup is unreadable", async () => {
    const local = await createProject({ name: "local" });
    const design = await createDesign({ projectId: local.id, name: "mine" });
    await saveScene(design.id, [rect("r1")], {}, {});

    // a manifest whose only design file is corrupt
    const { blob } = await exportBackup([local.id]);
    const entries = unzipSync(new Uint8Array(await blobToArrayBuffer(blob)));
    const designFile = Object.keys(entries).find((p) =>
      p.endsWith(".excalidraw"),
    )!;
    entries[designFile] = new Uint8Array(strToU8("{ not json"));
    const corrupt = new Blob([zipSync(entries).slice()]);

    await expect(importBackup(corrupt, "replace")).rejects.toThrow(
      /unreadable/,
    );
    expect((await listProjects()).map((p) => p.name)).toEqual(["local"]);
    expect((await listDesigns(local.id)).map((d) => d.name)).toEqual(["mine"]);
    expect((await getScene(design.id))?.elements).toHaveLength(1);

    // merge mode still imports what it can and reports the rest
    const summary = await importBackup(corrupt, "merge");
    expect(summary.warnings).toHaveLength(1);
    expect(summary.skipped).toBeGreaterThan(0);
    expect((await getScene(design.id))?.elements).toHaveLength(1);
  });

  it("exports a single project with its own filename", async () => {
    const a = await createProject({ name: "Alpha One" });
    await createProject({ name: "Beta" });
    const { filename, manifest } = await exportBackup([a.id]);
    expect(filename).toMatch(/^alpha-one-\d{4}-\d{2}-\d{2}\.zip$/);
    expect(manifest.projects.map((p) => p.name)).toEqual(["Alpha One"]);
  });

  it("imports a zip of loose .excalidraw files into a new project", async () => {
    const file = JSON.stringify({
      type: "excalidraw",
      version: 2,
      source: "test",
      elements: [rect("r1")],
      appState: { viewBackgroundColor: "#ffffff" },
      files: {},
    });
    const zip = zipSync({
      "drawings/wireframe.excalidraw": new Uint8Array(strToU8(file)),
    });
    const summary = await importBackup(new Blob([zip.slice()]), "merge");
    expect(summary.projectsAdded).toBe(1);
    expect(summary.designsAdded).toBe(1);
    const project = (await listProjects())[0];
    expect(project.name).toBe("Imported drawings");
    const designs = await listDesigns(project.id);
    expect(designs[0].name).toBe("wireframe");
    expect(designs[0].sceneVersion).toBeGreaterThan(0);

    // named after the zip when the file name is known
    await importBackup(new Blob([zip.slice()]), "merge", "Sketches 2024.zip");
    expect((await listProjects()).map((p) => p.name).sort()).toEqual([
      "Imported drawings",
      "Sketches 2024",
    ]);
  });

  it("imports .excalidraw files as designs", async () => {
    const project = await createProject();
    const good = new File(
      [
        JSON.stringify({
          type: "excalidraw",
          version: 2,
          elements: [rect("r1")],
          appState: {},
          files: {},
        }),
      ],
      "Landing page.excalidraw",
      { type: "application/json" },
    );
    const bad = new File(["not json"], "broken.excalidraw");
    const { designs, errors } = await importExcalidrawFiles(project.id, [
      good,
      bad,
    ]);
    expect(designs.map((d) => d.name)).toEqual(["Landing page"]);
    expect(errors).toHaveLength(1);
    expect((await getScene(designs[0].id))?.elements).toHaveLength(1);
  });
});
