export interface SpStorageConfig {
    navLocked: boolean;
    overviewScale: number;
    proMode: boolean;
    logSteps: boolean;
    darkMode: 'auto' | 'light' | 'dark';
    [key: string]: unknown;
}
export declare function useStorage(): {
    [x: string]: unknown;
    navLocked: boolean;
    overviewScale: number;
    proMode: boolean;
    logSteps: boolean;
    darkMode: "auto" | "light" | "dark";
};
export declare function resetConfig(): void;
