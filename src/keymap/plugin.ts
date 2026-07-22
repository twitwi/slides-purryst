import type { SlidesPlugin, PluginAPI, KeymapSetupFn } from './types'
import { registerAnimCommand, registerAnimActionType } from '../animCommands'
import type { AnimCommandHandler, ActionTypeHandler } from '../animCommands'

export const registry = {
  _plugins: [] as SlidesPlugin[],
  _keymapSetups: [] as KeymapSetupFn[],
  _animCommands: [] as { name: string; handler: AnimCommandHandler }[],
  _animActionTypes: [] as { type: string; handler: ActionTypeHandler }[],
  _teardowns: new Map<string, (() => void)[]>(),

  register(plugin: SlidesPlugin) {
    this._plugins.push(plugin)
    const api: PluginAPI = {
      addKeymapSetup: (fn) => this._keymapSetups.push(fn),
      addAnimCommand: (name, handler) => this._animCommands.push({ name, handler }),
      addAnimActionType: (type, handler) => this._animActionTypes.push({ type, handler }),
    }
    const teardown = plugin.activate(api)
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
