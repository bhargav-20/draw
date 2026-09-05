import { useEffect, useState } from "react";

/**
 * Creates an object URL for a Blob (or raw PNG bytes, as thumbnails are
 * stored) and revokes it when the source changes or the component unmounts.
 * Returns `null` while there is nothing to show (or in environments without
 * `URL.createObjectURL`, e.g. jsdom).
 */
export const useObjectUrl = (
  source: Blob | ArrayBuffer | null | undefined,
  type = "image/png",
): string | null => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source || typeof URL.createObjectURL !== "function") {
      setUrl(null);
      return;
    }
    const blob = source instanceof Blob ? source : new Blob([source], { type });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [source, type]);

  return url;
};
