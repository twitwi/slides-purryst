import { spApi } from './sp-api'

// --- Types ---

export interface AnimAction {
  type: string
  delayedBy?: number
  [key: string]: any
}

interface ActionWithSelector extends AnimAction {
  selector: string
}

export interface AnimActionWithClass extends ActionWithSelector {
  className: string
}

export interface AnimCommandHandler {
  countSteps(args: string, htmlEl?: Element): number
  parse(args: string): AnimAction[]
  expand?(args: string, container: Element): AnimAction[][]
  init?(args: string, container: Element): void
}

export interface ActionTypeHandler {
  apply(container: Element, action: AnimAction): void
  reverse(container: Element, action: AnimAction): void
  init?(container: Element, action: AnimAction): void
}

// --- parseArgs ---

export function parseArgs(str: string): string[] {
  const args: string[] = []
  let current = ''
  let inQuote: '"' | "'" | null = null

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (inQuote) {
      if (ch === inQuote) { inQuote = null }
      else { current += ch }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
    } else if (ch === ',') {
      args.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  args.push(current.trim())
  return args
}

// --- Built-in action types ---

const builtinActionTypes: Record<string, ActionTypeHandler> = {
  show: {
    apply(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add('sp-anim-shown')
        el.classList.remove('sp-anim-hidden')
      }
    },
    reverse(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add('sp-anim-hidden')
        el.classList.remove('sp-anim-shown')
      }
    },
    init(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.setAttribute('data-sp-animated', 'true')
        el.classList.add('sp-anim-hidden')
        el.classList.remove('sp-anim-shown')
      }
    },
  },
  hide: {
    apply(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add('sp-anim-hidden')
        el.classList.remove('sp-anim-shown')
      }
    },
    reverse(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add('sp-anim-shown')
        el.classList.remove('sp-anim-hidden')
      }
    },
    init(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.setAttribute('data-sp-animated', 'true')
        el.classList.add('sp-anim-shown')
        el.classList.remove('sp-anim-hidden')
      }
    },
  },
  addClass: {
    apply(container, action: AnimActionWithClass) {
      if (!action.className) "return"
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add(action.className)
      }
    },
    reverse(container, action: AnimActionWithClass) {
      if (!action.className) return
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.remove(action.className)
      }
    },
    init(container, action: AnimActionWithClass) {
      if (!action.className) return
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.setAttribute('data-sp-animated', 'true')
      }
    },
  },
  removeClass: {
    apply(container, action: AnimActionWithClass) {
      if (!action.className) return
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.remove(action.className)
      }
    },
    reverse(container, action: AnimActionWithClass) {
      if (!action.className) return
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.classList.add(action.className)
      }
    },
    init(container, action: AnimActionWithClass) {
      if (!action.className) return
      for (const el of container.querySelectorAll<HTMLElement>(action.selector)) {
        el.setAttribute('data-sp-animated', 'true')
      }
    },
  },
  play: {
    apply(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        if (action.rewind) {
          el.currentTime = 0
        }
        el.play().catch(() => {})
      }
    },
    reverse(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        el.pause()
      }
    },
    init(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        el.pause()
        el.currentTime = 0
      }
    },
  },
  pause: {
    apply(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        el.pause()
      }
    },
    reverse(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        el.play().catch(() => {})
      }
    },
    init(container, action: ActionWithSelector) {
      for (const el of container.querySelectorAll<HTMLVideoElement>(action.selector)) {
        el.pause()
      }
    },
  },
}

// --- Built-in commands ---

function expandChildren(selector: string, container: Element): AnimAction[] {
  const actions: AnimAction[] = []
  const parent = container.querySelector(selector)
  if (parent) {
    for (let i = 0; i < parent.children.length; i++) {
      actions.push({ type: 'show', selector: `${selector} > :nth-child(${i + 1})` })
    }
  }
  return actions
}

const builtinCommands: Record<string, AnimCommandHandler> = {
  children: {
    countSteps(args, htmlEl) {
      if (!htmlEl) return 1
      const parent = htmlEl.querySelector(args)
      return parent ? Math.max(1, parent.children.length) : 1
    },
    parse() {
      return []
    },
    expand(args, container) {
      return expandChildren(args, container).map(a => [a])
    },
    init(args, container) {
      const parent = container.querySelector(args)
      if (!parent) return
      for (const child of parent.children) {
        (child as HTMLElement).classList.add('sp-anim-hidden');
        (child as HTMLElement).classList.remove('sp-anim-shown')
      }
    },
  },
  add: {
    countSteps: () => 1,
    parse(argsStr) {
      const args = parseArgs(argsStr)
      const cls = args[0] ?? ''
      const sel = args.slice(1).join(',')
      return [{ type: 'addClass', className: cls, selector: sel }]
    },
  },
  remove: {
    countSteps: () => 1,
    parse(argsStr) {
      const args = parseArgs(argsStr)
      const cls = args[0] ?? ''
      const sel = args.slice(1).join(',')
      return [{ type: 'removeClass', className: cls, selector: sel }]
    },
  },
  '+class': {
    countSteps: () => 1,
    parse(argsStr) {
      const parts = argsStr.trim().split(/\s+/)
      const cls = parts[0] ?? ''
      const sel = parts.slice(1).join(' ')
      return [{ type: 'addClass', className: cls, selector: sel }]
    },
  },
  '-class': {
    countSteps: () => 1,
    parse(argsStr) {
      const parts = argsStr.trim().split(/\s+/)
      const cls = parts[0] ?? ''
      const sel = parts.slice(1).join(' ')
      return [{ type: 'removeClass', className: cls, selector: sel }]
    },
  },
  play: {
    countSteps: () => 1,
    parse(argsStr) {
      const args = parseArgs(argsStr)
      console.log('play args', args)
      const sel = args[0] || 'video'
      const rewind = args.slice(1).includes('rewind')
      return [{ type: 'play', selector: sel, rewind }]
    },
  },
  pause: {
    countSteps: () => 1,
    parse(argsStr) {
      const args = parseArgs(argsStr)
      const sel = args[0] || 'video'
      return [{ type: 'pause', selector: sel }]
    },
  },
}

// --- Initialize registries on spApi ---

;(spApi as any)._animCommands = { ...builtinCommands }
;(spApi as any)._animActionTypes = { ...builtinActionTypes }

// --- Registry API ---

export function getAnimCommand(name: string): AnimCommandHandler | undefined {
  return (spApi as any)._animCommands[name]
}

export function registerAnimCommand(name: string, handler: AnimCommandHandler) {
  ;(spApi as any)._animCommands[name] = handler
}

export function listAnimCommands(): string[] {
  return Object.keys((spApi as any)._animCommands)
}

export function getAnimActionType(type: string): ActionTypeHandler | undefined {
  return (spApi as any)._animActionTypes[type]
}

export function registerAnimActionType(type: string, handler: ActionTypeHandler) {
  ;(spApi as any)._animActionTypes[type] = handler
}

export function listAnimActionTypes(): string[] {
  return Object.keys((spApi as any)._animActionTypes)
}
