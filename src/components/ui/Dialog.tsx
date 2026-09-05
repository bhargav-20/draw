import clsx from "clsx";
import React, { useCallback, useEffect, useId, useRef } from "react";

import { CloseIcon } from "../icons";

import { Portal } from "./Portal";

import "./Dialog.scss";

// styles: `.Modal*`, `.Dialog*` from @excalidraw/excalidraw/index.css
// (port of upstream components/Dialog.tsx + Modal.tsx)

export type DialogSize = number | "small" | "regular" | "wide";

const getDialogSize = (size: DialogSize | undefined): number => {
  if (typeof size === "number") {
    return size;
  }
  switch (size) {
    case "small":
      return 550;
    case "wide":
      return 1024;
    case "regular":
    default:
      return 800;
  }
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusable = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hidden && !element.closest("[hidden]"),
  );

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode | false;
  children: React.ReactNode;
  size?: DialogSize;
  className?: string;
  /** don't close on backdrop click / Escape (e.g. while an import is running) */
  locked?: boolean;
  closeOnClickOutside?: boolean;
};

export const Dialog = ({
  open,
  onClose,
  title,
  children,
  size = "regular",
  className,
  locked,
  closeOnClickOutside = true,
}: DialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    if (!locked) {
      onClose();
    }
  }, [locked, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    previouslyFocused.current = document.activeElement;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      // focus trap: Tab / Shift+Tab loop over the dialog's focusable elements
      if (event.key === "Tab" && contentRef.current) {
        const focusable = getFocusable(contentRef.current);
        if (!focusable.length) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const inside = contentRef.current.contains(active);
        if (event.shiftKey && (active === first || !inside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || !inside)) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // focus the first focusable element
    const timer = window.setTimeout(() => {
      const first = contentRef.current?.querySelector<HTMLElement>(
        "input, textarea, [autofocus], button:not(.Dialog__close)",
      );
      first?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, close]);

  if (!open) {
    return null;
  }

  return (
    <Portal kind="modal">
      <div
        className="Modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={
          { "--max-width": `${getDialogSize(size)}px` } as React.CSSProperties
        }
      >
        <div
          className="Modal__background"
          onClick={closeOnClickOutside ? close : undefined}
        />
        <div className="Modal__content" ref={contentRef}>
          <div className={clsx("Island Dialog", className)}>
            {title !== false && (
              <h2 id={titleId} className="Dialog__title">
                {title}
              </h2>
            )}
            <button
              className="Dialog__close"
              onClick={close}
              title="Close"
              aria-label="Close"
              type="button"
            >
              {CloseIcon}
            </button>
            <div className="Dialog__content">{children}</div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export const DialogActions = ({ children }: { children: React.ReactNode }) => (
  <div className="Dialog__actions">{children}</div>
);

// port of upstream components/DialogActionButton.tsx
export const DialogActionButton = ({
  label,
  onClick,
  actionType,
  disabled,
  icon,
  type = "button",
  autoFocus,
}: {
  label: string;
  onClick?: () => void;
  actionType?: "primary" | "danger";
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit";
  autoFocus?: boolean;
}) => (
  <button
    className={clsx("Dialog__action-button", {
      "Dialog__action-button--danger": actionType === "danger",
      "Dialog__action-button--primary": actionType === "primary",
    })}
    type={type}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    autoFocus={autoFocus}
  >
    {icon && <div aria-hidden>{icon}</div>}
    <div>{label}</div>
  </button>
);
