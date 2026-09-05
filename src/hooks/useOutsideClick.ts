import { useEffect } from "react";

import type { RefObject } from "react";

/**
 * Calls `onOutsideClick` for pointer-downs outside `ref` (and outside any
 * element matching `ignoreSelector`). Mirrors upstream `useOutsideClick`.
 */
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: (event: PointerEvent) => void,
  enabled = true,
  ignoreSelector?: string,
) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handler = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || !ref.current) {
        return;
      }
      if (ref.current.contains(target)) {
        return;
      }
      if (ignoreSelector && target.closest(ignoreSelector)) {
        return;
      }
      onOutsideClick(event);
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [ref, onOutsideClick, enabled, ignoreSelector]);
};
