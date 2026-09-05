import { useEffect, useRef, useState } from "react";

import type { Design } from "../types";

type CacheEntry = { url: string; refs: number };

/**
 * Object URLs per `${designId}:${thumbnailUpdatedAt}`, shared by every
 * component showing that thumbnail and revoked once the last one lets go.
 * Live queries hand out a fresh `Design` object on every store change, so
 * keying on the bytes' identity would rebuild every URL on each refresh.
 */
const cache = new Map<string, CacheEntry>();

const acquire = (key: string, bytes: ArrayBuffer): string => {
  let entry = cache.get(key);
  if (!entry) {
    entry = {
      url: URL.createObjectURL(new Blob([bytes], { type: "image/png" })),
      refs: 0,
    };
    cache.set(key, entry);
  }
  entry.refs++;
  return entry.url;
};

const release = (key: string) => {
  const entry = cache.get(key);
  if (entry && --entry.refs <= 0) {
    cache.delete(key);
    URL.revokeObjectURL(entry.url);
  }
};

const thumbnailKey = (
  design: Pick<Design, "id" | "thumbnail" | "thumbnailUpdatedAt">,
) => `${design.id}:${design.thumbnailUpdatedAt ?? 0}`;

/**
 * Object URL for a design's stored thumbnail (raw PNG bytes), or `null` when
 * there is none (or `URL.createObjectURL` is unavailable, e.g. jsdom).
 */
export const useThumbnailUrl = (
  design:
    | Pick<Design, "id" | "thumbnail" | "thumbnailUpdatedAt">
    | null
    | undefined,
): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  const key =
    design?.thumbnail && typeof URL.createObjectURL === "function"
      ? thumbnailKey(design)
      : null;
  // the bytes belong to the key; a ref keeps them out of the effect deps
  const bytesRef = useRef(design?.thumbnail);
  bytesRef.current = design?.thumbnail;

  useEffect(() => {
    const bytes = bytesRef.current;
    if (!key || !bytes) {
      setUrl(null);
      return;
    }
    setUrl(acquire(key, bytes));
    return () => release(key);
  }, [key]);

  return url;
};
