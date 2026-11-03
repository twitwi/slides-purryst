type __VLS_Props = {
    for?: number;
    transform?: ((html: string) => string) | null;
};
declare var __VLS_1: {
    forSlide: number;
};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    transform: ((html: string) => string) | null;
    for: number;
}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
