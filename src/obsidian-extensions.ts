import "obsidian";

declare module "obsidian" {
    interface App {
        setting: {
            open(): void;
            openTabById(id: string): void;
        };
        customCss: {
            enabledTheme: string | null;
            themes: string[] | Record<string, unknown>;
            setTheme(themeName: string): Promise<void>;
        };
        commands: {
            executeCommandById(commandId: string): boolean;
        };
    }
}
