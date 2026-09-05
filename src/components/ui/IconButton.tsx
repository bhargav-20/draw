import clsx from "clsx";
import React, { forwardRef } from "react";

import "./IconButton.scss";

export type IconButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** `default` = outlined surface button (like Excalidraw's menu button); `ghost` = borderless */
  variant?: "default" | "ghost";
  size?: "sm" | "md";
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
};

/**
 * Square icon-only button using Excalidraw's `outlineButtonStyles` grammar
 * (`.dropdown-menu-button` look for `default`).
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      onClick,
      variant = "default",
      size = "md",
      selected,
      disabled,
      className,
      style,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={clsx(
        "IconButton",
        `IconButton--${variant}`,
        `IconButton--${size}`,
        { "IconButton--selected": selected },
        className,
      )}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {icon}
    </button>
  ),
);
IconButton.displayName = "IconButton";
