import "obsidian";

declare module "obsidian" {
    interface App {
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
