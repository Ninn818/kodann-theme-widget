# Kodann Theme Widget

An Obsidian plugin that adds two draggable floating launchers: one for appearance controls and one for frequently used vault actions.

- **Appearance widget** — switch themes and toggle light/dark mode.
- **Utility widget** — quick shortcuts for notes, graph views, search, navigation, and the command palette.

Both widgets are optional and remember their positions independently.

## Features

### Appearance widget

A small round launcher (◐ icon) that opens a panel with appearance controls:

- **Toggle light/dark mode**
  - Uses Obsidian's built‑in commands (`theme:toggle-light-dark` or `app:toggle-light-dark`).
  - Button icon switches between ☼ (dark → light) and ☾ (light → dark).
- **Switch between installed themes**
  - Dropdown listing all installed themes from Obsidian.
  - Includes an **“Obsidian (default)”** option to reset to the default theme.
  - Always keeps the currently active theme in the list, even if removed from disk.
- **Open Style Settings**
  - One‑click shortcut to open the **Style Settings** community plugin tab (if installed).

Behavior and UX:

- Click the round launcher to open/close the panel.
- Drag the round launcher to move the widget; its position is saved.
- Clicking outside the widget closes the panel.
- If a theme change or mode toggle fails, a notice is shown.

### Utility widget

A small round launcher ("+" icon when closed, "x" when open) that opens a shortcuts panel:

- **Create new note** — `file-explorer:new-file`.
- **Open graph view** — `graph:open`.
- **Open local graph for current note** — `graph:open-local`.
  - If no note is active, shows a notice asking you to open a note first.
- **Search vault** — `global-search:open`.
- **Quick switcher** — `switcher:open`.
- **Command palette** — `command-palette:open`.

Behavior and UX:

- Click the round launcher to open/close the panel.
- Drag the round launcher to move the widget; its position is saved.
- Clicking outside the widget closes the panel.
- Each action uses Obsidian commands and shows a notice if the command cannot be executed.

### Settings

In **Settings → Community plugins → Kodann Theme Widget** you can:

- **Enable floating widget** — show/hide the appearance widget.
- **Enable utility widget** — show/hide the shortcuts widget.

Both toggles are saved safely; if saving fails, the toggle is reverted and an error notice is shown.

### Commands

From Obsidian's command palette:

- **Kodann Theme Widget: Reset widget positions**
  - Clears saved positions for both widgets.
  - Moves both widgets back to their default corners.
  - Shows a notice when positions are reset, or if resetting fails.

## Installation

Copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/kodann-theme-widget/
```

Then enable **Kodann Theme Widget** in Obsidian's **Community plugins** settings.

For local development, you can point Obsidian directly at this repository folder as the plugin directory.

## Development

This plugin is written in TypeScript and bundled into `main.js`.

- Source lives in `src/`:
  - `src/main.ts` — plugin lifecycle, persisted settings, and widget creation/sync.
  - `src/appearance-widget.ts` — appearance widget UI, theme dropdown, light/dark toggle, Style Settings shortcut.
  - `src/utility-widget.ts` — utility widget UI and Obsidian command shortcuts.
  - `src/widget-drag.ts` — shared drag controller and position persistence.
  - `src/settings.ts` — plugin settings and settings tab UI.
  - `src/obsidian-extensions.ts` — TypeScript declarations for the Obsidian APIs used.
- Styles live in `styles.css`.

Build the plugin using your preferred bundler setup (e.g. npm scripts pointing at `src/`) to regenerate `main.js`, then reload or restart the plugin in Obsidian.
