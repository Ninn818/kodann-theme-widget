"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => KodannThemeWidget
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/obsidian-extensions.ts
var import_obsidian = require("obsidian");

// src/appearance-widget.ts
var import_obsidian3 = require("obsidian");

// src/widget-drag.ts
var import_obsidian2 = require("obsidian");
var WidgetDragController = class {
  constructor(widget, handle, savePosition) {
    this.widget = widget;
    this.handle = handle;
    this.savePosition = savePosition;
    this.ignoreNextClick = false;
    this.start = (event) => {
      if (event.button !== 0) return;
      const bounds = this.widget.getBoundingClientRect();
      this.drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        initialLeft: bounds.left,
        initialTop: bounds.top,
        moved: false
      };
      this.handle.setPointerCapture(event.pointerId);
    };
    this.move = (event) => {
      const drag = this.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const left = drag.initialLeft + event.clientX - drag.startX;
      const top = drag.initialTop + event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(left - drag.initialLeft, top - drag.initialTop) < 4) return;
      drag.moved = true;
      this.applyPosition(left, top);
      event.preventDefault();
    };
    this.finish = (event) => {
      const drag = this.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      this.drag = void 0;
      if (!drag.moved) return;
      const bounds = this.widget.getBoundingClientRect();
      this.ignoreNextClick = true;
      window.setTimeout(() => {
        this.ignoreNextClick = false;
      }, 0);
      void this.savePosition({ left: bounds.left, top: bounds.top }).catch((error) => {
        console.error("Failed to save widget position.", error);
        new import_obsidian2.Notice("Could not save widget position.");
      });
    };
    handle.addEventListener("pointerdown", this.start);
    document.addEventListener("pointermove", this.move);
    document.addEventListener("pointerup", this.finish);
    document.addEventListener("pointercancel", this.finish);
  }
  dispose() {
    this.handle.removeEventListener("pointerdown", this.start);
    document.removeEventListener("pointermove", this.move);
    document.removeEventListener("pointerup", this.finish);
    document.removeEventListener("pointercancel", this.finish);
  }
  shouldIgnoreClick() {
    if (!this.ignoreNextClick) return false;
    this.ignoreNextClick = false;
    return true;
  }
  applyPosition(left, top) {
    const maxLeft = Math.max(0, window.innerWidth - this.widget.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - this.widget.offsetHeight);
    this.widget.style.left = `${Math.min(Math.max(0, left), maxLeft)}px`;
    this.widget.style.top = `${Math.min(Math.max(0, top), maxTop)}px`;
    this.widget.style.right = "auto";
    this.widget.style.bottom = "auto";
  }
};

