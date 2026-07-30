import { ChunkDef } from '../types';
export declare function parseChunklets(root: ParentNode): ChunkDef[];
export declare function substituteParams(html: string, params: Record<string, number | string>): string;
export type PlacementMode = 'instant' | 'click' | 'drag';
export declare function chunkPlacementMode(chunk: ChunkDef): PlacementMode;
export declare function getSlideScale(): number;
