import type { SlidesPlugin, PluginAPI, KeymapSetupFn } from './types'

export const registry = {
  _plugins: [] as SlidesPlugin[],
  _keymapSetups: [] as KeymapSetupFn[],
  _teardowns: new Map<string, (() => void)[]>(),

  register(plugin: SlidesPlugin) {
    this._plugins.push(plugin)
    const api: PluginAPI = {
      addKeymapSetup: (fn) => this._keymapSetups.push(fn),
    }
    const teardown = plugin.activate(api)
    if (teardown) {
      const t = this._teardowns.get(plugin.name) ?? []
      t.push(teardown)
      this._teardowns.set(plugin.name, t)
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
