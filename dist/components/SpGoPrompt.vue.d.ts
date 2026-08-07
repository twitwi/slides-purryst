import { SlideData } from '../types';
type __VLS_Props = {
    slides: SlideData[];
    overviewHtmls: string[];
    designWidth: number;
    designHeight: number;
    components: Record<string, any>;
    total: number;
};
declare const __VLS_export: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {
    select: (index: number) => any;
    close: () => any;
}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSelect?: ((index: number) => any) | undefined;
    onClose?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
