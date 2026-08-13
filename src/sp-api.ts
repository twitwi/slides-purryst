import { reactive } from 'vue'
import type { AnimCommandHandler, ActionTypeHandler } from './animCommands'
import type { ChunkDef } from './types'

export type SpApi = typeof spApi

export const spApi = reactive({
  navLocked: false,
  currentIndex: 0,
  stepIndex: 0,
  total: 0,
  effectiveLast: 0,
  effectiveTotal: 0,
  fakeEndIndices: [] as number[],
  toggleNavLock: () => {},
  goTo: (_n: number) => {},
  next: () => {},
  prev: () => {},
  nextSlide: () => {},
  prevSlide: () => {},
  export: () => {},
  dragging: false,
  config: {} as Record<string, unknown>,
  _animCommands: {} as Record<string, AnimCommandHandler>,
  _animActionTypes: {} as Record<string, ActionTypeHandler>,
  overview: false,
  showChunkletsBar: false,
  chunkletDefs: [] as ChunkDef[],
  chunkletMode: false,
  selectedChunklet: null as ChunkDef | null,
})

export const exportInitOptions: Record<string, unknown> = {}

// `<style>` elements injected by the framework at runtime (init `css`, global
// `sp-style`). Export copies head styles EXCEPT these, to avoid duplicating
// framework-injected CSS in the standalone output.
export const runtimeStyleEls = new Set<HTMLStyleElement>()
