import type { Component } from 'vue'
import type { KeymapSetupFn } from './keymap/types'
import type { AnimCommandHandler, ActionTypeHandler } from './animCommands'
import type { SpApi } from './sp-api'

export type FacetName = 'anim' | 'keymap' | 'style' | 'chunklet' | 'slideRefinement' | (string & {})

export interface SlidesPlugin {
  name: string
  order?: number
  disable?: FacetName[]
  activate: (api: PluginAPI) => void | Promise<void> | (() => void)
}

export interface PluginAPI {
  spApi: SpApi
  addKeymapSetup: (fn: KeymapSetupFn) => void
  addAnimCommand: (name: string, handler: AnimCommandHandler) => void
  addAnimActionType: (type: string, handler: ActionTypeHandler) => void
  injectStyle: (css: string) => void
  addChunklet: (def: ChunkDef) => void
  addDomTransform: (fn: Transformer) => void
  addSlideRefinement: (refinement: SlideRefinement) => void
}

export interface SlideData {
  html: string
  editableIndex: number
  num: number
  steps: number
  transition: string
  class?: string
  noToc?: boolean
  notes?: string
  transitionDuration?: number
  fakeEnd?: boolean
  sourceFile?: string
  sourceLine?: number
}

export interface Navigation {
  next: () => void
  prev: () => void
  goTo: (i: number) => void
  goToPrevBegin: () => void
  goToNextBegin: () => void
  goToPrevEnd: () => void
  goToNextEnd: () => void
  currentIndex: { value: number }
  current: { value: SlideData | null }
  total: { value: number }
  nextStep: () => void
  prevStep: () => void
  stepIndex: { value: number }
  totalSteps: { value: number }
  isLastStep: { value: boolean }
  isFirstStep: { value: boolean }
}

export interface SPSlidesOptions {
  slides?: SlideData[]
  el?: string | HTMLElement
  transition?: string
  transitionDuration?: number
  designWidth?: number
  designHeight?: number
  author?: string
  presenter?: boolean
  theme?: string
  components?: Record<string, Component>
  seed?: number
  cacheIgnore?: string[]
  plugins?: SlidesPlugin[]
  activate?: (api: PluginAPI) => void
}

// Payload of the `<script type="text/html" id="sp-init">` element (emitted by
// the typst `#sp-init(...)` helper, or hand-written in HTML). `config` merges
// into the page-author init-param layer; `css` is injected before mount; `js`
// runs at the very start of createSlidesPurryst(); `jsMounted` runs after mount.
export interface SpInitPayload {
  config?: Record<string, unknown>
  css?: string
  js?: string
  jsMounted?: string
}

export interface ChunkDef {
  name: string
  params: string[]
  html: string
  kind: 'html' | 'typst'
}

export type Transformer = (root: Element) => void

// A runtime slide refinement: an idempotent, step- and content-aware DOM
// adjustment applied to each rendered slide (the runtime counterpart of the
// compile-time `Transformer`). `appliesTo` is a cheap gate; `apply` mutates
// the slide element. Registered via `PluginAPI.addSlideRefinement` and re-run by
// the driver whenever the slide re-renders or its step/content changes.
export interface SlideRefinement {
  name: string
  appliesTo: (slideEl: Element) => boolean
  apply: (slideEl: Element) => void
}

export interface PresenterState {
  slide: number
  step: number
  totalSlides: number
  notes?: string
}

export interface AnimHandle {
  syncToStep(step: number, fast: boolean): void
  refresh(fast?: boolean): void
}