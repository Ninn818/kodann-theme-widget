import "./obsidian-extensions";
import { App, Notice, setIcon } from "obsidian";
import { WidgetDragController } from "./widget-drag";

type Position = { left: number; top: number } | null;

export class UtilityWidget {
    readonly element: HTMLDivElement;
    private panel: HTMLDivElement;
    private toggleButton: HTMLButtonElement;
    private isOpen = false;
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
        this.element.className = "kodann-theme-widget kodann-utility-widget";
        this.panel = document.createElement("div");
        this.panel.className = "kodann-theme-widget-panel kodann-utility-widget-panel";
        this.panel.hidden = true;

        this.toggleButton = document.createElement("button");
        this.toggleButton.className =
            "kodann-theme-widget-toggle kodann-utility-widget-toggle";
        this.toggleButton.type = "button";
        this.toggleButton.title = "Drag to move; click to show shortcuts";
        this.toggleButton.setAttribute("aria-label", "Open Obsidian shortcuts");
        setIcon(this.toggleButton, "plus");

        this.panel.append(
            this.createAction("file-plus", "Create new note", () =>
                this.runCommand("file-explorer:new-file", "Could not create a new note."),
            ),
            this.createAction("orbit", "Open graph view", () =>
                this.runCommand("graph:open", "Could not open graph view."),
            ),
            this.createAction("focus", "Open local graph for current note", () => {
                if (!this.app.workspace.getActiveFile()) {
                    new Notice("Open a note first to view its local graph.");
                    return;
                }
                this.runCommand("graph:open-local", "Could not open the local graph.");
            }),
            this.createAction("search", "Search vault", () =>
                this.runCommand("global-search:open", "Could not open search."),
            ),
            this.createAction("files", "Quick switcher", () =>
                this.runCommand("switcher:open", "Could not open the quick switcher."),
            ),
            this.createAction("command", "Open command palette", () =>
                this.runCommand("command-palette:open", "Could not open the command palette."),
            ),
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

    remove(): void {
        document.removeEventListener("click", this.handleOutsideClick);
        this.drag.dispose();
        this.element.remove();
    }

    private createAction(icon: string, label: string, action: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "kodann-theme-widget-action kodann-utility-widget-action";
        button.type = "button";
        button.title = label;
        button.setAttribute("aria-label", label);
        setIcon(button, icon);
        button.addEventListener("click", action);
        return button;
    }

    private setPosition(position: { left: number; top: number }): void {
        this.element.style.left = `${position.left}px`;
        this.element.style.top = `${position.top}px`;
        this.element.style.right = "auto";
        this.element.style.bottom = "auto";
    }

    private runCommand(commandId: string, failureMessage: string): void {
        if (!this.app.commands.executeCommandById(commandId)) {
            new Notice(failureMessage);
            return;
        }
        this.isOpen = false;
        this.update();
    }

    private update(): void {
        this.panel.hidden = !this.isOpen;
        this.toggleButton.setAttribute(
            "aria-label",
            this.isOpen ? "Close Obsidian shortcuts" : "Open Obsidian shortcuts",
        );
        this.toggleButton.title = this.isOpen ? "Close shortcuts" : "Open shortcuts";
        setIcon(this.toggleButton, this.isOpen ? "x" : "plus");
    }
}
