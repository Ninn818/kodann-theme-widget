import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import KodannThemeWidget from "./main";

export interface KodannThemeWidgetSettings {
    widgetEnabled: boolean;
    widgetPosition: { left: number; top: number } | null;
    utilityWidgetEnabled: boolean;
    utilityWidgetPosition: { left: number; top: number } | null;
}

export const DEFAULT_SETTINGS: KodannThemeWidgetSettings = {
    widgetEnabled: true,
    widgetPosition: null,
    utilityWidgetEnabled: true,
    utilityWidgetPosition: null,
};

export class KodannThemeWidgetSettingTab extends PluginSettingTab {
    plugin: KodannThemeWidget;

    constructor(app: App, plugin: KodannThemeWidget) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Enable floating widget")
            .setDesc("Show or hide the floating appearance controls.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.widgetEnabled)
                    .onChange(async (enabled) => {
                        const previousValue = this.plugin.settings.widgetEnabled;
                        try {
                            await this.plugin.setWidgetEnabled(enabled);
                        } catch (error) {
                            console.error("Failed to save widget setting.", error);
                            new Notice("Could not save widget setting.");
                            toggle.setValue(previousValue);
                        }
                    }),
            );

        new Setting(containerEl)
            .setName("Enable utility widget")
            .setDesc("Show shortcuts for notes, graph views, search, and navigation.")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.utilityWidgetEnabled)
                    .onChange(async (enabled) => {
                        const previousValue = this.plugin.settings.utilityWidgetEnabled;
                        try {
                            await this.plugin.setUtilityWidgetEnabled(enabled);
                        } catch (error) {
                            console.error("Failed to save utility widget setting.", error);
                            new Notice("Could not save utility widget setting.");
                            toggle.setValue(previousValue);
                        }
                    }),
            );
    }
}
