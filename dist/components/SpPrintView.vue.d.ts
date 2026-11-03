import { SlideData } from '../types';
import { SpStorageConfig } from '../composables/useStorage';
type __VLS_Props = {
    steps: boolean;
    components: Record<string, any>;
    designWidth: number;
    designHeight: number;
    config: SpStorageConfig;
    slides: SlideData[];
    currentIndex?: number;
    stepIndex?: number;
};
declare const __VLS_export: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    currentIndex: number;
    stepIndex: number;
}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
