export type DragSaveState = 'idle' | 'saving' | 'saved' | 'error';
export declare const dragSaveState: import('../../vue/dist/vue.esm-browser.js').Ref<DragSaveState, DragSaveState>;
/** Call when a drag write starts (before the POST); shows the "saving" chip. */
export declare function dragSaveBegin(): void;
/** Call when the write is confirmed and the refreshed DOM reflects it. */
export declare function dragSaveSettled(persistFlash?: boolean): void;
/** Call if the write POST fails; surfaces the error on the chip. */
export declare function dragSaveFailed(): void;
export declare function consumeSavedFlash(): boolean;
export interface DragEntry {
    el: HTMLElement;
    /** Global editable index (stable across reloads). */
    index: number;
    /** Slide position within the deck. */
    slide: number;
    /** Enter editing (no save of others — use selectDrag for that). */
    begin: () => void;
    /** Save + leave editing. */
    saveAndEnd: () => void;
}
export declare function gestureStart(): void;
export declare function gestureEnd(): void;
export declare function noteRetarget(): void;
export declare function registerDrag(entry: DragEntry): void;
export declare function unregisterDrag(el: HTMLElement): void;
/** True while some draggable is in edit mode. */
export declare function isDragEditing(): boolean;
export declare function selectDrag(entry: DragEntry): void;
export declare function exitDrag(entry: DragEntry): void;
/** Save + leave edit mode for the drag that is currently being edited. */
export declare function quitDragEditing(): void;
export declare function onDeckIndexChange(): void;
export declare function tryRestoreEditing(entry: DragEntry): boolean;
