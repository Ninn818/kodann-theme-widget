import { Notice } from "obsidian";

type Position = { left: number; top: number };

export class WidgetDragController {
    private drag?: {
        pointerId: number;
        startX: number;
        startY: number;
        initialLeft: number;
        initialTop: number;
        moved: boolean;
    };
    private ignoreNextClick = false;

    constructor(
        private widget: HTMLDivElement,
        private handle: HTMLButtonElement,
        private savePosition: (position: Position) => Promise<void>,
    ) {
        handle.addEventListener("pointerdown", this.start);
        document.addEventListener("pointermove", this.move);
        document.addEventListener("pointerup", this.finish);
        document.addEventListener("pointercancel", this.finish);
    }

    dispose(): void {
        this.handle.removeEventListener("pointerdown", this.start);
        document.removeEventListener("pointermove", this.move);
        document.removeEventListener("pointerup", this.finish);
        document.removeEventListener("pointercancel", this.finish);
    }

    shouldIgnoreClick(): boolean {
        if (!this.ignoreNextClick) return false;
        this.ignoreNextClick = false;
        return true;
    }

    private start = (event: PointerEvent): void => {
        if (event.button !== 0) return;
        const bounds = this.widget.getBoundingClientRect();
        this.drag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            initialLeft: bounds.left,
            initialTop: bounds.top,
            moved: false,
        };
        this.handle.setPointerCapture(event.pointerId);
    };

    private move = (event: PointerEvent): void => {
        const drag = this.drag;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const left = drag.initialLeft + event.clientX - drag.startX;
        const top = drag.initialTop + event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(left - drag.initialLeft, top - drag.initialTop) < 4) return;

        drag.moved = true;
        this.applyPosition(left, top);
        event.preventDefault();
    };

    private finish = (event: PointerEvent): void => {
        const drag = this.drag;
        if (!drag || drag.pointerId !== event.pointerId) return;
        this.drag = undefined;
        if (!drag.moved) return;

        const bounds = this.widget.getBoundingClientRect();
        this.ignoreNextClick = true;
        window.setTimeout(() => {
            this.ignoreNextClick = false;
        }, 0);
        void this.savePosition({ left: bounds.left, top: bounds.top }).catch((error: unknown) => {
            console.error("Failed to save widget position.", error);
            new Notice("Could not save widget position.");
        });
    };

    private applyPosition(left: number, top: number): void {
        const maxLeft = Math.max(0, window.innerWidth - this.widget.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - this.widget.offsetHeight);
        this.widget.style.left = `${Math.min(Math.max(0, left), maxLeft)}px`;
        this.widget.style.top = `${Math.min(Math.max(0, top), maxTop)}px`;
        this.widget.style.right = "auto";
        this.widget.style.bottom = "auto";
    }
}
