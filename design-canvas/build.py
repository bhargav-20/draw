#!/usr/bin/env python3
"""Generates the design-canvas artboards (.dc.html) from Excalidraw's real tokens.

Values are lifted verbatim from reference/excalidraw/packages/excalidraw/css/theme.scss and
the component .scss files (Island, FilledButton, TextField, DropdownMenu, Sidebar, Dialog).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&family=Caveat:wght@500&display=swap">'

TOKENS = """
    body { margin: 0; }
    .app {
      /* ---- verbatim from packages/excalidraw/css/theme.scss (.excalidraw) ---- */
      --ui-font: Assistant, system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --hand-font: Caveat, "Comic Sans MS", cursive;
      --color-primary: #6965db;
      --color-primary-darker: #5b57d1;
      --color-primary-darkest: #4a47b1;
      --color-primary-light: #e3e2fe;
      --color-primary-light-darker: #d7d5ff;
      --color-primary-hover: #5753d0;
      --color-brand-hover: #5753d0;
      --color-brand-active: #4440bf;
      --color-on-primary-container: #030064;
      --color-surface-primary-container: #e0dfff;
      --color-surface-high: #f1f0ff;
      --color-surface-mid: #f6f6f9;
      --color-surface-low: #ececf4;
      --color-surface-lowest: #ffffff;
      --color-on-surface: #1b1b1f;
      --color-border-outline: #767680;
      --color-border-outline-variant: #c5c5d0;
      --color-gray-10: #f5f5f5; --color-gray-20: #ebebeb; --color-gray-30: #d6d6d6; --color-gray-40: #b8b8b8;
      --color-gray-50: #999999; --color-gray-60: #7a7a7a; --color-gray-70: #5c5c5c; --color-gray-80: #3d3d3d;
      --color-gray-85: #242424; --color-gray-90: #1e1e1e; --color-gray-100: #121212;
      --color-danger: #db6965; --color-danger-dark: #db6965; --color-danger-text: black;
      --color-danger-background: #fff0f0; --color-danger-color: #700000;
      --color-logo-text: #190064;
      --island-bg-color: #ffffff;
      --default-bg-color: #fff;
      --dialog-border-color: var(--color-gray-20);
      --input-bg-color: #fff;
      --input-border-color: #ced4da;
      --link-color: #1c7ed6;
      --keybinding-color: var(--color-gray-40);
      --text-primary-color: var(--color-on-surface);
      --icon-fill-color: var(--color-on-surface);
      --default-border-color: var(--color-surface-high);
      --button-hover-bg: var(--color-surface-high);
      --sidebar-border-color: var(--color-surface-high);
      --sidebar-bg-color: var(--island-bg-color);
      --shadow-island: 0px 0px 1px 0px rgba(0, 0, 0, 0.17), 0px 0px 3px 0px rgba(0, 0, 0, 0.08), 0px 7px 14px 0px rgba(0, 0, 0, 0.05);
      --shadow-island-stronger: 0px 0px 1px 0px rgba(0, 0, 0, 0.17), 0px 0px 3px 0px rgba(0, 0, 0, 0.08), 0px 7px 14px 0px rgb(0 0 0 / 18%);
      --modal-shadow: 0px 100px 80px rgba(0,0,0,0.07), 0px 41.7776px 33.4221px rgba(0,0,0,0.0503198), 0px 22.3363px 17.869px rgba(0,0,0,0.0417275), 0px 12.5216px 10.0172px rgba(0,0,0,0.035), 0px 6.6501px 5.32008px rgba(0,0,0,0.0282725), 0px 2.76726px 2.21381px rgba(0,0,0,0.0196802);
      --sidebar-shadow: var(--modal-shadow);
      --space-factor: 0.25rem;
      --border-radius-md: 0.375rem;
      --border-radius-lg: 0.5rem;
      --default-button-size: 2rem;
      --default-icon-size: 1rem;
      --lg-button-size: 2.25rem;
      --lg-icon-size: 1rem;
      --editor-container-padding: 1rem;
      --right-sidebar-width: 302px;
      /* ---- ExcTextField tokens (components/TextField.scss) ---- */
      --ExcTextField--color: var(--color-on-surface);
      --ExcTextField--background: var(--color-surface-low);
      --ExcTextField--border: var(--color-gray-20);
      --ExcTextField--border-hover: var(--color-brand-hover);
      --ExcTextField--border-active: var(--color-brand-active);
      --ExcTextField--placeholder: var(--color-border-outline-variant);
      /* ---- app-only tokens: project accents (open-color 0 / 7) ---- */
      --pc-gray-bg: #f1f3f5;   --pc-gray: #868e96;
      --pc-violet-bg: #f3f0ff; --pc-violet: #7048e8;
      --pc-blue-bg: #e7f5ff;   --pc-blue: #1c7ed6;
      --pc-teal-bg: #e6fcf5;   --pc-teal: #0ca678;
      --pc-green-bg: #ebfbee;  --pc-green: #37b24d;
      --pc-yellow-bg: #fff9db; --pc-yellow: #f59f00;
      --pc-orange-bg: #fff4e6; --pc-orange: #f76707;
      --pc-red-bg: #fff5f5;    --pc-red: #e03131;
      --pc-pink-bg: #fff0f6;   --pc-pink: #d6336c;

      font-family: var(--ui-font);
      color: var(--text-primary-color);
      background: var(--default-bg-color);
      font-size: 0.875rem;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .app.theme--dark {
      /* ---- verbatim from .excalidraw.theme--dark ---- */
      --color-primary: #a8a5ff;
      --color-primary-darker: #b2aeff;
      --color-primary-darkest: #beb9ff;
      --color-primary-light: #4f4d6f;
      --color-primary-light-darker: #43415e;
      --color-primary-hover: #bbb8ff;
      --color-brand-hover: #bbb8ff;
      --color-brand-active: #d0ccff;
      --color-on-primary-container: #e0dfff;
      --color-surface-primary-container: #403e6a;
      --color-surface-high: #2e2d39;
      --color-surface-low: hsl(240, 8%, 15%);
      --color-surface-mid: hsl(240 6% 10%);
      --color-surface-lowest: hsl(0, 0%, 7%);
      --color-on-surface: #e3e3e8;
      --color-border-outline: #8e8d9c;
      --color-border-outline-variant: #46464f;
      --color-danger: #ffa8a5; --color-danger-dark: #672120; --color-danger-text: #fbcbcc;
      --color-danger-background: #fbcbcc; --color-danger-color: #261919;
      --color-logo-text: #e2dfff;
      --island-bg-color: #232329;
      --default-bg-color: #121212;
      --dialog-border-color: var(--color-gray-80);
      --input-bg-color: #121212;
      --input-border-color: #2e2e2e;
      --link-color: #4dabf7;
      --keybinding-color: var(--color-gray-60);
      --ExcTextField--border: var(--color-border-outline-variant);
      --pc-gray-bg: #2b2d31;   --pc-violet-bg: #2f2a4a; --pc-blue-bg: #1f2f43; --pc-teal-bg: #163a30;
      --pc-green-bg: #1d3a24;  --pc-yellow-bg: #3d3416; --pc-orange-bg: #3f2a17; --pc-red-bg: #40201f; --pc-pink-bg: #3f1f2c;
    }
    a { color: var(--link-color); text-decoration: none; }
    a:hover { color: var(--color-brand-hover); text-decoration: underline; }
    /* ---- Island (components/Island.scss) ---- */
    .Island { box-sizing: border-box; background-color: var(--island-bg-color); box-shadow: var(--shadow-island); border-radius: var(--border-radius-lg); position: relative; }
    /* ---- FilledButton (components/FilledButton.scss) ---- */
    .ExcButton { display: flex; justify-content: center; align-items: center; flex-shrink: 0; gap: 0.5rem; border-radius: 0.5rem; border: 1px solid transparent; font-family: var(--ui-font); font-weight: 600; font-size: 0.75rem; min-height: 2.5rem; padding: 0.5rem 1rem; letter-spacing: normal; user-select: none; box-sizing: border-box; cursor: pointer; white-space: nowrap; }
    .ExcButton--large { font-size: 0.875rem; min-height: 3rem; padding: 0.5rem 1.5rem; letter-spacing: 0.4px; gap: 0.75rem; }
    .ExcButton--filled { color: var(--color-surface-lowest); background-color: var(--color-primary); border-color: var(--color-primary); }
    .ExcButton--outlined { color: var(--color-primary); border-color: var(--color-primary); background: transparent; }
    .ExcButton--danger { color: var(--color-danger); border-color: var(--color-danger); background: transparent; }
    .ExcButton svg { width: 1.25rem; height: 1.25rem; }
    /* ---- outline icon button / dropdown-menu-button (DropdownMenu.scss) ---- */
    .IconButton { display: flex; justify-content: center; align-items: center; width: var(--lg-button-size); height: var(--lg-button-size); box-sizing: border-box; border: 1px solid var(--default-border-color); border-radius: var(--border-radius-lg); background-color: var(--color-surface-mid); color: var(--color-on-surface); cursor: pointer; flex-shrink: 0; }
    .IconButton svg { width: var(--lg-icon-size); height: var(--lg-icon-size); }
    .IconButton--ghost { background: transparent; border-color: transparent; width: var(--default-button-size); height: var(--default-button-size); }
    /* ---- ToolIcon (components/ToolIcon.scss) ---- */
    .ToolIcon { width: var(--lg-button-size); height: var(--lg-button-size); display: flex; align-items: center; justify-content: center; border-radius: var(--border-radius-lg); color: var(--icon-fill-color); position: relative; box-sizing: border-box; }
    .ToolIcon svg { width: var(--lg-icon-size); height: var(--lg-icon-size); }
    .ToolIcon--checked { background: var(--color-surface-primary-container); }
    .ToolIcon--checked svg { color: var(--color-on-primary-container); }
    .ToolIcon__keybinding { position: absolute; bottom: 2px; right: 3px; font-size: 0.625rem; color: var(--keybinding-color); }
    /* ---- ExcTextField (components/TextField.scss) ---- */
    .ExcTextField { position: relative; display: flex; flex-direction: column; }
    .ExcTextField__label { font-weight: 600; font-size: 0.875rem; line-height: 150%; margin-bottom: 0.25rem; }
    .ExcTextField__input { box-sizing: border-box; display: flex; align-items: center; height: 3rem; background: var(--ExcTextField--background); border: 1px solid var(--ExcTextField--border); border-radius: 0.5rem; padding: 0 0.75rem; font-size: 1rem; font-weight: 400; line-height: 150%; color: var(--ExcTextField--color); gap: 0.5rem; }
    .ExcTextField__input--placeholder { color: var(--ExcTextField--placeholder); }
    .ExcTextField__input--active { border-color: var(--ExcTextField--border-active); }
    .ExcTextField--hasIcon .ExcTextField__input { padding-left: 2.5rem; }
    .ExcTextField > svg { position: absolute; left: 0.75rem; bottom: 0.875rem; width: 1.25rem; height: 1.25rem; color: var(--color-gray-40); }
    .ExcTextField--compact .ExcTextField__input { height: 2.25rem; font-size: 0.875rem; }
    .ExcTextField--compact > svg { bottom: 0.5rem; width: 1.125rem; height: 1.125rem; }
    /* ---- Switch (components/Switch.scss) ---- */
    .Switch { position: relative; box-sizing: border-box; width: 40px; height: 20px; border-radius: 12px; background: var(--island-bg-color); border: 1px solid var(--color-border-outline); flex-shrink: 0; }
    .Switch::before { content: ""; position: absolute; border-radius: 100%; width: 10px; height: 10px; top: 4px; left: 4px; background: var(--color-on-surface); }
    .Switch--on { background: var(--color-primary); border-color: var(--color-primary); }
    .Switch--on::before { width: 14px; height: 14px; left: 22px; top: 2px; background: var(--island-bg-color); }
    /* ---- Tag chip (app) ---- */
    .Tag { display: inline-flex; align-items: center; height: 1.25rem; padding: 0 0.5rem; border-radius: var(--border-radius-md); background: var(--color-surface-high); color: var(--color-on-primary-container); font-size: 0.75rem; font-weight: 500; line-height: 1; white-space: nowrap; }
    /* ---- Dialog (components/Modal.scss + Dialog.scss) ---- */
    .Modal__content { background: var(--island-bg-color); border: 1px solid var(--dialog-border-color); box-shadow: var(--modal-shadow); border-radius: 0.75rem; box-sizing: border-box; padding: 2.5rem; position: relative; }
    .Dialog__title { margin: 0 0 1.5rem; font-size: 1.25rem; font-weight: 600; border-bottom: 1px solid var(--dialog-border-color); padding: 0 0 0.75rem; }
    .Dialog__close { position: absolute; top: 0.75rem; right: 0.5rem; color: var(--color-gray-40); width: 1.5rem; height: 1.5rem; }
    .Dialog__action-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.5rem; height: 3rem; border: 1px solid var(--default-border-color); border-radius: var(--border-radius-lg); background: transparent; font-size: 0.875rem; font-weight: 600; letter-spacing: 0.4px; color: inherit; box-sizing: border-box; cursor: pointer; }
    .Dialog__action-button--primary { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
    .Dialog__action-button--danger { background: var(--color-danger); border-color: var(--color-danger); color: #fff; }
    /* ---- dropdown menu (components/dropdownMenu/DropdownMenu.scss) ---- */
    .dropdown-menu-container { background: var(--island-bg-color); box-shadow: var(--shadow-island); border-radius: var(--border-radius-lg); padding: 0.5rem; display: flex; flex-direction: column; gap: 1px; min-width: 12rem; }
    .dropdown-menu-item { display: flex; align-items: center; gap: 0.625rem; height: 2rem; padding: 0 0.5rem; font-size: 0.875rem; border-radius: var(--border-radius-md); color: var(--color-on-surface); box-sizing: border-box; }
    .dropdown-menu-item svg { width: 1rem; height: 1rem; }
    .dropdown-menu-item--selected { background: var(--color-primary-light); }
    .dropdown-menu-item--hover { background: var(--button-hover-bg); }
    .dropdown-menu-item--danger { color: var(--color-danger-color); }
    .muted { color: var(--color-gray-60); }
    .sketch { font-family: var(--hand-font); color: var(--color-on-surface); }
"""

# ---- tabler-style icons (stroke, 24 grid) -------------------------------------------------
def icon(paths, size="1rem", stroke="1.5"):
    return (
        f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{stroke}" '
        f'stroke-linecap="round" stroke-linejoin="round" style="width: {size}; height: {size}; flex-shrink: 0;">'
        f'<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>{paths}</svg>'
    )

I = {
    "search": '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path><path d="M21 21l-6 -6"></path>',
    "plus": '<path d="M12 5l0 14"></path><path d="M5 12l14 0"></path>',
    "dots": '<path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>',
    "chevron": '<path d="M6 9l6 6l6 -6"></path>',
    "back": '<path d="M5 12l14 0"></path><path d="M5 12l6 6"></path><path d="M5 12l6 -6"></path>',
    "download": '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 11l5 5l5 -5"></path><path d="M12 4l0 12"></path>',
    "upload": '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 9l5 -5l5 5"></path><path d="M12 4l0 12"></path>',
    "file": '<path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>',
    "archive": '<path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10"></path><path d="M10 12l4 0"></path>',
    "copy": '<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path>',
    "pencil": '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path><path d="M13.5 6.5l4 4"></path>',
    "trash": '<path d="M4 7l16 0"></path><path d="M10 11l0 6"></path><path d="M14 11l0 6"></path><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>',
    "menu": '<path d="M4 6l16 0"></path><path d="M4 12l16 0"></path><path d="M4 18l16 0"></path>',
    "lock": '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path><path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>',
    "hand": '<path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"></path><path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5"></path><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"></path><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"></path>',
    "pointer": '<path d="M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.896l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.128 -1.128a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.896 -2.09a1.2 1.2 0 0 0 -.308 -2.228l-13.563 -3.02l3.02 13.563z"></path>',
    "rect": '<path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>',
    "diamond": '<path d="M10.5 4.5l-6 6a2.12 2.12 0 0 0 0 3l6 6a2.12 2.12 0 0 0 3 0l6 -6a2.12 2.12 0 0 0 0 -3l-6 -6a2.12 2.12 0 0 0 -3 0z"></path>',
    "ellipse": '<path d="M12 12m-9 0a9 7 0 1 0 18 0a9 7 0 1 0 -18 0"></path>',
    "arrow": '<path d="M5 12l14 0"></path><path d="M15 16l4 -4"></path><path d="M15 8l4 4"></path>',
    "line": '<path d="M4 20l16 -16"></path>',
    "text": '<path d="M6 4l12 0"></path><path d="M12 4l0 16"></path><path d="M9 20l6 0"></path>',
    "image": '<path d="M15 8h.01"></path><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>',
    "eraser": '<path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"></path><path d="M18 13.3l-6.3 -6.3"></path>',
    "minus": '<path d="M5 12l14 0"></path>',
    "undo": '<path d="M9 14l-4 -4l4 -4"></path><path d="M5 10h11a4 4 0 1 1 0 8h-1"></path>',
    "redo": '<path d="M15 14l4 -4l-4 -4"></path><path d="M19 10h-11a4 4 0 1 0 0 8h1"></path>',
    "help": '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 17l0 .01"></path><path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4"></path>',
    "layout": '<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M15 4l0 16"></path>',
    "x": '<path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path>',
    "pin": '<path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4"></path><path d="M9 15l-4.5 4.5"></path><path d="M14.5 4l5.5 5.5"></path>',
    "stack": '<path d="M12 4l-8 4l8 4l8 -4l-8 -4"></path><path d="M4 12l8 4l8 -4"></path><path d="M4 16l8 4l8 -4"></path>',
    "grip": '<path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>',
    "check": '<path d="M5 12l5 5l10 -10"></path>',
    "zip": '<path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5.5"></path><path d="M11 17a2 2 0 0 1 2 2"></path><path d="M11 21h-6v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4z"></path>',
}

def logo():
    return (
        '<div style="display: flex; align-items: center; gap: 0.625rem;">'
        '<div style="width: 2rem; height: 2rem; border-radius: 0.5rem; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center;">'
        + icon(I["stack"], "1.125rem", "2") +
        '</div>'
        '<div style="font-size: 1.125rem; font-weight: 600; color: var(--color-logo-text); letter-spacing: -0.01em;">Excalidraw Projects</div>'
        '</div>'
    )

def search_field(placeholder, width="22.5rem", compact=False):
    cls = "ExcTextField ExcTextField--hasIcon" + (" ExcTextField--compact" if compact else "")
    return (
        f'<div class="{cls}" style="width: {width};">'
        + icon(I["search"], "1.25rem") +
        f'<div class="ExcTextField__input"><span class="ExcTextField__input--placeholder">{placeholder}</span></div>'
        '</div>'
    )

def sort_button(label):
    return (
        '<div style="display: flex; align-items: center; gap: 0.5rem; height: 2.25rem; padding: 0 0.625rem 0 0.75rem; border: 1px solid var(--default-border-color); border-radius: var(--border-radius-lg); background: var(--color-surface-mid); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px; box-sizing: border-box;">'
        f'<span class="muted" style="font-weight: 500;">Sort</span><span>{label}</span>' + icon(I["chevron"], "1rem") +
        '</div>'
    )

def switch(label, on=False):
    return (
        '<div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px;">'
        f'<div class="Switch{" Switch--on" if on else ""}"></div><span>{label}</span></div>'
    )

def btn(label, ic=None, variant="filled", large=False):
    cls = f"ExcButton ExcButton--{variant}" + (" ExcButton--large" if large else "")
    return f'<div class="{cls}">{icon(I[ic], "1.25rem") if ic else ""}<span>{label}</span></div>'

def tags(names):
    return '<div style="display: flex; gap: 0.375rem; flex-wrap: wrap;">' + "".join(f'<span class="Tag">{n}</span>' for n in names) + '</div>'

# ---- tiny hand-drawn sketches for thumbnails ------------------------------------------------
SKETCHES = [
    # flow with boxes & arrows
    '<rect x="14" y="22" width="44" height="26" rx="3"></rect><rect x="86" y="22" width="44" height="26" rx="3"></rect><rect x="158" y="22" width="44" height="26" rx="3"></rect><path d="M58 35 H84"></path><path d="M80 31 l4 4 -4 4"></path><path d="M130 35 H156"></path><path d="M152 31 l4 4 -4 4"></path><path d="M108 48 V78 H36 V50"></path><path d="M32 54 l4 -4 4 4"></path>',
    # phone frames
    '<rect x="22" y="12" width="44" height="82" rx="6"></rect><rect x="30" y="24" width="28" height="6" rx="2"></rect><rect x="30" y="36" width="28" height="30" rx="2"></rect><rect x="30" y="72" width="28" height="8" rx="3"></rect><rect x="92" y="12" width="44" height="82" rx="6"></rect><rect x="100" y="24" width="28" height="18"></rect><path d="M100 50 h28 M100 58 h20 M100 66 h24"></path><rect x="100" y="76" width="28" height="8" rx="3"></rect><rect x="162" y="12" width="44" height="82" rx="6"></rect><path d="M170 24 h28 M170 32 h18"></path><circle cx="184" cy="56" r="12"></circle><rect x="170" y="76" width="28" height="8" rx="3"></rect>',
    # architecture
    '<ellipse cx="48" cy="34" rx="30" ry="14"></ellipse><rect x="120" y="20" width="70" height="28" rx="3"></rect><path d="M78 34 H118"></path><path d="M114 30 l4 4 -4 4"></path><rect x="38" y="70" width="60" height="24" rx="3"></rect><rect x="132" y="70" width="60" height="24" rx="3"></rect><path d="M155 48 V68"></path><path d="M151 64 l4 4 4 -4"></path><path d="M68 68 V48"></path><path d="M64 52 l4 -4 4 4"></path>',
    # wireframe page
    '<rect x="16" y="14" width="190" height="82" rx="3"></rect><path d="M16 30 H206"></path><rect x="24" y="19" width="26" height="6" rx="2"></rect><path d="M150 22 h12 M168 22 h12 M186 22 h12"></path><rect x="24" y="40" width="80" height="44" rx="2"></rect><path d="M116 44 h70 M116 54 h60 M116 64 h66"></path><rect x="116" y="72" width="30" height="10" rx="3"></rect>',
    # mindmap
    '<ellipse cx="110" cy="52" rx="26" ry="14"></ellipse><ellipse cx="40" cy="24" rx="20" ry="10"></ellipse><ellipse cx="40" cy="82" rx="20" ry="10"></ellipse><ellipse cx="182" cy="24" rx="20" ry="10"></ellipse><ellipse cx="182" cy="82" rx="20" ry="10"></ellipse><path d="M86 46 Q70 40 60 28 M86 60 Q70 66 60 78 M134 46 Q150 40 162 28 M134 60 Q150 66 162 78"></path>',
    # sequence diagram
    '<rect x="20" y="12" width="40" height="18" rx="3"></rect><rect x="90" y="12" width="40" height="18" rx="3"></rect><rect x="160" y="12" width="40" height="18" rx="3"></rect><path d="M40 30 V94 M110 30 V94 M180 30 V94" stroke-dasharray="4 4"></path><path d="M40 46 H108"></path><path d="M104 42 l4 4 -4 4"></path><path d="M110 62 H178"></path><path d="M174 58 l4 4 -4 4"></path><path d="M180 80 H42"></path><path d="M46 76 l-4 4 4 4"></path>',
    # cart flow
    '<rect x="14" y="30" width="56" height="34" rx="4"></rect><path d="M24 40 h36 M24 48 h24"></path><rect x="96" y="30" width="56" height="34" rx="4"></rect><path d="M106 40 h36 M106 48 h30 M106 56 h18"></path><rect x="178" y="30" width="34" height="34" rx="17"></rect><path d="M188 47 l6 6 10 -12"></path><path d="M70 47 H94"></path><path d="M90 43 l4 4 -4 4"></path><path d="M152 47 H176"></path><path d="M172 43 l4 4 -4 4"></path>',
]

def sketch(idx, w="100%", h="100%"):
    return (
        f'<svg viewBox="0 0 220 106" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width: {w}; height: {h}; color: var(--color-on-surface); opacity: 0.85;">'
        + SKETCHES[idx % len(SKETCHES)] + '</svg>'
    )

def page(title, body, dark=False, bg="var(--default-bg-color)", w=1440, h=900):
    cls = "app theme--dark" if dark else "app"
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <title>{title}</title>
  {FONT_LINK}
  <style>{TOKENS}</style>
</helmet>
<div class="{cls}" style="width: {w}px; height: {h}px; box-sizing: border-box; overflow: hidden; background: {bg}; position: relative;">
{body}
</div>
</x-dc>
</body>
</html>
"""

# =============================================================================================
# 1. Dashboard
# =============================================================================================
PROJECTS = [
    ("🛒", "violet", "Checkout redesign", 7, "edited 2 hours ago", ["web", "payments"]),
    ("📱", "blue", "Mobile onboarding", 4, "edited yesterday", ["ios", "android"]),
    ("🏗️", "orange", "Platform architecture", 9, "edited 3 days ago", ["infra"]),
    ("🧭", "teal", "Navigation explorations", 12, "edited last week", ["web", "ia"]),
    ("📊", "green", "Analytics dashboard", 3, "edited last week", ["data"]),
    ("🔐", "red", "Auth flows", 5, "edited 2 weeks ago", ["security", "web"]),
    ("🗺️", "yellow", "Q4 roadmap", 2, "edited 3 weeks ago", ["planning"]),
    ("🧪", "pink", "Growth experiments", 6, "edited last month", ["growth"]),
]

def project_card(emoji, color, name, count, when, tag_names):
    return (
        '<div class="Island" style="display: flex; flex-direction: column; gap: 0.875rem; padding: 1.25rem; box-sizing: border-box; min-height: 11.5rem;">'
        '<div style="display: flex; align-items: flex-start; justify-content: space-between;">'
        f'<div style="width: 2.75rem; height: 2.75rem; border-radius: 0.625rem; background: var(--pc-{color}-bg); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1;">{emoji}</div>'
        f'<div class="IconButton IconButton--ghost" style="color: var(--color-gray-50);">{icon(I["dots"])}</div>'
        '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; flex-grow: 1;">'
        f'<div style="font-size: 1rem; font-weight: 600; line-height: 1.3;">{name}</div>'
        f'<div class="muted" style="font-size: 0.75rem;">{count} designs · {when}</div>'
        '</div>'
        + tags(tag_names) +
        '</div>'
    )

def header(center, right):
    return (
        '<div style="display: flex; align-items: center; gap: 1.5rem; height: 4rem; padding: 0 2rem; border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + logo() +
        f'<div style="flex-grow: 1; display: flex; justify-content: center;">{center}</div>'
        f'<div style="display: flex; align-items: center; gap: 0.75rem;">{right}</div>'
        '</div>'
    )

def dashboard(dark=False):
    body = header(
        search_field("Search projects, designs, #tags"),
        '<div class="IconButton" title="Import backup">' + icon(I["upload"]) + '</div>'
        '<div class="IconButton" title="Export all projects">' + icon(I["download"]) + '</div>'
        + btn("New project", "plus"),
    )
    body += (
        '<div style="padding: 1.75rem 2rem 2rem; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div style="display: flex; align-items: center; gap: 0.75rem;">'
        '<div style="font-size: 1.25rem; font-weight: 600;">Projects</div>'
        '<div class="muted" style="font-size: 0.875rem;">8</div>'
        '<div style="flex-grow: 1;"></div>'
        + switch("Show archived") + sort_button("Last updated") +
        '</div>'
        '<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem;">'
        + "".join(project_card(*p) for p in PROJECTS) +
        '</div>'
        '<div class="muted" style="font-size: 0.75rem; display: flex; align-items: center; gap: 0.375rem; margin-top: 0.5rem;">'
        + icon(I["lock"], "0.875rem") +
        '<span>Everything is stored in this browser (IndexedDB). Export a backup to keep a copy on disk.</span>'
        '</div>'
        '</div>'
    )
    return page("Dashboard (dark)" if dark else "Dashboard", body, dark=dark)

# =============================================================================================
# 2. Project page
# =============================================================================================
DESIGNS = [
    ("v3 · side cart", "edited 2 hours ago", 6, ["current"]),
    ("v2 · single page", "edited yesterday", 0, []),
    ("v1 · stepper", "edited 3 days ago", 3, []),
    ("Mobile checkout", "edited 4 days ago", 1, ["mobile"]),
    ("Payment methods", "edited last week", 5, []),
    ("Error states", "edited last week", 3, ["edge-cases"]),
    ("Empty cart", "edited 2 weeks ago", 4, []),
]

def design_card(name, when, sk, tag_names):
    return (
        '<div class="Island" style="display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">'
        '<div style="height: 9.5rem; display: flex; align-items: center; justify-content: center; padding: 1rem; background: var(--island-bg-color); border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + sketch(sk) +
        '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.875rem 1rem 1rem;">'
        '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; min-width: 0;">'
        f'<div style="font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</div>'
        f'<div class="muted" style="font-size: 0.75rem;">{when}</div>'
        '</div>'
        f'<div class="IconButton IconButton--ghost" style="color: var(--color-gray-50);">{icon(I["dots"])}</div>'
        '</div>'
        + (tags(tag_names) if tag_names else '') +
        '</div>'
        '</div>'
    )

def new_design_card():
    return (
        '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: 1.5px dashed var(--color-border-outline-variant); border-radius: var(--border-radius-lg); color: var(--color-primary); min-height: 15rem; box-sizing: border-box;">'
        '<div style="width: 2.5rem; height: 2.5rem; border-radius: 100%; background: var(--color-surface-high); display: flex; align-items: center; justify-content: center;">'
        + icon(I["plus"], "1.25rem", "2") +
        '</div>'
        '<div style="font-size: 0.875rem; font-weight: 600;">New design</div>'
        '<div class="muted" style="font-size: 0.75rem;">Blank canvas</div>'
        '</div>'
    )

def project_page():
    body = (
        '<div style="display: flex; align-items: center; gap: 1rem; height: 4rem; padding: 0 2rem; border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + logo() +
        '<div style="flex-grow: 1;"></div>'
        '<div class="IconButton">' + icon(I["upload"]) + '</div>'
        '<div class="IconButton">' + icon(I["download"]) + '</div>'
        '</div>'
        '<div style="padding: 1.5rem 2rem 2rem; display: flex; flex-direction: column; gap: 1.25rem;">'
        # breadcrumb + title row
        '<div style="display: flex; flex-direction: column; gap: 0.75rem;">'
        '<a style="display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px; color: var(--color-gray-60);">'
        + icon(I["back"], "0.875rem") + '<span>All projects</span></a>'
        '<div style="display: flex; align-items: center; gap: 1rem;">'
        '<div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: var(--pc-violet-bg); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; line-height: 1;">🛒</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.25rem;">'
        '<div style="display: flex; align-items: center; gap: 0.5rem;"><div style="font-size: 1.5rem; font-weight: 600; line-height: 1.2;">Checkout redesign</div>'
        + '<div style="color: var(--color-gray-40);">' + icon(I["pencil"], "1rem") + '</div></div>'
        '<div style="display: flex; align-items: center; gap: 0.75rem;"><div class="muted" style="font-size: 0.75rem;">7 designs · created Aug 12</div>' + tags(["web", "payments"]) + '</div>'
        '</div>'
        '<div style="flex-grow: 1;"></div>'
        + btn("Import .excalidraw", "file", "outlined") + btn("Export project", "download", "outlined") +
        '<div class="IconButton">' + icon(I["dots"]) + '</div>'
        '</div>'
        '</div>'
        # toolbar row
        '<div style="display: flex; align-items: center; gap: 0.75rem;">'
        + search_field("Search designs", "18rem", compact=True) + sort_button("Manual order") + switch("Show archived") +
        '<div style="flex-grow: 1;"></div>'
        + btn("New design", "plus") +
        '</div>'
        # grid
        '<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem;">'
        + new_design_card() + "".join(design_card(*d) for d in DESIGNS) +
        '</div>'
        '</div>'
    )
    return page("Project page", body)

# =============================================================================================
# 3. Editor + designs sidebar
# =============================================================================================
def tool(ic, key, checked=False):
    return f'<div class="ToolIcon{" ToolIcon--checked" if checked else ""}">{icon(I[ic])}<span class="ToolIcon__keybinding">{key}</span></div>'

def sidebar_row(name, when, sk, current=False):
    bg = "background: var(--color-primary-light);" if current else ""
    return (
        f'<div style="display: flex; align-items: center; gap: 0.625rem; padding: 0.375rem 0.5rem; border-radius: var(--border-radius-md); {bg}">'
        f'<div style="width: 3.5rem; height: 2.25rem; flex-shrink: 0; border: 1px solid var(--color-surface-high); border-radius: 0.25rem; background: var(--island-bg-color); display: flex; align-items: center; justify-content: center; padding: 0.125rem; box-sizing: border-box;">{sketch(sk)}</div>'
        '<div style="display: flex; flex-direction: column; min-width: 0; flex-grow: 1;">'
        f'<div style="font-size: 0.875rem; font-weight: {600 if current else 500}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</div>'
        f'<div class="muted" style="font-size: 0.6875rem;">{when}</div>'
        '</div>'
        + (icon(I["check"], "1rem", "2").replace('style="', 'style="color: var(--color-primary); ') if current else '<div style="color: var(--color-gray-40);">' + icon(I["grip"]) + '</div>') +
        '</div>'
    )

def editor_page():
    canvas_sketch = (
        '<svg viewBox="0 0 1100 800" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 60px; top: 90px; width: 1000px; height: 700px;">'
        '<rect x="120" y="120" width="220" height="140" rx="6"></rect>'
        '<rect x="480" y="120" width="220" height="140" rx="6"></rect>'
        '<rect x="480" y="360" width="220" height="140" rx="6" stroke="#e03131"></rect>'
        '<rect x="120" y="360" width="220" height="140" rx="6" fill="#e0dfff" fill-opacity="0.6"></rect>'
        '<path d="M340 190 H478"></path><path d="M470 182 l8 8 -8 8"></path>'
        '<path d="M590 260 V358"></path><path d="M582 350 l8 8 8 -8"></path>'
        '<path d="M480 430 H342"></path><path d="M350 422 l-8 8 8 8"></path>'
        '<path d="M230 360 V262"></path><path d="M222 270 l8 -8 8 8"></path>'
        '<rect x="820" y="230" width="180" height="260" rx="14"></rect>'
        '<path d="M850 280 h120 M850 310 h80 M850 340 h100"></path>'
        '<rect x="850" y="430" width="120" height="32" rx="8" fill="#6965db" fill-opacity="0.85" stroke="none"></rect>'
        '</svg>'
        '<div class="sketch" style="position: absolute; left: 250px; top: 260px; font-size: 22px;">Cart</div>'
        '<div class="sketch" style="position: absolute; left: 590px; top: 260px; font-size: 22px;">Address</div>'
        '<div class="sketch" style="position: absolute; left: 570px; top: 500px; font-size: 22px;">Payment</div>'
        '<div class="sketch" style="position: absolute; left: 200px; top: 500px; font-size: 22px;">Confirmation</div>'
        '<div class="sketch" style="position: absolute; left: 905px; top: 300px; font-size: 18px; color: #7a7a7a;">side cart</div>'
        '<div class="sketch" style="position: absolute; left: 300px; top: 620px; font-size: 20px; color: #7a7a7a;">v3 — cart stays visible during payment</div>'
    )
    top_left = '<div class="IconButton" style="position: absolute; left: 1rem; top: 1rem;">' + icon(I["menu"]) + '</div>'
    toolbar = (
        '<div class="Island" style="position: absolute; left: 50%; top: 1rem; transform: translateX(-50%); display: flex; align-items: center; gap: 0.125rem; padding: 0.25rem;">'
        + tool("lock", "") + '<div style="width: 1px; height: 1.5rem; background: var(--default-border-color); margin: 0 0.25rem;"></div>'
        + tool("hand", "H") + tool("pointer", "1", True) + tool("rect", "2") + tool("diamond", "3") + tool("ellipse", "4")
        + tool("arrow", "5") + tool("line", "6") + tool("pencil", "7") + tool("text", "8") + tool("image", "9") + tool("eraser", "0")
        + '</div>'
    )
    top_right = (
        '<div style="position: absolute; right: calc(var(--right-sidebar-width) - 0.5rem + 1rem); top: 1rem; display: flex; align-items: center; gap: 0.5rem;">'
        '<div class="Island" style="display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem 0.25rem 0.25rem; height: 2.25rem; box-sizing: border-box;">'
        '<div class="IconButton IconButton--ghost">' + icon(I["back"]) + '</div>'
        '<span style="font-size: 1rem; line-height: 1;">🛒</span>'
        '<span class="muted" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px;">Checkout redesign</span>'
        '<span class="muted" style="font-size: 0.75rem;">/</span>'
        '<span style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px;">v3 · side cart</span>'
        '</div>'
        '<div style="display: flex; align-items: center; gap: 0.5rem; height: 2.25rem; padding: 0 0.75rem; border-radius: var(--border-radius-lg); background: var(--color-surface-low); box-shadow: 0 0 0 1px var(--color-surface-lowest); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px; box-sizing: border-box; color: var(--color-on-primary-container);">'
        + icon(I["layout"]) + '<span>Designs</span></div>'
        '</div>'
    )
    bottom = (
        '<div class="Island" style="position: absolute; left: 1rem; bottom: 1rem; display: flex; align-items: center; padding: 0.25rem;">'
        '<div class="ToolIcon">' + icon(I["minus"]) + '</div><div style="min-width: 3.5rem; text-align: center; font-size: 0.75rem; font-weight: 600;">100%</div><div class="ToolIcon">' + icon(I["plus"]) + '</div>'
        '</div>'
        '<div class="Island" style="position: absolute; left: 9.25rem; bottom: 1rem; display: flex; align-items: center; padding: 0.25rem;">'
        '<div class="ToolIcon">' + icon(I["undo"]) + '</div><div class="ToolIcon" style="color: var(--color-gray-40);">' + icon(I["redo"]) + '</div>'
        '</div>'
        '<div class="IconButton" style="position: absolute; right: calc(var(--right-sidebar-width) - 0.5rem + 1rem); bottom: 1rem; border-radius: 100%; background: var(--island-bg-color); box-shadow: var(--shadow-island); border: none;">' + icon(I["help"]) + '</div>'
    )
    rows = [("v3 · side cart", "2 hours ago", 6, True), ("v2 · single page", "yesterday", 0, False), ("v1 · stepper", "3 days ago", 3, False),
            ("Mobile checkout", "4 days ago", 1, False), ("Payment methods", "last week", 4, False), ("Error states", "last week", 5, False), ("Empty cart", "2 weeks ago", 2, False)]
    sidebar = (
        '<div style="position: absolute; top: 0; bottom: 0; right: 0; width: calc(var(--right-sidebar-width) - 0.5rem); background: var(--sidebar-bg-color); border-left: 1px solid var(--sidebar-border-color); box-shadow: var(--sidebar-shadow); display: flex; flex-direction: column; box-sizing: border-box;">'
        '<div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0.75rem; border-bottom: 1px solid var(--sidebar-border-color);">'
        '<div style="font-size: 0.875rem; font-weight: 600;">Designs</div>'
        '<div style="display: flex; align-items: center;"><div class="IconButton IconButton--ghost">' + icon(I["pin"]) + '</div><div class="IconButton IconButton--ghost">' + icon(I["x"]) + '</div></div>'
        '</div>'
        '<div style="padding: 0.75rem 0.75rem 0.5rem; display: flex; flex-direction: column; gap: 0.75rem;">'
        '<div style="display: flex; align-items: center; gap: 0.5rem; height: 2.25rem; padding: 0 0.625rem; border: 1px solid var(--ExcTextField--border); border-radius: 0.5rem; background: var(--color-surface-low); font-size: 0.875rem; font-weight: 600; box-sizing: border-box;">'
        '<span style="line-height: 1;">🛒</span><span style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Checkout redesign</span>' + icon(I["chevron"]) + '</div>'
        + search_field("Search designs", "100%", compact=True) +
        '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; padding: 0 0.5rem; flex-grow: 1; overflow: hidden;">'
        + "".join(sidebar_row(*r) for r in rows) +
        '</div>'
        '<div style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid var(--sidebar-border-color);">'
        + btn("New design", "plus").replace('class="ExcButton', 'style="width: 100%; box-sizing: border-box;" class="ExcButton')
        + btn("Duplicate current", "copy", "outlined").replace('class="ExcButton', 'style="width: 100%; box-sizing: border-box;" class="ExcButton') +
        '</div>'
        '</div>'
    )
    return page("Editor with Designs sidebar", canvas_sketch + top_left + toolbar + top_right + bottom + sidebar)

# =============================================================================================
# 4. Dialogs
# =============================================================================================
def field(label, content, active=False):
    return (
        '<div class="ExcTextField" style="width: 100%;">'
        f'<div class="ExcTextField__label">{label}</div>'
        f'<div class="ExcTextField__input{" ExcTextField__input--active" if active else ""}">{content}</div>'
        '</div>'
    )

def new_project_dialog():
    emojis = ["🛒", "📱", "🏗️", "🧭", "📊", "🔐", "🗺️", "🧪", "💡", "🎯"]
    emoji_row = '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' + "".join(
        f'<div style="width: 2.5rem; height: 2.5rem; border-radius: 0.5rem; background: var(--color-surface-low); display: flex; align-items: center; justify-content: center; font-size: 1.375rem; line-height: 1; box-sizing: border-box; {"box-shadow: 0 0 0 2px var(--color-brand-active); background: var(--pc-violet-bg);" if i == 0 else ""}">{e}</div>'
        for i, e in enumerate(emojis)) + '</div>'
    colors = ["gray", "violet", "blue", "teal", "green", "yellow", "orange", "red", "pink"]
    color_row = '<div style="display: flex; gap: 0.625rem;">' + "".join(
        f'<div style="width: 1.5rem; height: 1.5rem; border-radius: 100%; background: var(--pc-{c}); box-sizing: border-box; {"box-shadow: 0 0 0 2px var(--island-bg-color), 0 0 0 4px var(--pc-" + c + ");" if c == "violet" else ""}"></div>'
        for c in colors) + '</div>'
    return (
        '<div class="Modal__content" style="width: 550px; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div class="Dialog__close">' + icon(I["x"], "1.5rem") + '</div>'
        '<div class="Dialog__title" style="margin-bottom: 0;">New project</div>'
        + field("Name", '<span>Checkout redesign</span><span style="width: 1px; height: 1.25rem; background: var(--color-on-surface);"></span>', active=True) +
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;"><div class="ExcTextField__label" style="margin: 0;">Icon</div>' + emoji_row + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem;"><div class="ExcTextField__label" style="margin: 0;">Colour</div>' + color_row + '</div>'
        + field("Tags", '<span class="Tag">web</span><span class="Tag">payments</span><span class="ExcTextField__input--placeholder">Add tag…</span>') +
        '<div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">'
        '<div class="Dialog__action-button">Cancel</div>'
        '<div class="Dialog__action-button Dialog__action-button--primary">' + icon(I["plus"]) + 'Create project</div>'
        '</div>'
        '</div>'
    )

def import_dialog():
    return (
        '<div class="Modal__content" style="width: 550px; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div class="Dialog__close">' + icon(I["x"], "1.5rem") + '</div>'
        '<div class="Dialog__title" style="margin-bottom: 0;">Import backup</div>'
        '<div style="display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; border: 1px solid var(--color-surface-high); border-radius: var(--border-radius-lg); background: var(--color-surface-mid);">'
        '<div style="color: var(--color-primary);">' + icon(I["zip"], "1.75rem", "1.25") + '</div>'
        '<div style="display: flex; flex-direction: column; min-width: 0; flex-grow: 1;">'
        '<div style="font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">excalidraw-projects-backup-2026-09-05.zip</div>'
        '<div class="muted" style="font-size: 0.75rem;">3 projects · 14 designs · exported Sep 5, 2026</div>'
        '</div>'
        '<a style="font-size: 0.75rem; font-weight: 600; white-space: nowrap;">Change file</a>'
        '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem;">'
        '<div class="ExcTextField__label" style="margin: 0;">How should it be imported?</div>'
        '<div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0.875rem; border: 1px solid var(--color-brand-active); border-radius: var(--border-radius-lg); background: var(--color-surface-high);">'
        '<div style="width: 1rem; height: 1rem; border-radius: 100%; border: 5px solid var(--color-primary); box-sizing: border-box; margin-top: 0.125rem; flex-shrink: 0;"></div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem;"><div style="font-size: 0.875rem; font-weight: 600;">Merge into this browser</div><div class="muted" style="font-size: 0.75rem;">Adds projects and designs you don\'t have. For ones you already have, the newer copy wins.</div></div>'
        '</div>'
        '<div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0.875rem; border: 1px solid var(--color-gray-20); border-radius: var(--border-radius-lg);">'
        '<div style="width: 1rem; height: 1rem; border-radius: 100%; border: 1.5px solid var(--color-border-outline); box-sizing: border-box; margin-top: 0.125rem; flex-shrink: 0;"></div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem;"><div style="font-size: 0.875rem; font-weight: 600;">Replace everything</div><div style="font-size: 0.75rem; color: var(--color-danger-color);">Deletes all local projects first. Cannot be undone.</div></div>'
        '</div>'
        '</div>'
        '<div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">'
        '<div class="Dialog__action-button">Cancel</div>'
        '<div class="Dialog__action-button Dialog__action-button--primary">' + icon(I["upload"]) + 'Import 3 projects</div>'
        '</div>'
        '</div>'
    )

def card_menu():
    items = [("pencil", "Open", False, False), ("copy", "Duplicate", False, False), ("text", "Rename", True, False), ("layout", "Move to project…", False, False), ("archive", "Archive", False, False), ("trash", "Delete permanently", False, True)]
    return (
        '<div class="dropdown-menu-container" style="width: 14rem;">'
        + "".join(f'<div class="dropdown-menu-item{" dropdown-menu-item--hover" if h else ""}{" dropdown-menu-item--danger" if d else ""}">{icon(I[ic])}<span>{label}</span></div>' for ic, label, h, d in items) +
        '</div>'
    )

def dialogs_page():
    body = (
        '<div style="display: flex; gap: 3rem; padding: 3rem; align-items: flex-start;">'
        + new_project_dialog() + import_dialog() +
        '<div style="display: flex; flex-direction: column; gap: 1rem;">'
        '<div class="muted" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px;">DESIGN CARD MENU</div>'
        + card_menu() +
        '<div class="muted" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.4px; margin-top: 1rem;">TOAST</div>'
        '<div class="Island" style="display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; width: max-content;">'
        '<div style="color: var(--pc-green);">' + icon(I["check"], "1.125rem", "2") + '</div><span>Imported 3 projects, 14 designs · 2 skipped</span></div>'
        '</div>'
        '</div>'
    )
    return page("Dialogs & menus", body, bg="var(--color-surface-mid)")


FILES = {
    "Main.dc.html": dashboard(False),
    "DashboardDark.dc.html": dashboard(True),
    "ProjectPage.dc.html": project_page(),
    "Editor.dc.html": editor_page(),
    "Dialogs.dc.html": dialogs_page(),
}



# =============================================================================================
# 5. Card & modal directions  (three systems for the New-project modal + the two card types)
# =============================================================================================
def dots(step=12, colour="rgba(0,0,0,.07)"):
    """Excalidraw's canvas dot grid, as a background shorthand."""
    return (f"background-image: radial-gradient(circle at 1px 1px, {colour} 1px, transparent 0); "
            f"background-size: {step}px {step}px;")

def stage(label, inner, pad="1.75rem", bg="var(--default-bg-color)"):
    return (
        '<div style="display: flex; flex-direction: column; gap: 0.625rem;">'
        f'<div style="font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-gray-50);">{label}</div>'
        f'<div style="background: {bg}; border: 1px solid var(--color-gray-20); border-radius: 0.75rem; padding: {pad}; box-sizing: border-box;">{inner}</div>'
        '</div>'
    )

def board_head(eyebrow, name, why, cost):
    return (
        '<div style="display: flex; flex-direction: column; gap: 0.375rem; max-width: 46rem;">'
        f'<div style="font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-primary);">{eyebrow}</div>'
        f'<div style="font-size: 1.75rem; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em;">{name}</div>'
        f'<div style="font-size: 0.875rem; line-height: 1.5; color: var(--color-gray-70);">{why}</div>'
        '<div style="display: flex; gap: 0.5rem; align-items: baseline; margin-top: 0.125rem;">'
        '<span style="font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-gray-50); flex-shrink: 0;">Trade-off</span>'
        f'<span style="font-size: 0.8125rem; line-height: 1.5; color: var(--color-gray-60);">{cost}</span>'
        '</div>'
        '</div>'
    )

def dir_board(eyebrow, name, why, cost, modal, project_cards, design_cards, height):
    body = (
        '<div style="display: flex; flex-direction: column; gap: 1.75rem; padding: 2.25rem 2.5rem;">'
        + board_head(eyebrow, name, why, cost) +
        '<div style="display: flex; gap: 2.5rem; align-items: flex-start;">'
        f'<div style="width: 37.5rem; flex-shrink: 0;">{stage("New project modal", modal, bg="var(--color-surface-mid)")}</div>'
        '<div style="display: flex; flex-direction: column; gap: 1.75rem; flex-grow: 1; min-width: 0;">'
        + stage("Project card — dashboard", project_cards)
        + stage("Design card — project page", design_cards) +
        '</div></div></div>'
    )
    return page(name, body, bg="#fbfbfd", w=1440, h=height)

# ---- the three surfaces, per direction -------------------------------------------------------
EMOJI_ROW = ["🛒", "📱", "🏗️", "🧭", "📊", "🔐", "🗺️", "🧪", "💡", "🎯"]
COLOUR_ROW = ["gray", "violet", "blue", "teal", "green", "yellow", "orange", "red", "pink"]

def swatches(selected="violet", size="1.5rem", gap="0.625rem"):
    return f'<div style="display: flex; gap: {gap};">' + "".join(
        f'<div style="width: {size}; height: {size}; border-radius: 100%; background: var(--pc-{c}); box-sizing: border-box;'
        + (f' box-shadow: 0 0 0 2px var(--island-bg-color), 0 0 0 4px var(--pc-{c});' if c == selected else '')
        + '"></div>' for c in COLOUR_ROW) + '</div>'

def emoji_tiles(selected=0, accent="violet", tile="2.375rem", cols=10, font="1.25rem"):
    return (f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: 0.375rem;">' + "".join(
        f'<div style="height: {tile}; border-radius: var(--border-radius-lg); background: var(--color-surface-low); display: flex; align-items: center; justify-content: center; font-size: {font}; line-height: 1; box-sizing: border-box;'
        + (f' background: var(--pc-{accent}-bg); box-shadow: 0 0 0 2px var(--pc-{accent});' if i == selected else '')
        + f'">{e}</div>' for i, e in enumerate(EMOJI_ROW)) + '</div>')

def dialog_actions():
    return ('<div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.25rem;">'
            '<div class="Dialog__action-button">Cancel</div>'
            '<div class="Dialog__action-button Dialog__action-button--primary">' + icon(I["plus"]) + 'Create project</div>'
            '</div>')

def tag_field():
    return field("Tags", '<span class="Tag">web</span><span class="Tag">payments</span><span class="ExcTextField__input--placeholder">Add tag…</span>')

def name_field(value="Checkout redesign", compact=False):
    caret = '<span style="width: 1px; height: 1.25rem; background: var(--color-on-surface);"></span>'
    cls = "ExcTextField ExcTextField--compact" if compact else "ExcTextField"
    return (f'<div class="{cls}" style="width: 100%;">'
            '<div class="ExcTextField__label">Name</div>'
            f'<div class="ExcTextField__input ExcTextField__input--active"><span>{value}</span>{caret}</div>'
            '</div>')

# ---------- Current -------------------------------------------------------------------------
def cur_project_card(emoji, colour, name, count, when, tag_names):
    return (
        '<div class="Island" style="width: 20rem; display: flex; flex-direction: column; gap: 0.875rem; padding: 1.25rem; box-sizing: border-box; min-height: 11.5rem; overflow: hidden;">'
        f'<div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--pc-{colour}); opacity: 0.85;"></div>'
        '<div style="display: flex; align-items: flex-start; justify-content: space-between;">'
        f'<div style="width: 2.75rem; height: 2.75rem; border-radius: 0.75rem; background: var(--pc-{colour}-bg); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; line-height: 1;">{emoji}</div>'
        f'<div class="IconButton IconButton--ghost" style="color: var(--color-gray-50);">{icon(I["dots"])}</div>'
        '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.25rem; flex-grow: 1;">'
        f'<div style="font-size: 1rem; font-weight: 600; line-height: 1.3;">{name}</div>'
        '<div style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem;">'
        f'<span style="font-weight: 600; color: var(--pc-{colour});">{count} designs</span>'
        f'<span class="muted">·</span><span class="muted">{when}</span></div>'
        '</div>' + tags(tag_names) + '</div>'
    )

def cur_design_card(name, when, sk, tag_names):
    return (
        '<div class="Island" style="width: 20rem; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">'
        '<div style="height: 9.5rem; display: flex; align-items: center; justify-content: center; padding: 0.75rem; background: var(--island-bg-color); border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + sketch(sk) + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem 0.875rem 0.875rem;">'
        '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 2rem;">'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; min-width: 0;">'
        f'<div style="font-size: 0.875rem; font-weight: 600;">{name}</div>'
        f'<div class="muted" style="font-size: 0.75rem;">{when}</div></div>'
        f'<div class="IconButton IconButton--ghost" style="color: var(--color-gray-50);">{icon(I["dots"])}</div>'
        '</div>' + (tags(tag_names) if tag_names else '') + '</div></div>'
    )

def cur_modal():
    return (
        '<div class="Modal__content" style="width: 100%; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div class="Dialog__close">' + icon(I["x"], "1.5rem") + '</div>'
        '<div class="Dialog__title" style="margin-bottom: 0;">New project</div>'
        '<div style="display: flex; align-items: flex-end; gap: 0.875rem;">'
        '<div style="width: 3rem; height: 3rem; border-radius: 0.75rem; background: var(--pc-violet-bg); box-shadow: inset 0 0 0 1px var(--pc-violet); display: flex; align-items: center; justify-content: center; font-size: 1.625rem; line-height: 1; flex-shrink: 0;">🛒</div>'
        + name_field() + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;"><div class="ExcTextField__label" style="margin: 0;">Colour</div>' + swatches() + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;"><div class="ExcTextField__label" style="margin: 0;">Icon</div>' + emoji_tiles() + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;">' + tag_field()
        + '<div class="muted" style="font-size: 0.75rem;">Tags are shared with designs and searchable with #tag.</div></div>'
        + dialog_actions() + '</div>'
    )

# ---------- A · Sketchbook -------------------------------------------------------------------
def sticker(emoji, colour, size="3.25rem", font="1.625rem", tilt="-3deg"):
    return (f'<div style="width: {size}; height: {size}; border-radius: 0.875rem; background: var(--island-bg-color); '
            f'box-shadow: 0 0 0 1.5px var(--pc-{colour}), 0 4px 10px rgba(0,0,0,.10); transform: rotate({tilt}); '
            f'display: flex; align-items: center; justify-content: center; font-size: {font}; line-height: 1; box-sizing: border-box;">{emoji}</div>')

def a_project_card(emoji, colour, name, count, when, tag_names):
    return (
        '<div class="Island" style="width: 20rem; border-radius: 0.75rem; overflow: hidden; box-sizing: border-box; position: relative;">'
        f'<div style="height: 4.75rem; background-color: var(--pc-{colour}-bg); {dots(12)} position: relative;">'
        f'<div style="position: absolute; top: 0.375rem; right: 0.5rem; color: var(--color-gray-60);"><div class="IconButton IconButton--ghost">{icon(I["dots"])}</div></div>'
        '</div>'
        '<div style="position: absolute; top: 3.125rem; left: 1.25rem;">' + sticker(emoji, colour) + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.625rem; padding: 2.125rem 1.25rem 1.125rem;">'
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;">'
        f'<div style="font-size: 1.0625rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em;">{name}</div>'
        '<div style="display: flex; align-items: center; gap: 0.5rem;">'
        f'<span style="display: inline-flex; align-items: center; height: 1.125rem; padding: 0 0.4375rem; border-radius: 999px; background: var(--pc-{colour}); color: #fff; font-size: 0.6875rem; font-weight: 700; line-height: 1;">{count} designs</span>'
        f'<span class="muted" style="font-size: 0.75rem;">{when}</span></div></div>'
        + tags(tag_names) + '</div></div>'
    )

def a_design_card(name, when, sk, tag_names, editing=False, empty=False):
    if empty:
        thumb = ('<div style="display: flex; flex-direction: column; align-items: center; gap: 0.25rem; color: var(--color-gray-40);">'
                 + icon(I["rect"], "1.5rem", "1.25") +
                 '<span class="sketch" style="font-size: 1.0625rem; color: var(--color-gray-50);">Empty canvas</span></div>')
    else:
        thumb = sketch(sk)
    if editing:
        title = ('<div class="ExcTextField" style="width: 100%;"><div class="ExcTextField__input ExcTextField__input--active" '
                 'style="height: 1.875rem; padding: 0 0.5rem; font-size: 0.875rem; font-weight: 700; background: var(--island-bg-color);">'
                 f'<span>{name}</span><span style="width: 1px; height: 1rem; background: var(--color-on-surface);"></span></div></div>')
        actions = ''
        ring = ' box-shadow: var(--shadow-island), 0 0 0 2px var(--color-brand-active);'
    else:
        title = f'<div style="font-size: 0.90625rem; font-weight: 700; letter-spacing: -0.005em;">{name}</div>'
        actions = ('<div style="display: flex; align-items: center; gap: 0.125rem; color: var(--color-gray-50); flex-shrink: 0;">'
                   f'<div class="IconButton IconButton--ghost">{icon(I["pencil"])}</div>'
                   f'<div class="IconButton IconButton--ghost">{icon(I["dots"])}</div></div>')
        ring = ''
    return (
        f'<div class="Island" style="width: 20rem; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;{ring}">'
        f'<div style="height: 10rem; display: flex; align-items: center; justify-content: center; padding: 1rem; background-color: #fdfdff; {dots(22, "rgba(27,27,31,.16)")} border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + thumb + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem 0.875rem 0.875rem;">'
        '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 2rem;">'
        '<div style="display: flex; flex-direction: column; gap: 0.0625rem; min-width: 0; flex-grow: 1;">'
        + title + f'<div class="muted" style="font-size: 0.75rem;">{when}</div></div>'
        + actions + '</div>'
        + (tags(tag_names) if tag_names else '') + '</div></div>'
    )

def a_modal():
    mini = (
        '<div class="Island" style="width: 15rem; border-radius: 0.625rem; overflow: hidden; position: relative; box-sizing: border-box;">'
        f'<div style="height: 2.75rem; background-color: var(--pc-violet-bg); {dots(10)}"></div>'
        '<div style="position: absolute; top: 1.625rem; left: 0.875rem;">' + sticker("🛒", "violet", "2.375rem", "1.1875rem") + '</div>'
        '<div style="padding: 1.375rem 0.875rem 0.875rem; display: flex; flex-direction: column; gap: 0.25rem;">'
        '<div style="font-size: 0.875rem; font-weight: 700; letter-spacing: -0.01em;">Checkout redesign</div>'
        '<div style="display: flex; align-items: center; gap: 0.375rem;">'
        '<span style="display: inline-flex; align-items: center; height: 1rem; padding: 0 0.375rem; border-radius: 999px; background: var(--pc-violet); color: #fff; font-size: 0.625rem; font-weight: 700; line-height: 1;">0 designs</span>'
        '<span class="muted" style="font-size: 0.6875rem;">new</span></div></div></div>'
    )
    return (
        '<div class="Modal__content" style="width: 100%; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div class="Dialog__close">' + icon(I["x"], "1.5rem") + '</div>'
        '<div class="Dialog__title" style="margin-bottom: 0;">New project</div>'
        f'<div style="display: flex; align-items: center; justify-content: center; height: 8.5rem; border-radius: 0.75rem; background-color: var(--color-surface-mid); {dots(16, "rgba(27,27,31,.09)")} border: 1px solid var(--color-surface-high); box-sizing: border-box;">'
        + mini + '</div>'
        + name_field() +
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;"><div class="ExcTextField__label" style="margin: 0;">Colour</div>' + swatches() + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;"><div class="ExcTextField__label" style="margin: 0;">Icon</div>' + emoji_tiles() + '</div>'
        + tag_field() + dialog_actions() + '</div>'
    )

# ---------- B · Workbench ---------------------------------------------------------------------
def b_project_row(emoji, colour, name, count, when, tag_names, last=False):
    border = '' if last else ' border-bottom: 1px solid var(--color-surface-high);'
    return (
        f'<div style="display: flex; align-items: center; gap: 0.875rem; height: 4.25rem; padding: 0 0.875rem 0 0; position: relative; box-sizing: border-box;{border}">'
        f'<div style="width: 3px; align-self: stretch; background: var(--pc-{colour}); flex-shrink: 0;"></div>'
        f'<div style="width: 2.5rem; height: 2.5rem; border-radius: var(--border-radius-lg); background: var(--pc-{colour}-bg); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; line-height: 1; flex-shrink: 0; margin-left: 0.75rem;">{emoji}</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; flex-grow: 1;">'
        '<div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">'
        f'<span style="font-size: 0.90625rem; font-weight: 600; white-space: nowrap;">{name}</span>'
        + tags(tag_names) + '</div>'
        f'<div class="muted" style="font-size: 0.75rem;">{when}</div></div>'
        '<div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1; flex-shrink: 0;">'
        f'<span style="font-size: 1.125rem; font-weight: 700; color: var(--pc-{colour});">{count}</span>'
        '<span style="font-size: 0.625rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-gray-50); margin-top: 2px;">designs</span></div>'
        f'<div class="IconButton IconButton--ghost" style="color: var(--color-gray-50); margin-left: 0.25rem;">{icon(I["dots"])}</div>'
        '</div>'
    )

def b_design_tile(name, when, sk, dot_colours, hovered=False):
    overlay = ''
    if hovered:
        overlay = (
            '<div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,18,18,.34), rgba(18,18,18,0) 58%);"></div>'
            '<div style="position: absolute; left: 50%; bottom: 0.5rem; transform: translateX(-50%); display: flex; gap: 0.25rem; padding: 0.1875rem; border-radius: 999px; background: var(--island-bg-color); box-shadow: var(--shadow-island-stronger);">'
            + "".join(f'<div style="width: 1.75rem; height: 1.75rem; border-radius: 999px; display: flex; align-items: center; justify-content: center; color: var(--color-gray-70);">{icon(I[k], "0.9375rem")}</div>' for k in ("arrow", "pencil", "dots"))
            + '</div>')
    dotrow = "".join(f'<span style="width: 0.375rem; height: 0.375rem; border-radius: 999px; background: var(--pc-{c}); flex-shrink: 0;"></span>' for c in dot_colours)
    return (
        '<div class="Island" style="width: 13rem; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">'
        '<div style="height: 8.125rem; display: flex; align-items: center; justify-content: center; padding: 0.625rem; background: var(--color-surface-mid); border-bottom: 1px solid var(--color-surface-high); box-sizing: border-box; position: relative;">'
        + sketch(sk) + overlay + '</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; padding: 0.5rem 0.625rem 0.625rem;">'
        '<div style="display: flex; align-items: center; gap: 0.375rem; min-width: 0;">'
        f'<span style="font-size: 0.8125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</span>{dotrow}</div>'
        f'<div class="muted" style="font-size: 0.6875rem;">{when}</div></div></div>'
    )

def b_modal():
    rail = (
        '<div style="width: 11rem; flex-shrink: 0; display: flex; flex-direction: column; gap: 1rem;">'
        '<div style="height: 6.5rem; border-radius: 0.75rem; background: var(--pc-violet-bg); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; line-height: 1; box-shadow: inset 0 0 0 1px var(--pc-violet);">🛒</div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem;">'
        '<div class="ExcTextField__label" style="margin: 0; font-size: 0.75rem;">Colour</div>'
        '<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.5rem;">' + "".join(
            f'<div style="width: 1.375rem; height: 1.375rem; border-radius: 100%; background: var(--pc-{c}); box-sizing: border-box;'
            + (f' box-shadow: 0 0 0 2px var(--island-bg-color), 0 0 0 4px var(--pc-{c});' if c == "violet" else '')
            + '"></div>' for c in COLOUR_ROW) + '</div></div></div>'
    )
    right = (
        '<div style="display: flex; flex-direction: column; gap: 1rem; flex-grow: 1; min-width: 0;">'
        + name_field(compact=True) +
        '<div style="display: flex; flex-direction: column; gap: 0.375rem;">'
        '<div class="ExcTextField__label" style="margin: 0; font-size: 0.75rem;">Icon</div>' + emoji_tiles(tile="2rem", cols=5, font="1.0625rem") + '</div>'
        '<div class="ExcTextField" style="width: 100%;"><div class="ExcTextField__label" style="font-size: 0.75rem;">Tags</div>'
        '<div class="ExcTextField__input" style="height: 2.25rem; font-size: 0.875rem;"><span class="Tag">web</span><span class="Tag">payments</span>'
        '<span class="ExcTextField__input--placeholder">Add tag…</span></div></div></div>'
    )
    return (
        '<div class="Modal__content" style="width: 100%; padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;">'
        '<div class="Dialog__close">' + icon(I["x"], "1.5rem") + '</div>'
        '<div style="font-size: 1.0625rem; font-weight: 700;">New project</div>'
        f'<div style="display: flex; gap: 1.25rem; align-items: flex-start;">{rail}{right}</div>'
        '<div style="height: 1px; background: var(--color-surface-high);"></div>'
        '<div style="display: flex; justify-content: flex-end; gap: 0.5rem;">'
        '<div class="Dialog__action-button" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8125rem;">Cancel</div>'
        '<div class="Dialog__action-button Dialog__action-button--primary" style="height: 2.25rem; padding: 0 1rem; font-size: 0.8125rem;">' + icon(I["plus"], "1rem") + 'Create project</div>'
        '</div></div>'
    )

# ---------- C · Gallery -----------------------------------------------------------------------
def c_project_card(emoji, colour, name, count, when, tag_names, sks):
    fan = "".join(
        '<div class="Island" style="width: 5.5rem; height: 3.75rem; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center; padding: 0.375rem; '
        f'box-sizing: border-box; transform: rotate({t}deg) translateY({y}px); margin: 0 -0.625rem; box-shadow: 0 2px 8px rgba(0,0,0,.10);">'
        + sketch(s) + '</div>' for s, t, y in zip(sks, (-7, 0, 7), (4, -4, 4)))
    return (
        '<div class="Island" style="width: 20rem; border-radius: 0.75rem; overflow: hidden; box-sizing: border-box; position: relative;">'
        f'<div style="height: 7rem; background: var(--pc-{colour}-bg); display: flex; align-items: center; justify-content: center;">{fan}</div>'
        f'<div style="position: absolute; top: 0.375rem; right: 0.5rem; color: var(--color-gray-60);"><div class="IconButton IconButton--ghost">{icon(I["dots"])}</div></div>'
        '<div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.9375rem 1.125rem 1.125rem;">'
        '<div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">'
        f'<span style="font-size: 1.125rem; line-height: 1;">{emoji}</span>'
        f'<span style="font-size: 1.125rem; font-weight: 700; letter-spacing: -0.015em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{name}</span></div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">'
        f'<span class="muted" style="font-size: 0.75rem;">{count} designs · {when}</span>{tags(tag_names)}</div>'
        '</div></div>'
    )

def c_design_card(name, when, sk, empty=False, hovered=False):
    if empty:
        thumb = ('<div style="position: absolute; inset: 0; background: var(--color-surface-high); display: flex; align-items: center; justify-content: center;">'
                 '<span class="sketch" style="font-size: 1.25rem; color: var(--color-primary); opacity: 0.55;">Empty canvas</span></div>')
    else:
        thumb = f'<div style="position: absolute; inset: 1rem;">{sketch(sk)}</div>'
    over = ''
    if hovered:
        over = ('<div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem;">'
                + "".join('<div style="width: 1.875rem; height: 1.875rem; border-radius: var(--border-radius-lg); background: var(--island-bg-color); box-shadow: var(--shadow-island-stronger); '
                          f'display: flex; align-items: center; justify-content: center; color: var(--color-gray-70);">{icon(I[k], "1rem")}</div>' for k in ("pencil", "dots"))
                + '</div>')
    return (
        '<div class="Island" style="width: 21.25rem; border-radius: 0.75rem; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;">'
        '<div style="height: 11.25rem; position: relative; background: var(--island-bg-color);">' + thumb + over + '</div>'
        '<div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.875rem 1.125rem 1rem; border-top: 1px solid var(--color-surface-high);">'
        '<div style="display: flex; flex-direction: column; gap: 0.125rem; min-width: 0;">'
        f'<div style="font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.005em;">{name}</div>'
        f'<div class="muted" style="font-size: 0.75rem;">{when}</div></div></div></div>'
    )

def c_modal():
    return (
        '<div class="Modal__content" style="width: 100%; padding: 0; display: flex; flex-direction: column; overflow: hidden;">'
        '<div class="Dialog__close" style="top: 1rem; right: 1rem; color: var(--color-gray-60);">' + icon(I["x"], "1.5rem") + '</div>'
        f'<div style="height: 10rem; background-color: var(--pc-violet-bg); {dots(16, "rgba(27,27,31,.07)")} display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; border-bottom: 1px solid var(--color-surface-high);">'
        '<div style="width: 3.75rem; height: 3.75rem; border-radius: 1rem; background: var(--island-bg-color); box-shadow: 0 4px 12px rgba(0,0,0,.10); display: flex; align-items: center; justify-content: center; font-size: 2rem; line-height: 1;">🛒</div>'
        '<div style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.015em;">New project</div></div>'
        '<div style="display: flex; flex-direction: column; gap: 1.25rem; padding: 1.75rem 2.5rem 2.5rem;">'
        + name_field() +
        '<div style="display: flex; flex-direction: column; gap: 0.625rem;">'
        '<div class="ExcTextField__label" style="margin: 0;">Appearance</div>'
        + swatches() + emoji_tiles() + '</div>'
        + tag_field() + dialog_actions() + '</div></div>'
    )

# ---- board assembly --------------------------------------------------------------------------
def row(items, gap="1.5rem"):
    return f'<div style="display: flex; gap: {gap}; align-items: flex-start;">' + "".join(items) + '</div>'

def board_current():
    return dir_board(
        "Today", "Current",
        "What ships right now: a colour hairline, an emoji tile, a title and a meta line, stacked. Everything is the same weight, so nothing leads — this is the baseline the three directions are answering.",
        "Reads like any dashboard tile. The project colour is decoration rather than structure, and the design thumbnail floats in a pale box that looks empty even when it isn't.",
        cur_modal(),
        row([cur_project_card("🛒", "violet", "Checkout redesign", 7, "edited 2 hours ago", ["web", "payments"]),
             cur_project_card("📱", "blue", "Mobile onboarding", 4, "edited yesterday", ["ios"])]),
        row([cur_design_card("v3 · side cart", "edited 2 hours ago", 6, ["current"]),
             cur_design_card("v1 · stepper", "edited 3 days ago", 0, [])]),
        960,
    )

def board_a():
    return dir_board(
        "Direction A", "Sketchbook",
        "Answers “generic” with Excalidraw's own identity. Every card is a patch of canvas: the project colour becomes a dot-gridded band, the emoji sits on it as a tilted sticker, and design previews sit on the real canvas ground instead of a grey box. The modal previews the actual card you are building.",
        "The sticker overlap costs ~24px of card height, and the motif needs discipline — repeated across fifty projects the tilt can read as twee rather than crafted.",
        a_modal(),
        row([a_project_card("🛒", "violet", "Checkout redesign", 7, "2 hours ago", ["web", "payments"]),
             a_project_card("📱", "blue", "Mobile onboarding", 4, "yesterday", ["ios"])]),
        row([a_design_card("v3 · side cart", "edited 2 hours ago", 6, ["current"]),
             a_design_card("v1 · stepper", "edited 3 days ago", 0, [], editing=True)]),
        1120,
    )

def board_b():
    return dir_board(
        "Direction B", "Workbench",
        "Answers “generic” with density and rhythm. Projects stop being tiles and become a scannable list — accent rule, icon, name, tags inline, design count as a right-aligned figure — so twelve projects fit where four did. Designs become tighter tiles whose actions float over the preview on hover.",
        "Efficient rather than characterful: it reads as a capable file manager. Thumbnails get small, and tags degrade to colour dots, so a heavily-tagged project loses information.",
        b_modal(),
        '<div class="Island" style="width: 100%; overflow: hidden; box-sizing: border-box;">'
        + b_project_row("🛒", "violet", "Checkout redesign", 7, "edited 2 hours ago", ["web", "payments"])
        + b_project_row("📱", "blue", "Mobile onboarding", 4, "edited yesterday", ["ios"])
        + b_project_row("🏗️", "orange", "Platform architecture", 9, "edited 3 days ago", ["infra"], last=True)
        + '</div>',
        row([b_design_tile("v3 · side cart", "2 hours ago", 6, ["violet"], hovered=True),
             b_design_tile("v2 · single page", "yesterday", 3, []),
             b_design_tile("v1 · stepper", "3 days ago", 0, ["blue"])], gap="1rem"),
        920,
    )

def board_c():
    return dir_board(
        "Direction C", "Gallery",
        "Answers “generic” by letting the work carry the page. A project shows a fan of its own designs instead of an emoji tile; a design card is its preview, edge to edge, with a quiet caption underneath and actions that appear over the image. Bigger type, fewer things, more confidence.",
        "It leans on thumbnails: blank or near-empty designs look weakest exactly where a new project starts. Cards are larger, so roughly a third fewer fit above the fold.",
        c_modal(),
        row([c_project_card("🛒", "violet", "Checkout redesign", 7, "edited 2 hours ago", ["web"], (6, 3, 0)),
             c_project_card("📱", "blue", "Mobile onboarding", 4, "edited yesterday", ["ios"], (1, 5, 4))]),
        row([c_design_card("v3 · side cart", "edited 2 hours ago", 6, hovered=True),
             c_design_card("v2 · single page", "edited yesterday", 0, empty=True)]),
        1010,
    )

FILES["DirCurrent.dc.html"] = board_current()
FILES["DirSketchbook.dc.html"] = board_a()
FILES["DirWorkbench.dc.html"] = board_b()
FILES["DirGallery.dc.html"] = board_c()


if __name__ == "__main__":
    for name, content in FILES.items():
        with open(os.path.join(HERE, name), "w") as f:
            f.write(content)
        print("wrote", name, len(content))
