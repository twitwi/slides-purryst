import { Ref } from '../../vue/dist/vue.esm-browser.js';
export declare function useSlideRefinement(opts: {
    currentIndex: Ref<number>;
    stepIndex: Ref<number>;
    contentVersion: Ref<number>;
    root: () => Element | null;
}): {
    run: () => void;
    schedule: () => Promise<void>;
};
