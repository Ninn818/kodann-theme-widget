import "./obsidian-extensions";
import { App, Notice } from "obsidian";
import { WidgetDragController } from "./widget-drag";

type Position = { left: number; top: number } | null;

export class AppearanceWidget {
    readonly element: HTMLDivElement;
    private isOpen = false;
    private panel: HTMLDivElement;
    private toggleButton: HTMLButtonElement;
    private themeSelect: HTMLSelectElement;
    private modeButton: HTMLButtonElement;
    private drag: WidgetDragController;
    private handleOutsideClick = (event: MouseEvent): void => {
        if (this.isOpen && event.target instanceof Node && !this.element.contains(event.target)) {
            this.isOpen = false;
            this.update();
        }
    };

    constructor(
        private app: App,
        position: Position,
        savePosition: (position: { left: number; top: number }) => Promise<void>,
    ) {
        this.element = document.createElement("div");
        this.element.className = "kodann-theme-widget";
        this.panel = document.createElement("div");
        this.panel.className = "kodann-theme-widget-panel";

        this.toggleButton = document.createElement("button");
        this.toggleButton.className = "kodann-theme-widget-toggle";
        this.toggleButton.type = "button";
        this.toggleButton.textContent = "◐";
        this.toggleButton.title = "Drag to move; click to open";
        this.toggleButton.setAttribute("aria-label", "Open appearance controls");

        const defaultButton = this.createAction("⌂", "Use Obsidian default theme", () =>
            this.setTheme(""),
        );
        defaultButton.classList.add("kodann-theme-widget-default");
        const previousButton = this.createAction("‹", "Previous theme", () =>
            this.cycleTheme(-1),
        );
        previousButton.classList.add("kodann-theme-widget-previous");

        const picker = document.createElement("div");
        picker.className = "kodann-theme-widget-theme-picker";
        picker.textContent = "◉";
        picker.setAttribute("aria-hidden", "true");
        this.themeSelect = document.createElement("select");
        this.themeSelect.className = "kodann-theme-widget-theme";
        this.themeSelect.setAttribute("aria-label", "Choose Obsidian theme");
        this.themeSelect.addEventListener("change", () => void this.setTheme(this.themeSelect.value));
        picker.append(this.themeSelect);

        const nextButton = this.createAction("›", "Next theme", () => this.cycleTheme(1));
        nextButton.classList.add("kodann-theme-widget-next");
        this.modeButton = this.createAction("☼", "Switch appearance mode", () =>
            this.toggleMode(),
        );
        this.modeButton.classList.add("kodann-theme-widget-mode");

        this.panel.append(defaultButton, previousButton, picker, nextButton, this.modeButton);
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

    remove(): void {
        document.removeEventListener("click", this.handleOutsideClick);
        this.drag.dispose();
        this.element.remove();
    }

    private createAction(icon: string, label: string, action: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "kodann-theme-widget-action";
        button.type = "button";
        button.textContent = icon;
        button.title = label;
        button.setAttribute("aria-label", label);
        button.addEventListener("click", action);
        return button;
    }

    private setPosition(position: { left: number; top: number }): void {
        this.element.style.left = `${position.left}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.right = "auto";
        this.element.style.bottom = "auto";
    }

    private themes(): string[] {
        const installed = this.app.customCss.themes;
        return Array.isArray(installed) ? [...installed] : Object.keys(installed);
    }

    private refreshThemes(): void {
        const active = this.app.customCss.enabledTheme || "";
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

    private async setTheme(name: string): Promise<void> {
        this.themeSelect.disabled = true;
        try {
            await this.app.customCss.setTheme(name);
        } catch (error) {
            console.error("Failed to switch Obsidian theme.", error);
            new Notice("Could not switch theme.");
        } finally {
            this.themeSelect.disabled = false;
            this.update();
        }
    }

    private cycleTheme(direction: -1 | 1): void {
        const active = this.app.customCss.enabledTheme || "";
        const themes = ["", ...this.themes()];
        if (active && !themes.includes(active)) themes.push(active);
        const index = themes.indexOf(active);
        void this.setTheme(themes[(index + direction + themes.length) % themes.length]);
    }

    private toggleMode(): void {
        const success =
            this.app.commands.executeCommandById("theme:toggle-light-dark") ||
            this.app.commands.executeCommandById("app:toggle-light-dark");
        if (!success) {
            new Notice("Could not switch appearance mode.");
            return;
        }
        window.setTimeout(() => this.update(), 100);
    }

    private update(): void {
        this.panel.hidden = !this.isOpen;
        this.toggleButton.setAttribute(
            "aria-label",
            this.isOpen ? "Close appearance controls" : "Open appearance controls",
        );
        this.refreshThemes();
        const isDark = document.body.classList.contains("theme-dark");
        const label = isDark ? "Switch to light mode" : "Switch to dark mode";
        this.modeButton.textContent = isDark ? "☼" : "☾";
        this.modeButton.title = label;
        this.modeButton.setAttribute("aria-label", label);
    }
}
