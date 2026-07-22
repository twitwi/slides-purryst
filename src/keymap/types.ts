import type { AnimCommandHandler, ActionTypeHandler } from '../animCommands'

export type KeyHandler = (event: KeyboardEvent) => void

export interface Keymap {
  [combo: string]: KeyHandler
}

export type KeymapSetupFn = (keymap: Keymap) => void

export interface KeyContext {
  overview: boolean
  presenter: boolean
  blackout: boolean
  devPane: boolean
  dragging: boolean
  goPrompt: boolean
}

export interface SlidesPlugin {
  name: string
  activate: (api: PluginAPI) => void | (() => void)
}

export interface PluginAPI {
  addKeymapSetup: (fn: KeymapSetupFn) => void
  addAnimCommand: (name: string, handler: AnimCommandHandler) => void
  addAnimActionType: (type: string, handler: ActionTypeHandler) => void
}

export interface BindOptions {
  when?: (ctx: KeyContext) => boolean
  preventDefault?: boolean
}
