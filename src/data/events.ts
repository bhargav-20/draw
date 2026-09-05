/**
 * Tiny change bus. Every write to the database emits the affected store name so
 * live queries (`useLiveQuery`) can re-run. Kept deliberately minimal – no
 * external state library is needed for a single-user local app.
 */

export type StoreName =
  | "projects"
  | "designs"
  | "scenes"
  | "settings"
  | "library";

type Listener = (stores: ReadonlySet<StoreName>) => void;

const listeners = new Set<Listener>();
let pending: Set<StoreName> | null = null;

export const dbEvents = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** batched per microtask so a transaction touching many stores notifies once */
  emit(...stores: StoreName[]) {
    if (!pending) {
      pending = new Set();
      queueMicrotask(() => {
        const stores = pending!;
        pending = null;
        for (const listener of listeners) {
          listener(stores);
        }
      });
    }
    for (const store of stores) {
      pending.add(store);
    }
  },
};
