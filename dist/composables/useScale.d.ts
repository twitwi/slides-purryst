export declare function useScale(designWidth?: number, designHeight?: number): {
    transformStyle: import('../../vue/dist/vue.esm-browser.js').ComputedRef<{
        transform: string;
        transformOrigin: string;
        width: string;
        height: string;
        '--slide-transform-scale': string;
    }>;
    containerStyle: import('../../vue/dist/vue.esm-browser.js').ComputedRef<{
        width: string;
        height: string;
    }>;
};
