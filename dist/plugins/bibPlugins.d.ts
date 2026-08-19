import { SlidesPlugin } from '../types';
declare const defaultBibFilteringOptions: {
    BIB_SELECTOR: string;
    CITE_SELECTOR: string;
    HIDDEN_CLASS: string;
    ABSENT_CLASS: string;
    EMPTY_CLASS: string;
};
export type BibFilteringOptions = typeof defaultBibFilteringOptions;
declare const defaultBibCompactorOptions: {
    patch: (r: [string | RegExp, string, string][]) => void;
};
export type BibCompactorOptions = typeof defaultBibCompactorOptions;
export declare function bibCompactor(override?: Partial<BibCompactorOptions>): SlidesPlugin;
export declare function bibFiltering(override?: Partial<BibFilteringOptions>): SlidesPlugin;
export {};
