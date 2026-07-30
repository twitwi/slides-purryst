type MessageHandler = (payload: Record<string, unknown>) => void;
export declare function usePresenter(): {
    presenterWindow: import('../../vue/dist/vue.esm-browser.js').Ref<Window | null, Window | null>;
    presenterActive: import('../../vue/dist/vue.esm-browser.js').ComputedRef<boolean>;
    openPresenterWindow: () => void;
    closePresenter: () => void;
    send: (type: string, payload?: Record<string, unknown>) => void;
    onMessage: (type: string, handler: MessageHandler) => () => boolean | undefined;
    syncState: (slide: number, step: number) => void;
    syncBlackout: (active: boolean) => void;
    channel: BroadcastChannel | null;
};
export {};