// src/appearance-widget.ts
var AppearanceWidget = class {
  constructor(app, position, savePosition) {
    this.app = app;
    this.isOpen = false;
    this.handleOutsideClick = (event) => {
      if (this.isOpen && event.target instanceof Node && !this.element.contains(event.target)) {
        this.isOpen = false;
        this.update();
      }
    };
    this.element = document.createElement("div");
    this.element.className = "kodann-theme-widget";
    this.panel = document.createElement("div");
    this.panel.className = "kodann-theme-widget-panel";
    this.toggleButton = document.createElement("button");
    this.toggleButton.className = "kodann-theme-widget-toggle";
    this.toggleButton.type = "button";
    this.toggleButton.textContent = "\u25D0";
    this.toggleButton.title = "Drag to move; click to open";
    this.toggleButton.setAttribute("aria-label", "Open appearance controls");
    const picker = document.createElement("div");
    picker.className = "kodann-theme-widget-theme-picker";
    picker.title = "Choose Obsidian theme";
    const pickerIcon = document.createElement("span");
    pickerIcon.textContent = "\u25C9";
    pickerIcon.setAttribute("aria-hidden", "true");
    this.themeSelect = document.createElement("select");
    this.themeSelect.className = "kodann-theme-widget-theme";
    this.themeSelect.setAttribute("aria-label", "Choose Obsidian theme");
    this.themeSelect.addEventListener("change", () => void this.setTheme(this.themeSelect.value));
    picker.append(pickerIcon, this.themeSelect);
    this.modeButton = this.createAction(
      "\u263C",
      "Switch appearance mode",
      () => this.toggleMode()
    );
    this.modeButton.classList.add("kodann-theme-widget-mode");
    const styleSettingsButton = this.createAction(
      "\u2699",
      "Open Style Settings",
      () => this.openStyleSettings()
    );
    styleSettingsButton.classList.add("kodann-theme-widget-style-settings");
    this.panel.append(this.modeButton, picker, styleSettingsButton);
    this.element.append(this.panel, this.toggleButton);
    document.body.append(this.element);
    this.drag = new WidgetDragController(this.element, this.toggleButton, savePosition);
    this.toggleButton.addEventListener("click", (event) => {
      if (this.drag.shouldIgnoreClick()) {
        event.preventDefault();
        return;
      }
      this.isOpen = !this.isOpen;
      this.update();
    });
    document.addEventListener("click", this.handleOutsideClick);
    if (position) this.setPosition(position);
    this.update();
  }
  remove() {
    document.removeEventListener("click", this.handleOutsideClick);
    this.drag.dispose();
    this.element.remove();
  }
  resetPosition() {
    this.element.style.removeProperty("left");
    this.element.style.removeProperty("top");
    this.element.style.removeProperty("right");
    this.element.style.removeProperty("bottom");
  }
  createAction(icon, label, action) {
    const button = document.createElement("button");
    button.className = "kodann-theme-widget-action";
    button.type = "button";
    button.textContent = icon;
    button.title = label;
    button.setAttribute("aria-label", label);
    button.addEventListener("click", action);
    return button;
  }
  setPosition(position) {
    this.element.style.left = `${position.left}px`;
    this.element.style.top = `${position.top}px`;
    this.element.style.right = "auto";
    this.element.style.bottom = "auto";
  }
  themes() {
    const installed = this.app.customCss.themes;
    return Array.isArray(installed) ? [...installed] : Object.keys(installed);
  }
  refreshThemes() {
    var _a, _b, _c;
    const activeFromObsidian = this.app.customCss.enabledTheme;
    (_a = this.selectedTheme) != null ? _a : this.selectedTheme = activeFromObsidian != null ? activeFromObsidian : "";
    const active = (_c = (_b = this.selectedTheme) != null ? _b : activeFromObsidian) != null ? _c : "";
    const themes = this.themes();
    if (active && !themes.includes(active)) themes.push(active);
    this.themeSelect.replaceChildren();
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Obsidian (default)";
    this.themeSelect.append(defaultOption);
    for (const theme of themes) {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      this.themeSelect.append(option);
    }
    this.themeSelect.value = active;
    this.themeSelect.title = active || "Obsidian (default)";
  }
  async setTheme(name) {
    this.themeSelect.disabled = true;
    try {
      await this.app.customCss.setTheme(name);
      this.selectedTheme = name;
    } catch (error) {
      console.error("Failed to switch Obsidian theme.", error);
      new import_obsidian3.Notice("Could not switch theme.");
    } finally {
      this.themeSelect.disabled = false;
      this.update();
    }
  }
  openStyleSettings() {
    this.app.setting.open();
    this.app.setting.openTabById("obsidian-style-settings");
  }
  toggleMode() {
    const success = this.app.commands.executeCommandById("theme:toggle-light-dark") || this.app.commands.executeCommandById("app:toggle-light-dark");
    if (!success) {
      new import_obsidian3.Notice("Could not switch appearance mode.");
      return;
    }
    window.setTimeout(() => this.update(), 100);
  }
  update() {
    this.panel.hidden = !this.isOpen;
    this.toggleButton.setAttribute(
      "aria-label",
      this.isOpen ? "Close appearance controls" : "Open appearance controls"
    );
    this.refreshThemes();
    const isDark = document.body.classList.contains("theme-dark");
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";
    this.modeButton.textContent = isDark ? "\u263C" : "\u263E";
    this.modeButton.title = label;
    this.modeButton.setAttribute("aria-label", label);
  }
};

