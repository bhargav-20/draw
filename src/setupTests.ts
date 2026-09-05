import "vitest-canvas-mock";
import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";

import { IDBFactory } from "fake-indexeddb";

import { _resetDBForTests } from "./data/db";

// fresh database per test
beforeEach(async () => {
  await _resetDBForTests();
  (globalThis as any).indexedDB = new IDBFactory();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
