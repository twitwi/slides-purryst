import { tinykeys, defaultKeybindingsHandlerIgnore } from 'tinykeys'
import type { Keymap, KeymapSetupFn, KeyContext, BindOptions } from './types'

export class KeymapManager {
  private _setups: KeymapSetupFn[] = []
  private _unsubscribe: (() => void) | null = null
  private _getContext: () => KeyContext

  constructor(getContext: () => KeyContext) {
    this._getContext = getContext
  }

  addSetup(fn: KeymapSetupFn) {
    this._setups.push(fn)
  }

  removeSetup(fn: KeymapSetupFn) {
    const i = this._setups.indexOf(fn)
    if (i >= 0) this._setups.splice(i, 1)
  }

  private _resolve(): Keymap {
    const km: Keymap = {}
    for (const setup of this._setups) {
      setup(km)
    }
    return km
  }

  private _wrapHandlers(km: Keymap): Keymap {
    const wrapped: Keymap = {}
    for (const [combo, handler] of Object.entries(km)) {
      const meta = (handler as any).__bind as BindOptions | undefined
      const when = meta?.when
      const prevent = meta?.preventDefault !== false

      wrapped[combo] = (e: KeyboardEvent) => {
        if (when && !when(this._getContext())) return
        if (prevent) e.preventDefault()
        handler(e)
      }
    }
    return wrapped
  }

  rebuild() {
    this._unsubscribe?.()
    const km = this._resolve()
    const wrapped = this._wrapHandlers(km)
    this._unsubscribe = tinykeys(window, wrapped, {
      ignore: (e) => defaultKeybindingsHandlerIgnore(e) || this._getContext().dragging,
    })
  }

  mount() {
    this.rebuild()
  }

  unmount() {
    this._unsubscribe?.()
    this._unsubscribe = null
  }
}
