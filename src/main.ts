import { Notice, Plugin } from "obsidian";
import { AppearanceWidget } from "./appearance-widget";
import { UtilityWidget } from "./utility-widget";
import {
    DEFAULT_SETTINGS,
    KodannThemeWidgetSettingTab,
    KodannThemeWidgetSettings,
} from "./settings";

type Position = { left: number; top: number };

export default class KodannThemeWidget extends Plugin {
    settings!: KodannThemeWidgetSettings;
    private appearanceWidget?: AppearanceWidget;
    private utilityWidget?: UtilityWidget;
    private layoutReady = false;

    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new KodannThemeWidgetSettingTab(this.app, this));
        this.addCommand({
            id: "reset-widget-positions",
            name: "Reset widget positions",
            callback: () => void this.resetWidgetPositions(),
        });
        this.addRibbonIcon(
            "rotate-ccw",
            "Reset widget positions",
            () => void this.resetWidgetPositions(),
        );
        this.app.workspace.onLayoutReady(() => {
            this.layoutReady = true;
            this.syncWidgets();
        });
    }

    onunload(): void {
        this.appearanceWidget?.remove();
        this.utilityWidget?.remove();
        this.appearanceWidget = undefined;
        this.utilityWidget = undefined;
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<KodannThemeWidgetSettings>,
        );
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async setWidgetEnabled(enabled: boolean): Promise<void> {
        await this.updateSetting("widgetEnabled", enabled);
        if (this.layoutReady) this.syncAppearanceWidget();
    }

    async setUtilityWidgetEnabled(enabled: boolean): Promise<void> {
        await this.updateSetting("utilityWidgetEnabled", enabled);
        if (this.layoutReady) this.syncUtilityWidget();
    }

    private async resetWidgetPositions(): Promise<void> {
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
            new Notice("Could not reset widget positions.");
            return;
        }

        this.appearanceWidget?.resetPosition();
        this.utilityWidget?.resetPosition();
        new Notice("Widget positions reset.");
    }

    private async updateSetting(
        key: "widgetEnabled" | "utilityWidgetEnabled",
        value: boolean,
    ): Promise<void> {
        const previousValue = this.settings[key];
        this.settings[key] = value;
        try {
            await this.saveSettings();
        } catch (error) {
            this.settings[key] = previousValue;
            throw error;
        }
    }

    private syncWidgets(): void {
        this.syncAppearanceWidget();
        this.syncUtilityWidget();
    }

    private syncAppearanceWidget(): void {
        if (this.settings.widgetEnabled && !this.appearanceWidget) {
            this.appearanceWidget = new AppearanceWidget(
                this.app,
                this.settings.widgetPosition,
                (position) => this.savePosition("widgetPosition", position),
            );
        } else if (!this.settings.widgetEnabled && this.appearanceWidget) {
            this.appearanceWidget.remove();
            this.appearanceWidget = undefined;
        }
    }

    private syncUtilityWidget(): void {
        if (this.settings.utilityWidgetEnabled && !this.utilityWidget) {
            this.utilityWidget = new UtilityWidget(
                this.app,
                this.settings.utilityWidgetPosition,
                (position) => this.savePosition("utilityWidgetPosition", position),
            );
        } else if (!this.settings.utilityWidgetEnabled && this.utilityWidget) {
            this.utilityWidget.remove();
            this.utilityWidget = undefined;
        }
    }

    private async savePosition(
        key: "widgetPosition" | "utilityWidgetPosition",
        position: Position,
    ): Promise<void> {
        this.settings[key] = position;
        await this.saveSettings();
    }
}
