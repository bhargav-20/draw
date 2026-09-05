import clsx from "clsx";
import React, { forwardRef } from "react";

// styles: `.excalidraw .ExcButton*` from @excalidraw/excalidraw/index.css
// (port of upstream components/FilledButton.tsx – the component itself is not exported)

export type ButtonVariant = "filled" | "outlined" | "icon";
export type ButtonColor =
  | "primary"
  | "danger"
  | "warning"
  | "muted"
  | "success";
export type ButtonSize = "medium" | "large";

export type FilledButtonProps = {
  label: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
};

export const FilledButton = forwardRef<HTMLButtonElement, FilledButtonProps>(
  (
    {
      children,
      icon,
      onClick,
      label,
      variant = "filled",
      color = "primary",
      size = "medium",
      fullWidth,
      className,
      disabled,
      type = "button",
      title,
      autoFocus,
      ...rest
    },
    ref,
  ) => (
    <button
      className={clsx(
        "ExcButton",
        `ExcButton--color-${color}`,
        `ExcButton--variant-${variant}`,
        `ExcButton--size-${size}`,
        { "ExcButton--fullWidth": fullWidth },
        className,
      )}
      onClick={onClick}
      type={type}
      aria-label={rest["aria-label"] ?? label}
      title={title ?? (variant === "icon" ? label : undefined)}
      ref={ref}
      disabled={disabled}
      autoFocus={autoFocus}
    >
      <div className="ExcButton__contents">
        {icon && (
          <div className="ExcButton__icon" aria-hidden>
            {icon}
          </div>
        )}
        {variant !== "icon" && (children ?? label)}
      </div>
    </button>
  ),
);
FilledButton.displayName = "FilledButton";
