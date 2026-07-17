import { ref, computed, type Ref } from 'vue'
import type { SlideData } from '../types'

let defaultClicksAt = 1

export function setDefaultClicksAt(value: number) {
  defaultClicksAt = value
}

function countAnimSpecParts(spec: string, htmlForQuery?: string): number {
  if (!spec.trim()) return 0
  const parts = spec.split('|').map(s => s.trim())
  let count = 0
  for (const part of parts) {
    const childMatch = part.match(/^@children\((.+)\)$/)
    if (childMatch && htmlForQuery) {
      const tmp = document.createElement('div')
      tmp.innerHTML = htmlForQuery
      const parent = tmp.querySelector(childMatch[1])
      count += parent ? Math.max(1, parent.children.length) : 1
    } else {
      count += 1
    }
  }
  return count
}

function parseJumpAt(at: string | null): { relative: boolean; value: number } {
  if (!at || at === '+1') return { relative: true, value: 1 }
  at = at.trim()
  if (at.startsWith('+') || at.startsWith('-')) {
    return { relative: true, value: parseInt(at, 10) }
  }
  return { relative: false, value: parseInt(at, 10) }
}

function makeJump(at: string): Element {
  const el = document.createElement('sp-jump')
  el.setAttribute('at', at)
  return el
}

export function buildSteps(slide: SlideData | null) {
  if (!slide) return 0
  const html = slide.html
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  processAliases(tmp)

  let maxStep = 0
  let visStep = 0

  // Count sp-jump elements (unified)
  tmp.querySelectorAll('sp-jump').forEach(j => {
    const { relative, value } = parseJumpAt(j.getAttribute('at'))
    if (relative) {
      visStep += value
    } else {
      visStep = value
    }
    maxStep = Math.max(maxStep, visStep)
  })

  // Count sp-step elements
  tmp.querySelectorAll('sp-step').forEach((s) => {
    const at = parseInt(s.getAttribute('at') || '0', 10)
    maxStep = Math.max(maxStep, at)
    const to = s.getAttribute('to')
    if (to) {
      maxStep = Math.max(maxStep, parseInt(to, 10) - 1)
    }
    const from = s.getAttribute('from')
    if (from) {
      maxStep = Math.max(maxStep, parseInt(from, 10))
    }
  })

  // Count sp-anim spec parts (excluding @jump which is removed)
  tmp.querySelectorAll('sp-anim').forEach(a => {
    const spec = a.getAttribute('spec') || ''
    maxStep += countAnimSpecParts(spec, html)
  })

  // Count sp-alternatives
  tmp.querySelectorAll('sp-alternatives').forEach(a => {
    const at = parseInt(a.getAttribute('at') || '0', 10)
    const children = a.children.length
    if (children > 0) {
      maxStep = Math.max(maxStep, at + children - 1)
    }
  })

  // Count sp-clicks wrapper
  tmp.querySelectorAll('sp-clicks').forEach(c => {
    const at = parseInt(c.getAttribute('at') || String(defaultClicksAt), 10)
    const every = parseInt(c.getAttribute('every') || '1', 10)
    const children = c.children.length
    if (children > 0) {
      const lastStep = at + Math.ceil(children / every) - 1
      maxStep = Math.max(maxStep, lastStep)
    }
  })

  return maxStep + 1
}

function stripAnimHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  let visStep = 0

  function walk(parent: Element) {
    const children = Array.from(parent.children)
    const toRemove: Element[] = []

    for (const el of children) {
      const tag = el.tagName.toLowerCase()

      if (tag === 'sp-jump') {
        const { relative, value } = parseJumpAt(el.getAttribute('at'))
        if (relative) {
          visStep += value
        } else {
          visStep = value
        }
        toRemove.push(el)
        continue
      }

      if (tag === 'sp-anim') {
        continue
      }

      if (tag === 'sp-style') continue

      // Stamp data-sp-step on elements after a jump
      if (visStep > 0 && !el.hasAttribute('data-sp-step')) {
        el.setAttribute('data-sp-step', String(visStep))
      }

      walk(el)
    }

    for (const el of toRemove) {
      el.remove()
    }
  }

  walk(tmp)
  return tmp.innerHTML
}

function processAliases(tmp: Element) {
  tmp.querySelectorAll('sp-pause').forEach(el => {
    el.replaceWith(makeJump('+1'))
  })
  tmp.querySelectorAll('sp-meanwhile').forEach(el => {
    el.replaceWith(makeJump('0'))
  })
}

