import { SlidesPlugin, Transformer, SlideRefinement } from './types';
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
    _slideRefinements: SlideRefinement[];
    _teardowns: Map<string, (() => void)[]>;
    refineAllSlides(root?: ParentNode): void;
    register(plugin: SlidesPlugin): Promise<void>;
    applyAnimRegistrations(): void;
    unregister(name: string): void;
};
export declare function definePlugin(plugin: SlidesPlugin): SlidesPlugin;
