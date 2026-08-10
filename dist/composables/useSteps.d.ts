import { Ref } from '../../vue/dist/vue.esm-browser.js';
import { SlideData } from '../types';
export declare function fixVoidElementsHtml(html: string): string;
export declare function annotateEditableWithIndex(html: string): string;
export declare function wrapEmojisInSvg(html: string): string;
export declare function processSlideHtml(html: string): {
    html: string;
    steps: number;
};
export declare function useSteps(): {
    stepIndex: Ref<number, number>;
    totalSteps: Ref<number, number>;
    isFirstStep: import('../../vue/dist/vue.esm-browser.js').ComputedRef<boolean>;
    isLastStep: import('../../vue/dist/vue.esm-browser.js').ComputedRef<boolean>;
    nextStep: () => void;
    prevStep: () => void;
    processSlideHtml: typeof processSlideHtml;
};
export declare function maybeProcessed(v: SlideData | null | undefined): {
    html: string;
    steps: number;
} | null;