function processAfterModifier(tmp: Element) {
  let lastAt = 0
  const walk = (parent: Element) => {
    const children = Array.from(parent.children)
    for (const el of children) {
      const tag = el.tagName.toLowerCase()
      
      if (tag === 'sp-step') {
        const after = el.getAttribute('after')
        if (after !== null) {
          el.setAttribute('at', String(lastAt))
          el.removeAttribute('after')
        } else {
          const at = parseInt(el.getAttribute('at') || '0', 10)
          lastAt = at
        }
      }
      
      walk(el)
    }
  }
  walk(tmp)
}

function processClicksWrapper(tmp: Element) {
  tmp.querySelectorAll('sp-clicks').forEach(clicks => {
    const at = parseInt(clicks.getAttribute('at') || String(defaultClicksAt), 10)
    const every = parseInt(clicks.getAttribute('every') || '1', 10)
    const animation = clicks.getAttribute('animation') || ''
    const tag = clicks.getAttribute('tag') || 'div'
    const children = Array.from(clicks.children)
    
    const handledAttrs = new Set(['at', 'every', 'animation', 'tag'])
    const wrapper = document.createElement(tag)
    wrapper.setAttribute('sp-clicks-wrapper', '')
    
    for (const attr of Array.from(clicks.attributes)) {
      if (!handledAttrs.has(attr.name)) {
        wrapper.setAttribute(attr.name, attr.value)
      }
    }
    
    children.forEach((child, i) => {
      child.setAttribute('data-sp-step', String(at + Math.floor(i / every)))
      if (animation) child.setAttribute('data-sp-step-animation', animation)
      wrapper.appendChild(child.cloneNode(true))
    })
    
    clicks.replaceWith(wrapper)
  })
}

function processSpStepElements(tmp: Element) {
  tmp.querySelectorAll('sp-step').forEach(step => {
    const at = step.getAttribute('at')
    const from = step.getAttribute('from')
    const to = step.getAttribute('to')
    const type = step.getAttribute('type')
    const animation = step.getAttribute('animation')

    const childEls = Array.from(step.children)
    if (childEls.length > 0) {
      childEls.forEach(el => {
        if (at !== null) el.setAttribute('data-sp-step', at)
        if (from !== null) el.setAttribute('data-sp-step-from', from)
        if (to !== null) el.setAttribute('data-sp-step-to', to)
        if (type === 'only') el.setAttribute('data-sp-step-only', '')
        if (animation) el.setAttribute('data-sp-step-animation', animation)
      })
      step.replaceWith(...Array.from(step.childNodes))
    } else {
      // Text-only sp-step: wrap in span
      const span = document.createElement('span')
      if (at !== null) span.setAttribute('data-sp-step', at)
      if (from !== null) span.setAttribute('data-sp-step-from', from)
      if (to !== null) span.setAttribute('data-sp-step-to', to)
      if (type === 'only') span.setAttribute('data-sp-step-only', '')
      if (animation) span.setAttribute('data-sp-step-animation', animation)
      span.innerHTML = step.innerHTML
      step.replaceWith(span)
    }
  })
}

export function processHtml(html: string, stepIndex: number): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  // Convert sp-pause and sp-meanwhile to sp-jump
  processAliases(tmp)

  // Process sp-clicks wrapper (stamps data-sp-step on children)
  processClicksWrapper(tmp)
  
  // Process "after" modifier in sp-step (must run before convertSpStepElements)
  processAfterModifier(tmp)

  // Convert <sp-step> elements to data-sp-step attributes on children
  processSpStepElements(tmp)

  return stripAnimHtml(tmp.innerHTML)
}

export function useSteps() {
  const stepIndex: Ref<number> = ref(0)
  const totalSteps: Ref<number> = ref(1)
  const isFirstStep = computed(() => stepIndex.value === 0)
  const isLastStep = computed(() => totalSteps.value <= 1 || stepIndex.value >= totalSteps.value - 1)

  function build(slide: SlideData | null) {
    totalSteps.value = buildSteps(slide)
  }

  function nextStep() {
    if (stepIndex.value < totalSteps.value - 1) {
      stepIndex.value++
    }
  }

  function prevStep() {
    if (stepIndex.value > 0) {
      stepIndex.value--
    }
  }

  return {
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    buildSteps: build,
    processHtml,
  }
}
