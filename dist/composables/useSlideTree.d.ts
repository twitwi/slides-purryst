import { Ref } from '../../vue/dist/vue.esm-browser.js';
import { SlideData } from '../types';
export interface TocItem {
    slideIndex: number;
    slideNum: number;
    level: number;
    text: string;
}
export declare function useSlideTree(slides: Ref<SlideData[]>): {
    tree: import('../../vue/dist/vue.esm-browser.js').ComputedRef<TocItem[]>;
};
