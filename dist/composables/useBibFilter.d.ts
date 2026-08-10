import { Ref } from '../../vue/dist/vue.esm-browser.js';
export declare function useBibFilter(opts: {
    getSlideEl: () => Element | null;
    currentIndex: Ref<number>;
    stepIndex: Ref<number>;
    contentVersion: Ref<number>;
}): {
    run: () => void;
    schedule: () => Promise<void>;
};
