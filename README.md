# Excalidraw Projects

A project-management layer in front of the open-source [Excalidraw](https://github.com/excalidraw/excalidraw) canvas. Group the iterations of one piece of work into a **project**, keep each iteration as a **design**, and never lose anything: all data lives in your browser's IndexedDB and can be exported as a zip of standard `.excalidraw` files.

- Dashboard of projects (emoji/colour labels, tags, search, sort, archive, drag to reorder)
- Project page with design thumbnails, duplicate/rename/move/archive, drag to reorder
- The unmodified Excalidraw editor with a breadcrumb and a "Designs" sidebar for quick switching
- Autosave to IndexedDB (same debounced pattern excalidraw.com uses)
- Export everything or a single project as a zip; import/restore (merge or replace); import `.excalidraw` files
- Installable PWA, works fully offline; light / dark / system theme
- No accounts, no server, no telemetry

## Develop

```bash
yarn install        # also copies Excalidraw's fonts into public/fonts
yarn dev            # http://localhost:5173
yarn test:all       # typecheck + lint + prettier + unit tests
yarn build          # static build in dist/
```

Node ≥ 20 and yarn 1.x.

## Deploy

`dist/` is a static SPA.

- **Vercel**: `vercel.json` rewrites everything to `index.html`.
- **Netlify**: `public/_redirects` does the same.
- **GitHub Pages**: build with `VITE_BASE_PATH=/<repo>/ yarn build`; `dist/404.html` is a copy of `index.html` so deep links work.

## Backup format

```
manifest.json                              # projects + designs metadata (no scene data)
projects/<project>--<id>/<design>--<id>.excalidraw
projects/<project>--<id>/thumbnails/<id>.png
```

Every `.excalidraw` file is a stock Excalidraw file and opens on excalidraw.com.

## License

The app code is MIT. Excalidraw is MIT licensed by its authors.
