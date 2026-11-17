import { KeymapSetupFn } from './types';
import { SlideData } from '../types';
export interface NavigationActions {
    next: () => void;
    prev: () => void;
    goTo: (i: number) => void;
    goToPrevBegin: () => void;
    goToNextBegin: () => void;
    goToPrevEnd: () => void;
    goToNextEnd: () => void;
    currentIndex: {
        value: number;
    };
    current: {
        value: SlideData | null;
    };
    total: {
        value: number;
    };
    nextStep: () => void;
    prevStep: () => void;
    stepIndex: {
        value: number;
    };
    totalSteps: {
        value: number;
    };
    isLastStep: {
        value: boolean;
    };
    isFirstStep: {
        value: boolean;
    };
    onPresenterToggle?: () => void;
    onOverviewToggle?: () => void;
    onOverviewExit?: () => void;
    onGoPrompt?: () => void;
    onBlackoutToggle?: () => void;
    onBlackoutExit?: () => void;
    onDevPaneToggle?: () => void;
    onChunkBarToggle?: () => void;
}
export declare function createDefaultKeymap(a: NavigationActions): KeymapSetupFn;