// src/utility-widget.ts
var import_obsidian4 = require("obsidian");
var UtilityWidget = class {
  constructor(app, position, savePosition) {
    this.app = app;
    this.isOpen = false;
    this.handleOutsideClick = (event) => {
      if (this.isOpen && event.target instanceof Node && !this.element.contains(event.target)) {
        this.isOpen = false;
        this.update();
      }
    };
    this.element = document.createElement("div");
    this.element.className = "kodann-theme-widget kodann-utility-widget";
    this.panel = document.createElement("div");
    this.panel.className = "kodann-theme-widget-panel kodann-utility-widget-panel";
    this.panel.hidden = true;
    this.toggleButton = document.createElement("button");
    this.toggleButton.className = "kodann-theme-widget-toggle kodann-utility-widget-toggle";
    this.toggleButton.type = "button";
    this.toggleButton.title = "Drag to move; click to show shortcuts";
    this.toggleButton.setAttribute("aria-label", "Open Obsidian shortcuts");
    (0, import_obsidian4.setIcon)(this.toggleButton, "plus");
    this.panel.append(
      this.createAction(
        "file-plus",
        "Create new note",
        () => this.runCommand("file-explorer:new-file", "Could not create a new note.")
      ),
      this.createAction(
        "orbit",
        "Open graph view",
        () => this.runCommand("graph:open", "Could not open graph view.")
      ),
      this.createAction("focus", "Open local graph for current note", () => {
        if (!this.app.workspace.getActiveFile()) {
          new import_obsidian4.Notice("Open a note first to view its local graph.");
          return;
        }
        this.runCommand("graph:open-local", "Could not open the local graph.");
      }),
      this.createAction(
        "search",
        "Search vault",
        () => this.runCommand("global-search:open", "Could not open search.")
      ),
      this.createAction(
        "files",
        "Quick switcher",
        () => this.runCommand("switcher:open", "Could not open the quick switcher.")
      ),
      this.createAction(
        "command",
        "Open command palette",
        () => this.runCommand("command-palette:open", "Could not open the command palette.")
      )
    );
    this.element.append(this.panel, this.toggleButton);
    document.body.append(this.element);
    this.drag = new WidgetDragController(this.element, this.toggleButton, savePosition);
    this.toggleButton.addEventListener("click", (event) => {
      if (this.drag.shouldIgnoreClick()) {
        event.preventDefault();
        return;
      }
      this.isOpen = !this.isOpen;
      this.update();
    });
    document.addEventListener("click", this.handleOutsideClick);
    if (position) this.setPosition(position);
  }
  remove() {
    document.removeEventListener("click", this.handleOutsideClick);
    this.drag.dispose();
    this.element.remove();
  }
  resetPosition() {
    this.element.style.removeProperty("left");
    this.element.style.removeProperty("top");
    this.element.style.removeProperty("right");
    this.element.style.removeProperty("bottom");
  }
  createAction(icon, label, action) {
    const button = document.createElement("button");
    button.className = "kodann-theme-widget-action kodann-utility-widget-action";
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);
    (0, import_obsidian4.setIcon)(button, icon);
    button.addEventListener("click", action);
    return button;
  }
  setPosition(position) {
    this.element.style.left = `${position.left}px`;
    this.element.style.top = `${position.top}px`;
    this.element.style.right = "auto";
    this.element.style.bottom = "auto";
  }
  runCommand(commandId, failureMessage) {
    if (!this.app.commands.executeCommandById(commandId)) {
      new import_obsidian4.Notice(failureMessage);
      return;
    }
    this.isOpen = false;
    this.update();
  }
  update() {
    this.panel.hidden = !this.isOpen;
    this.toggleButton.setAttribute(
      "aria-label",
      this.isOpen ? "Close Obsidian shortcuts" : "Open Obsidian shortcuts"
    );
    this.toggleButton.title = this.isOpen ? "Close shortcuts" : "Open shortcuts";
    (0, import_obsidian4.setIcon)(this.toggleButton, this.isOpen ? "x" : "plus");
  }
};

