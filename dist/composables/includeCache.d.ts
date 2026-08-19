import { Ref } from '../../vue/dist/vue.esm-browser.js';
export declare function setCacheIgnore(patterns: string[]): void;
export declare function getCachedInclude(src: string): Ref<string | undefined>;
export declare function getCachedBinary(src: string): Ref<string | undefined>;
export declare function preloadInclude(src: string): Promise<void>;
export declare function preloadBinary(src: string): Promise<void>;
export declare function serializeCache(): string;
export declare function loadCache(json: string): void;
export interface CacheEntry {
    path: string;
    size: number;
    timestamp: number;
    type: 'text' | 'binary';
}
export declare function getCacheEntries(): CacheEntry[];
export declare function invalidateTextCache(): void;
export declare function invalidateByFilename(filename: string): void;
export declare function clearCache(): void;
export declare function removeCacheEntry(path: string): void;
