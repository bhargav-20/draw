# Excalidraw Projects — agent notes

Local-first project/design manager in front of the stock Excalidraw editor (`@excalidraw/excalidraw` npm package, embedded unchanged). Vite + React 19 + TS. No server; everything lives in IndexedDB. `reference/excalidraw` is a gitignored, read-only clone of upstream used only to look up design tokens and conventions.

## Commands

```
yarn dev                 # vite dev server (http://localhost:5173)
yarn build               # copy fonts + tsc + vite build → dist/ (+ 404.html copy)
yarn test:all            # typecheck + eslint (0 warnings) + prettier + vitest
yarn fix                 # prettier --write + eslint --fix
```

All four checks in `test:all` must pass before work is considered done.

## Layout

- `src/data/*` — IndexedDB layer (`idb`), one module per store, `events.ts` change bus.
- `src/hooks/*` — `useLiveQuery`, theme, settings, editor persistence.
- `src/components/ui/*` — thin React wrappers that emit Excalidraw's own class names (`.Island`, `.ExcButton…`, `.ExcTextField…`, `.Modal/.Dialog…`, `.dropdown-menu…`).
- `src/components/{dashboard,project,editor,backup,layout}` — pages/features.
- `src/css/app.scss` — root overrides + app-only tokens (`--pc-*` project colours).
- `docs/` (gitignored) — PRD and implementation plan.

## Conventions (mirror upstream Excalidraw)

- `export const Name = (props) => …`; props typed inline or `NameProps`; defaults in destructuring; `clsx`; sibling `Name.scss` imported from the `.tsx`; SCSS scoped under `.excalidraw.ProjectsApp { … }` (portals: `.excalidraw.ProjectsApp-portal`); class names `Block__element--modifier`, PascalCase blocks.
- Use Excalidraw tokens (`var(--color-*)`, `--island-bg-color`, `--border-radius-lg`, `calc(var(--space-factor) * N)`), never hard-coded colours.
- Imports: externals, then `@excalidraw/**`, then relative; `import "./X.scss"` after relative imports; **type imports last** as separate `import type` statements.
- Icons: tabler sources in `src/components/icons.tsx` via `createIcon`, sized by CSS.
- Plain English strings; no i18n.
- Only import runtime code from `@excalidraw/excalidraw` (deep paths are types-only).
- Tests: Vitest + jsdom + Testing Library, co-located `*.test.ts(x)`; fake-indexeddb and a canvas mock are wired in `src/setupTests.ts`.

## Gotchas

- The package must be inlined in Vitest (`server.deps.inline`) and so must `fflate` (cross-realm typed arrays under jsdom).
- Canvas fonts are copied to `public/fonts` by `scripts/copy-fonts.mjs` (postinstall) and resolved at runtime via `window.EXCALIDRAW_ASSET_PATH` set in `index.html`.
- Switching designs remounts `<Excalidraw key={designId}>`; never `updateScene` for that.
- Persisted appState uses the package's `"database"` serializer whitelist.
