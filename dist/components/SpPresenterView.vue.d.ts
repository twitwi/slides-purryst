import { SlideData } from '../types';
import { SpStorageConfig } from '../composables/useStorage';
type __VLS_Props = {
    current: SlideData | null;
    currentIndex: number;
    total: number;
    activeHtml: string;
    components: Record<string, any>;
    progressPercent: number;
    blackout: boolean;
    exitBlackout: () => void;
    designWidth: number;
    designHeight: number;
    config: SpStorageConfig;
    slides: SlideData[];
};
declare const __VLS_export: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
