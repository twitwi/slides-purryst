export type KeyHandler = (event: KeyboardEvent) => void;
export interface Keymap {
    [combo: string]: KeyHandler;
}
export type KeymapSetupFn = (keymap: Keymap) => void;
export interface KeyContext {
    overview: boolean;
    presenter: boolean;
    blackout: boolean;
    devPane: boolean;
    dragging: boolean;
    goPrompt: boolean;
}
export interface BindOptions {
    when?: (ctx: KeyContext) => boolean;
    preventDefault?: boolean;
}
