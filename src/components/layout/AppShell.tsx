import clsx from "clsx";
import React from "react";
import { Link } from "react-router";

import { APP_NAME } from "../../constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { LogoIcon, MoonIcon, SunIcon, SystemThemeIcon } from "../icons";
import { DropdownMenu, IconButton } from "../ui";

import "./AppShell.scss";

import type { ThemeSetting } from "../../types";

const THEME_OPTIONS: {
  value: ThemeSetting;
  label: string;
  icon: React.ReactElement;
}[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: SystemThemeIcon },
];

export const ThemeMenu = () => {
  const { appTheme, editorTheme, setAppTheme } = useAppTheme();
  return (
    <DropdownMenu
      trigger={(props) => (
        <IconButton
          {...props}
          label="Theme"
          icon={editorTheme === "dark" ? MoonIcon : SunIcon}
        />
      )}
    >
      {THEME_OPTIONS.map((option) => (
        <DropdownMenu.Item
          key={option.value}
          icon={option.icon}
          selected={appTheme === option.value}
          onSelect={() => setAppTheme(option.value)}
        >
          {option.label}
        </DropdownMenu.Item>
      ))}
    </DropdownMenu>
  );
};

/**
 * Page chrome for the dashboard & project pages: the `.excalidraw` root
 * (design tokens + theme) and a header with the logo. The editor page does
 * not use it – Excalidraw renders its own root there.
 */
export const AppShell = ({
  children,
  headerCenter,
  headerRight,
  className,
}: {
  children: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}) => {
  const { editorTheme } = useAppTheme();
  return (
    <div
      className={clsx("excalidraw ProjectsApp", className, {
        "theme--dark": editorTheme === "dark",
      })}
    >
      <header className="AppHeader">
        <Link
          to="/"
          className="AppHeader__logo"
          aria-label={`${APP_NAME} home`}
        >
          <span className="AppHeader__logo-mark">{LogoIcon}</span>
          <span className="AppHeader__logo-text">{APP_NAME}</span>
        </Link>
        <div className="AppHeader__center">{headerCenter}</div>
        <div className="AppHeader__right">
          {headerRight}
          <ThemeMenu />
        </div>
      </header>
      <main className="PageContainer">{children}</main>
    </div>
  );
};
