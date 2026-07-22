import type { KeyHandler, BindOptions } from './types'

export function bind(handler: KeyHandler, options?: BindOptions): KeyHandler {
  const wrapped: KeyHandler & { __bind?: BindOptions } = (e) => handler(e)
  if (options) {
    wrapped.__bind = options
  }
  return wrapped
}
