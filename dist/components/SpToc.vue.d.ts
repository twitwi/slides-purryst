type __VLS_Props = {
    start?: number | string;
    end?: number | string;
    highlight?: number | string;
    context?: boolean;
};
declare var __VLS_1: {
    items: import('..').TocItem[];
    currentIndex: number;
    goTo: (n: number) => void;
    activeSection: import('..').TocItem | null;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    highlight: number | string;
    start: number | string;
    end: number | string;
    context: boolean;
}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
