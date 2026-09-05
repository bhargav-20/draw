import clsx from "clsx";

import React from "react";

// styles: `.excalidraw .Island` from @excalidraw/excalidraw/index.css

type IslandProps = {
  children: React.ReactNode;
  /** multiplied by `--space-factor` (0.25rem) */
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style" | "className">;

export const Island = React.forwardRef<HTMLDivElement, IslandProps>(
  ({ children, padding, className, style, ...rest }, ref) => (
    <div
      className={clsx("Island", className)}
      style={{ "--padding": padding, ...style } as React.CSSProperties}
      ref={ref}
      {...rest}
    >
      {children}
    </div>
  ),
);
Island.displayName = "Island";
