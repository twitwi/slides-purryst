export declare const lastResolvedTemplate: import('../../vue/dist/vue.esm-browser.js').Ref<string, string>;
export declare function setOptimisticSnapshotSyncer(fn: () => void): void;
/** Record a POST-confirmed write and re-sync the snapshot views. */
export declare function noteOptimisticWrite(index: number, newAt: string): void;
export declare function resolveOptimisticAt(index: number): string | null;
export interface OptimisticDragAttrs {
    x: number;
    y: number;
    w: number | string;
    h: number | string;
    rotate: number;
}
/** The committed optimistic `rbox` parsed into fields, or null if not pending. */
export declare function optimisticParseAt(index: number): OptimisticDragAttrs | null;
/** Apply every pending optimistic write onto a template string. */
export declare function applyOptimistic(source: string): string;
export declare function reconcileOptimistic(source: string): string;
/** Re-derive the snapshot views from the last known template. */
export declare function syncOptimisticSnapshot(): void;
/** Raw slide sources with pending optimistic writes applied. */
export declare function optimisticRawSlideSources(): string[];
