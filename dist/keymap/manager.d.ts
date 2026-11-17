import { KeymapSetupFn, KeyContext } from './types';
export declare class KeymapManager {
    private _setups;
    private _unsubscribe;
    private _getContext;
    constructor(getContext: () => KeyContext);
    addSetup(fn: KeymapSetupFn): void;
    removeSetup(fn: KeymapSetupFn): void;
    private _resolve;
    private _wrapHandlers;
    rebuild(): void;
    mount(): void;
    unmount(): void;
}
