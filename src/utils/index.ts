export const randomId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // fallback (very old browsers / non-secure contexts)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const slugify = (value: string, fallback = "untitled"): string => {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
};

export const normalizeTags = (tags: Iterable<string>): string[] => {
  const seen = new Set<string>();
  for (const raw of tags) {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (tag) {
      seen.add(tag);
    }
  }
  return [...seen];
};

export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  timeout: number,
) => {
  let handle = 0;
  let lastArgs: T | null = null;
  const ret = (...args: T) => {
    lastArgs = args;
    clearTimeout(handle);
    handle = window.setTimeout(() => {
      lastArgs = null;
      fn(...args);
    }, timeout);
  };
  ret.flush = () => {
    clearTimeout(handle);
    if (lastArgs) {
      const _lastArgs = lastArgs;
      lastArgs = null;
      fn(..._lastArgs);
    }
  };
  ret.cancel = () => {
    lastArgs = null;
    clearTimeout(handle);
  };
  return ret;
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

export const formatRelativeTime = (
  timestamp: number,
  now: number = Date.now(),
): string => {
  const diff = timestamp - now;
  const abs = Math.abs(diff);
  if (abs < 60_000) {
    return "just now";
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
};

export const formatDateForFilename = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // give the browser a tick to start the download before revoking
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** `Blob.arrayBuffer()` is missing in some environments (jsdom); fall back to FileReader */
export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
};

export const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const isPromiseLike = <T>(value: unknown): value is PromiseLike<T> =>
  !!value && typeof (value as PromiseLike<T>).then === "function";

/**
 * Parses a search query into free-text terms and `#tag` terms.
 */
export const parseSearchQuery = (query: string) => {
  const terms: string[] = [];
  const tags: string[] = [];
  for (const token of query.trim().toLowerCase().split(/\s+/)) {
    if (!token) {
      continue;
    }
    if (token.startsWith("#") && token.length > 1) {
      tags.push(token.slice(1));
    } else {
      terms.push(token);
    }
  }
  return { terms, tags };
};

export const matchesSearch = (
  item: { name: string; tags: string[] },
  query: string,
): boolean => {
  const { terms, tags } = parseSearchQuery(query);
  if (!terms.length && !tags.length) {
    return true;
  }
  const name = item.name.toLowerCase();
  const itemTags = item.tags.map((tag) => tag.toLowerCase());
  const tagsOk = tags.every((tag) => itemTags.some((t) => t.includes(tag)));
  const termsOk = terms.every(
    (term) => name.includes(term) || itemTags.some((t) => t.includes(term)),
  );
  return tagsOk && termsOk;
};

export const nextUntitledName = (base: string, existing: string[]) => {
  const taken = new Set(existing.map((name) => name.trim().toLowerCase()));
  if (!taken.has(base.toLowerCase())) {
    return base;
  }
  let i = 2;
  while (taken.has(`${base} ${i}`.toLowerCase())) {
    i++;
  }
  return `${base} ${i}`;
};

export const copyName = (name: string, existing: string[]) => {
  const base = `${name} copy`;
  return nextUntitledName(base, existing);
};

export const assertNever = (value: never, message?: string): never => {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
};

/** `pluralize(1, "design")` → "1 design", `pluralize(3, "design")` → "3 designs" */
export const pluralize = (count: number, singular: string, plural?: string) =>
  `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
