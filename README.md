# Kodann Theme Widget

An Obsidian plugin with two draggable floating launchers: one for appearance controls and one for frequently used vault actions.

## Features

### Appearance widget

- Switch between light and dark mode.
- Select an installed theme or return to the Obsidian default theme.
- Cycle through installed themes with previous/next controls.

### Utility widget

- Create a new note.
- Open the vault graph or the current note's local graph.
- Open vault search.
- Open the quick switcher.
- Open the command palette.

Both widgets can be enabled or disabled separately in **Settings → Community plugins → Kodann Theme Widget**. Drag a widget by its round launcher button to move it; each widget's position is saved independently.

## Installation

Copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/kodann-theme-widget/
```

Then enable **Kodann Theme Widget** in Obsidian's Community plugins settings. For local development, this repository itself can be used as that plugin folder.

## Build from source

Requirements: Node.js and npm.

```sh
npm install
npm run build
```

The build type-checks the TypeScript in `src/` and bundles the plugin into `main.js`. Restart or reload the plugin in Obsidian after rebuilding.

## Project structure

- `src/main.ts` — plugin lifecycle, persisted settings, and widget creation.
- `src/appearance-widget.ts` — theme and light/dark controls.
- `src/utility-widget.ts` — note, graph, search, and navigation shortcuts.
- `src/widget-drag.ts` — shared drag and position persistence behavior.
- `src/settings.ts` — settings defaults and settings tab.
- `src/obsidian-extensions.ts` — TypeScript declarations for Obsidian APIs used by the plugin.
- `styles.css` — floating widget layout and styling.
