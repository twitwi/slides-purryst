import { SlidesPlugin, Transformer } from './types';
import { KeymapSetupFn } from './keymap/types';
import { AnimCommandHandler, ActionTypeHandler } from './animCommands';
export declare function injectStyle(css: string): void;
export declare const registry: {
    _plugins: SlidesPlugin[];
    _keymapSetups: KeymapSetupFn[];
    _animCommands: {
        name: string;
        handler: AnimCommandHandler;
    }[];
    _animActionTypes: {
        type: string;
        handler: ActionTypeHandler;
    }[];
    _domTransforms: Transformer[];
    _teardowns: Map<string, (() => void)[]>;
    register(plugin: SlidesPlugin): Promise<void>;
    applyAnimRegistrations(): void;
    unregister(name: string): void;
};
export declare function definePlugin(plugin: SlidesPlugin): SlidesPlugin;
