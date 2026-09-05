import clsx from "clsx";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useOutsideClick } from "../../hooks/useOutsideClick";

import { Portal } from "./Portal";

import "./DropdownMenu.scss";

// styles: `.dropdown-menu*` from @excalidraw/excalidraw/index.css
// (a host-app port of upstream components/dropdownMenu – positioned via portal
// so it can escape overflow-hidden cards)

type MenuContextValue = {
  close: () => void;
};

const MenuContext = createContext<MenuContextValue>({ close: () => {} });

type Placement = "bottom-start" | "bottom-end";

export type DropdownMenuProps = {
  /** the element that opens the menu; must forward `ref` and `onClick` */
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: (event: React.MouseEvent) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
  }) => React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

export const DropdownMenu = ({
  trigger,
  children,
  placement = "bottom-end",
  className,
  onOpenChange,
}: DropdownMenuProps) => {
  const [open, setOpenState] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<React.CSSProperties>({});

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  useOutsideClick(menuRef, close, open, ".dropdown-menu-trigger--active");

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();
      const menuHeight = menuRect?.height ?? 0;
      const menuWidth = menuRect?.width ?? 0;
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < menuHeight + gap && rect.top > menuHeight + gap
          ? rect.top - menuHeight - gap
          : rect.bottom + gap;
      let left =
        placement === "bottom-end" ? rect.right - menuWidth : rect.left;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      setPosition({ top, left });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, placement, close]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = Array.from(
          menuRef.current?.querySelectorAll<HTMLElement>(
            ".dropdown-menu-item:not([disabled])",
          ) ?? [],
        );
        if (!items.length) {
          return;
        }
        event.preventDefault();
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === "ArrowDown"
            ? items[(index + 1) % items.length]
            : items[(index - 1 + items.length) % items.length];
        next.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      menuRef.current
        ?.querySelector<HTMLElement>(".dropdown-menu-item:not([disabled])")
        ?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [open, close]);

  return (
    <MenuContext.Provider value={{ close }}>
      {trigger({
        ref: triggerRef,
        onClick: (event) => {
          event.stopPropagation();
          event.preventDefault();
          setOpen(!open);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
      })}
      {open && (
        <Portal kind="popover">
          <div
            ref={menuRef}
            role="menu"
            className={clsx("dropdown-menu ProjectsApp-menu", className)}
            style={{ position: "fixed", ...position }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dropdown-menu-container">{children}</div>
          </div>
        </Portal>
      )}
    </MenuContext.Provider>
  );
};

export type DropdownMenuItemProps = {
  icon?: React.ReactNode;
  onSelect: () => void;
  children: React.ReactNode;
  shortcut?: string;
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
};

const MenuItem = ({
  icon,
  onSelect,
  children,
  shortcut,
  selected,
  disabled,
  danger,
  className,
}: DropdownMenuItemProps) => {
  const { close } = useContext(MenuContext);
  return (
    <button
      role="menuitem"
      type="button"
      className={clsx("dropdown-menu-item dropdown-menu-item-base", className, {
        "dropdown-menu-item--selected": selected,
        "dropdown-menu-item--danger": danger,
      })}
      disabled={disabled}
      onClick={() => {
        close();
        onSelect();
      }}
    >
      {icon && <div className="dropdown-menu-item__icon">{icon}</div>}
      <div className="dropdown-menu-item__text">{children}</div>
      {shortcut && (
        <div className="dropdown-menu-item__shortcut">{shortcut}</div>
      )}
    </button>
  );
};

const MenuSeparator = () => (
  <div className="dropdown-menu-separator" role="separator" />
);

const MenuGroup = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="dropdown-menu-group" role="group" aria-label={title}>
    {title && <p className="dropdown-menu-group-title">{title}</p>}
    {children}
  </div>
);

DropdownMenu.Item = MenuItem;
DropdownMenu.Separator = MenuSeparator;
DropdownMenu.Group = MenuGroup;
