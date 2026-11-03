import { Ref } from '../../vue/dist/vue.esm-browser.js';
export declare function useElementScale(parentRef: Ref<HTMLElement | null>, designWidth: number, designHeight: number): {
    transformStyle: import('../../vue/dist/vue.esm-browser.js').ComputedRef<{
        transform: string;
        transformOrigin: "top left";
        width: string;
        height: string;
    }>;
};
