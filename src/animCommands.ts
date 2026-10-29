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
  apply(container: Element, action: AnimAction, fast?: boolean): void
  //TODO REMOVE REVERSE
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
        el.classList.remove(action.className)
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
        el.classList.add(action.className)
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
  // --- viewbox: pan/zoom an SVG's viewBox onto a target element ---
  viewbox: {
    init(container, action: ActionWithSelector) {
      const target = container.querySelector(action.selector)
      const svg = target?.closest('svg') as SvgWithViewbox | null
      if (!target || !svg) return
      svg.spOriginalViewbox ??= svg.getAttribute('viewBox') ?? ''
      svg.spViewboxStack ??= []
      svg.spInited ??= new Set()

      if (!svg.spInited.has(action)) {
        // NB: init runs actions in reverse order, so the stack is too.
        const vb = viewBoxFor(svg, target)
        if (vb) svg.spViewboxStack.push(vb)
        action._viewboxIndex = svg.spViewboxStack.length - 1
        svg.spInited.add(action)
        svg.spIndex = spApi.stepIndex === 0 ? 0 : svg.spViewboxStack.length - 1
      }

      if (!svg.querySelector('& > animate.spViewbox')) {
        const animate = svgCreate('animate')
        animate.setAttribute('class', 'spViewbox')
        animate.setAttribute('attributeName', 'viewBox')
        animate.setAttribute('fill', 'freeze')
        svg.appendChild(animate)
      }
      const animate = svg.querySelector('& > animate.spViewbox') as SVGAnimationElement | null
      if (!animate) return
      animate.setAttribute('from', svg.spOriginalViewbox)
      animate.setAttribute('to', svg.spOriginalViewbox)
      animate.setAttribute('dur', '1s')
      animate.beginElement()
    },
    apply(container, action: ActionWithSelector, fast) {
      const svg = container.querySelector(action.selector)?.closest('svg') as SvgWithViewbox | null
      if (!svg) return
      doViewboxStep(svg, action._viewboxIndex, fast)
    },
  },
}

// --- viewbox helpers ---

// Expando state kept on the target `<svg>` element while it animates.
interface SvgWithViewbox extends SVGElement {
  spOriginalViewbox: string
  spViewboxStack: string[]
  spInited: Set<AnimAction>
  spIndex: number
}

function svgCreate(tag: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tag)
}

// Compute the viewBox that frames `target` (a descendant of `svg`), by
// mapping the target's on-screen bounding rect back into the SVG's own
// coordinate space via the original viewBox.
function viewBoxFor(svg: SvgWithViewbox, target: Element): string | undefined {
  const [ox, oy, ow, oh] = svg.spOriginalViewbox.split(/\s+/).map(Number)
  if (!(ow > 0) || !(oh > 0)) return undefined
  const sRect = svg.getBoundingClientRect()
  const tRect = target.getBoundingClientRect()
  const scaleX = ow / sRect.width
  const scaleY = oh / sRect.height
  const nx = ox + (tRect.x - sRect.x) * scaleX
  const ny = oy + (tRect.y - sRect.y) * scaleY
  const nw = tRect.width * scaleX
  const nh = tRect.height * scaleY
  return `${nx} ${ny} ${nw} ${nh}`
}

// Animate the `<svg>` between the current viewBox and `stack[stackIndex]`.
// `fast` (skipped steps / backward rebuild) snaps instantly instead of animating.
function doViewboxStep(svg: SvgWithViewbox, stackIndex: number, fast?: boolean) {
  const stack = [...svg.spViewboxStack, svg.spOriginalViewbox]
  const currentViewbox = stack[stackIndex + 1]
  const newViewbox = stack[stackIndex]
  const animate = svg.querySelector('& > animate.spViewbox') as SVGAnimationElement | null
  if (!animate) return
  if (animate.getAttribute('to') === newViewbox) return
  svg.setAttribute('viewBox', currentViewbox)
  animate.endElement()
  if (fast) {
    animate.setAttribute('from', newViewbox)
    animate.setAttribute('to', newViewbox)
    animate.setAttribute('dur', '0')
    animate.beginElement()
    return
  }
  // Inspired by https://rgbstudios.org/blog/animate-svg-viewbox
  animate.setAttribute('from', currentViewbox)
  animate.setAttribute('to', newViewbox)
  animate.setAttribute('dur', '300ms')
  animate.beginElement()
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
  child: {
    countSteps: () => 1,
    parse(argsStr) {
      const args = parseArgs(argsStr)
      const sel = args[0] ?? ''
      if (!sel) return []
      if (args.length >= 3) {
        const a = parseInt(args[1])
        const b = parseInt(args[2])
        if (isNaN(a) || isNaN(b)) return []
        return [{ type: 'show', selector: `${sel} > :nth-child(n+${a}):nth-child(-n+${b})` }]
      }
      const n = parseInt(args[1] ?? '')
      if (isNaN(n)) return []
      return [{ type: 'show', selector: `${sel} > :nth-child(${n})` }]
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
  viewbox: {
    countSteps: () => 1,
    parse(argsStr) {
      return [{ type: 'viewbox', selector: argsStr.trim() }]
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
