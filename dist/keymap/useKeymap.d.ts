import { KeyContext, KeymapSetupFn } from './types';
export declare function useKeymap(options: {
    getContext: () => KeyContext;
    setupFns?: KeymapSetupFn[];
}): {
    addSetup: (fn: KeymapSetupFn) => void;
    removeSetup: (fn: KeymapSetupFn) => void;
    rebuild: () => void;
};
