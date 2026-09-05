import clsx from "clsx";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useAppTheme } from "../../hooks/useAppTheme";

import type React from "react";

/**
 * Renders children into `document.body` inside an `.excalidraw`-classed
 * wrapper so Excalidraw's design tokens (and the dark theme) still resolve.
 */
export const Portal = ({
  children,
  className,
  kind = "modal",
}: {
  children: React.ReactNode;
  className?: string;
  kind?: "modal" | "popover";
}) => {
  const { editorTheme } = useAppTheme();
  const [container] = useState(() => document.createElement("div"));

  useLayoutEffect(() => {
    document.body.appendChild(container);
    return () => {
      container.remove();
    };
  }, [container]);

  useLayoutEffect(() => {
    container.className = clsx(
      "excalidraw ProjectsApp-portal",
      { "theme--dark": editorTheme === "dark" },
      { "ProjectsApp-portal--popover": kind === "popover" },
      className,
    );
  }, [container, editorTheme, className, kind]);

  return createPortal(children, container);
};
