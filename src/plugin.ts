import type { SlidesPlugin, PluginAPI, Transformer, ChunkDef, SlideRefinement } from './types'
import type { KeymapSetupFn } from './keymap/types'
import type { AnimCommandHandler, ActionTypeHandler } from './animCommands'
import { registerAnimCommand, registerAnimActionType } from './animCommands'
import { spApi } from './sp-api'

export function injectStyle(css: string) {
  const el = document.createElement('style')
  el.textContent = css
  document.head.appendChild(el)
}

export const registry = {
  _plugins: [] as SlidesPlugin[],
  _keymapSetups: [] as KeymapSetupFn[],
  _animCommands: [] as { name: string; handler: AnimCommandHandler }[],
  _animActionTypes: [] as { type: string; handler: ActionTypeHandler }[],
  _domTransforms: [] as Transformer[],
  _slideRefinements: [] as SlideRefinement[],
  _teardowns: new Map<string, (() => void)[]>(),

  // Apply every registered refinement to every `.sp-slide` inside `root`
  // (defaults to the whole document). Refinements are idempotent, so this can
  // safely run again on step/content changes.
  refineAllSlides(root: ParentNode = document) {
    for (const slideEl of root.querySelectorAll('.sp-slide')) {
      for (const refinement of this._slideRefinements) {
        if (refinement.appliesTo(slideEl)) refinement.apply(slideEl)
      }
    }
  },

  async register(plugin: SlidesPlugin) {
    this._plugins.push(plugin)
    const noop = () => {}
    const d = plugin.disable ?? []
    const api: PluginAPI = {
      spApi,
      addKeymapSetup:      d.includes('keymap')          ? noop : (fn: KeymapSetupFn) => this._keymapSetups.push(fn),
      addAnimCommand:      d.includes('anim')            ? noop : (name: string, handler: AnimCommandHandler) => this._animCommands.push({ name, handler }),
      addAnimActionType:   d.includes('anim')            ? noop : (type: string, handler: ActionTypeHandler) => this._animActionTypes.push({ type, handler }),
      injectStyle:         d.includes('style')           ? noop : injectStyle,
      addChunklet:         d.includes('chunklet')        ? noop : (def: ChunkDef) => spApi.chunkletDefs.push(def),
      addDomTransform:     d.includes('domTransform')    ? noop : (fn: Transformer) => this._domTransforms.push(fn),
      addSlideRefinement:  d.includes('slideRefinement') ? noop : (refinement: SlideRefinement) => this._slideRefinements.push(refinement),
    }
    const result = plugin.activate(api)
    const teardown = result instanceof Promise ? await result : result
    if (teardown) {
      const t = this._teardowns.get(plugin.name) ?? []
      t.push(teardown)
      this._teardowns.set(plugin.name, t)
    }
  },

  applyAnimRegistrations() {
    for (const { name, handler } of this._animCommands) {
      registerAnimCommand(name, handler)
    }
    for (const { type, handler } of this._animActionTypes) {
      registerAnimActionType(type, handler)
    }
  },

  unregister(name: string) {
    const idx = this._plugins.findIndex(p => p.name === name)
    if (idx < 0) return
    const teardowns = this._teardowns.get(name) ?? []
    teardowns.forEach(fn => fn())
    this._teardowns.delete(name)
    this._plugins.splice(idx, 1)
  },
}

export function definePlugin(plugin: SlidesPlugin): SlidesPlugin {
  return plugin
}