// src/settings.ts
var import_obsidian5 = require("obsidian");
var DEFAULT_SETTINGS = {
  widgetEnabled: true,
  widgetPosition: null,
  utilityWidgetEnabled: true,
  utilityWidgetPosition: null
};
var KodannThemeWidgetSettingTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian5.Setting(containerEl).setName("Enable floating widget").setDesc("Show or hide the floating appearance controls.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.widgetEnabled).onChange(async (enabled) => {
        const previousValue = this.plugin.settings.widgetEnabled;
        try {
          await this.plugin.setWidgetEnabled(enabled);
        } catch (error) {
          console.error("Failed to save widget setting.", error);
          new import_obsidian5.Notice("Could not save widget setting.");
          toggle.setValue(previousValue);
        }
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Enable utility widget").setDesc("Show shortcuts for notes, graph views, search, and navigation.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.utilityWidgetEnabled).onChange(async (enabled) => {
        const previousValue = this.plugin.settings.utilityWidgetEnabled;
        try {
          await this.plugin.setUtilityWidgetEnabled(enabled);
        } catch (error) {
          console.error("Failed to save utility widget setting.", error);
          new import_obsidian5.Notice("Could not save utility widget setting.");
          toggle.setValue(previousValue);
        }
      })
    );
  }
};

// src/main.ts
var KodannThemeWidget = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.layoutReady = false;
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new KodannThemeWidgetSettingTab(this.app, this));
    this.addCommand({
      id: "reset-widget-positions",
      name: "Reset widget positions",
      callback: () => void this.resetWidgetPositions()
    });
    this.app.workspace.onLayoutReady(() => {
      this.layoutReady = true;
      this.syncWidgets();
    });
  }
  onunload() {
    var _a, _b;
    (_a = this.appearanceWidget) == null ? void 0 : _a.remove();
    (_b = this.utilityWidget) == null ? void 0 : _b.remove();
    this.appearanceWidget = void 0;
    this.utilityWidget = void 0;
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async setWidgetEnabled(enabled) {
    await this.updateSetting("widgetEnabled", enabled);
    if (this.layoutReady) this.syncAppearanceWidget();
  }
  async setUtilityWidgetEnabled(enabled) {
    await this.updateSetting("utilityWidgetEnabled", enabled);
    if (this.layoutReady) this.syncUtilityWidget();
  }
  async resetWidgetPositions() {
    var _a, _b;
    const previousAppearancePosition = this.settings.widgetPosition;
    const previousUtilityPosition = this.settings.utilityWidgetPosition;
    this.settings.widgetPosition = null;
    this.settings.utilityWidgetPosition = null;
    try {
      await this.saveSettings();
    } catch (error) {
      this.settings.widgetPosition = previousAppearancePosition;
      this.settings.utilityWidgetPosition = previousUtilityPosition;
      console.error("Failed to reset widget positions.", error);
      new import_obsidian6.Notice("Could not reset widget positions.");
      return;
    }
    (_a = this.appearanceWidget) == null ? void 0 : _a.resetPosition();
    (_b = this.utilityWidget) == null ? void 0 : _b.resetPosition();
    new import_obsidian6.Notice("Widget positions reset.");
  }
  async updateSetting(key, value) {
    const previousValue = this.settings[key];
    this.settings[key] = value;
    try {
      await this.saveSettings();
    } catch (error) {
      this.settings[key] = previousValue;
      throw error;
    }
  }
  syncWidgets() {
    this.syncAppearanceWidget();
    this.syncUtilityWidget();
  }
  syncAppearanceWidget() {
    if (this.settings.widgetEnabled && !this.appearanceWidget) {
      this.appearanceWidget = new AppearanceWidget(
        this.app,
        this.settings.widgetPosition,
        (position) => this.savePosition("widgetPosition", position)
      );
    } else if (!this.settings.widgetEnabled && this.appearanceWidget) {
      this.appearanceWidget.remove();
      this.appearanceWidget = void 0;
    }
  }
  syncUtilityWidget() {
    if (this.settings.utilityWidgetEnabled && !this.utilityWidget) {
      this.utilityWidget = new UtilityWidget(
        this.app,
        this.settings.utilityWidgetPosition,
        (position) => this.savePosition("utilityWidgetPosition", position)
      );
    } else if (!this.settings.utilityWidgetEnabled && this.utilityWidget) {
      this.utilityWidget.remove();
      this.utilityWidget = void 0;
    }
  }
  async savePosition(key, position) {
    this.settings[key] = position;
    await this.saveSettings();
  }
};
