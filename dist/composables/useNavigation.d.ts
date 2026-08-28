import { Navigation } from '../types';
import { KeyContext, KeymapSetupFn } from '../keymap/types';
export type NavigationActions = Navigation & {
    onPresenterToggle?: () => void;
    onOverviewToggle?: () => void;
    onOverviewExit?: () => void;
    onGoPrompt?: () => void;
    onBlackoutToggle?: () => void;
    onBlackoutExit?: () => void;
    onDevPaneToggle?: () => void;
    onChunkBarToggle?: () => void;
};
export declare function useNavigation(actions: NavigationActions, options?: {
    getContext?: () => KeyContext;
    extraSetups?: KeymapSetupFn[];
}): {
    rebuildKeymap: () => void;
};
