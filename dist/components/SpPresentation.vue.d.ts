import { SlideData } from '../types';
type __VLS_Props = {
    slides: SlideData[];
    rawSlideSources?: string[];
    transition?: string;
    transitionDuration?: number;
    presenter?: boolean;
    print?: false | 'slides' | 'steps';
    designWidth?: number;
    designHeight?: number;
    author?: string;
    components?: Record<string, any>;
    seed?: number;
    raw?: Record<'before' | 'after', string>;
};
declare function updateSlides(templateHtml: string): void;
declare var __VLS_6: {}, __VLS_23: {};
type __VLS_Slots = {} & {
    'global-top'?: (props: typeof __VLS_6) => any;
} & {
    'global-bottom'?: (props: typeof __VLS_23) => any;
};
declare const __VLS_base: import('../../vue/dist/vue.esm-browser.js').DefineComponent<__VLS_Props, {
    updateSlides: typeof updateSlides;
}, {}, {}, {}, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, import('../../vue/dist/vue.esm-browser.js').ComponentOptionsMixin, {}, string, import('../../vue/dist/vue.esm-browser.js').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    transition: string;
    transitionDuration: number;
    presenter: boolean;
    components: Record<string, any>;
    designWidth: number;
    designHeight: number;
    print: false | "slides" | "steps";
    author: string;
    seed: number;
}, {}, {}, {}, string, import('../../vue/dist/vue.esm-browser.js').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
