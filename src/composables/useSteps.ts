import { ref, computed, type Ref } from 'vue'
import { getAnimCommand } from '../animCommands'
import { registry } from '../plugin'

let defaultStepsAt = 1

export function setDefaultStepsAt(value: number) {
  defaultStepsAt = value
}

function countAnimSpecParts(spec: string, htmlForQuery?: Element): number {
  if (!spec.trim()) return 0
  const parts = spec.split('|').map(s => s.trim())
  let count = 0
  for (const part of parts) {
    const m = part.match(/^@(\w+)\((.+)\)$/)
    if (m) {
      const cmd = getAnimCommand(m[1])
      if (cmd) {
        count += cmd.countSteps(m[2], htmlForQuery)
      } else {
        count += 1
      }
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

const VOID_TAGS = 'sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg'

const VOID_SELF_CLOSING_RE = new RegExp(`<(${VOID_TAGS})(\\s[^>]*)?/>`, 'gi')

const EDITABLE_RE = new RegExp(`<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>`, 'gi')

export function fixVoidElementsHtml(html: string): string {
  return html.replace(VOID_SELF_CLOSING_RE, '<$1$2></$1>')
}

export function annotateEditableWithIndex(html: string): string {
  let index = 0
  return html.replace(EDITABLE_RE, (match, tag, attrs, maybeSlash) => {
    const annotated = `<${tag} :editable-index="${index}"${maybeSlash || ''}${attrs || ''}>`
    if ((attrs??'').includes(':editable-index=')) {
      return match
    }
    index++
    return annotated
  })
}

function processAliases(tmp: Element) {
  tmp.querySelectorAll('sp-pause').forEach(el => {
    const jump = document.createElement('sp-jump')
    jump.setAttribute('at', '+1')
    el.replaceWith(jump)
  })
  tmp.querySelectorAll('sp-meanwhile').forEach(el => {
    const jump = document.createElement('sp-jump')
    jump.setAttribute('at', '0')
    el.replaceWith(jump)
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

function processStepsWrapper(tmp: Element) {
  tmp.querySelectorAll('sp-steps').forEach(steps => {
    const at = parseInt(steps.getAttribute('at') || String(defaultStepsAt), 10)
    const every = parseInt(steps.getAttribute('every') || '1', 10)
    const animation = steps.getAttribute('animation') || ''
    const tag = steps.getAttribute('tag') || 'div'
    const children = Array.from(steps.children)

    const handledAttrs = new Set(['at', 'every', 'animation', 'tag'])
    const wrapper = document.createElement(tag)

    for (const attr of Array.from(steps.attributes)) {
      if (!handledAttrs.has(attr.name)) {
        wrapper.setAttribute(attr.name, attr.value)
      }
    }

    children.forEach((child, i) => {
      child.setAttribute('data-sp-step', String(at + Math.floor(i / every)))
      if (animation) child.setAttribute('data-sp-step-animation', animation)
      wrapper.appendChild(child.cloneNode(true))
    })

    steps.replaceWith(wrapper)
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

function processJumpsAndAnims(root: Element): number {
  let visStep = 0
  let maxStep = 0

  root.querySelectorAll('[data-sp-step]').forEach(el => {
    const step = parseInt(el.getAttribute('data-sp-step') || '0', 10)
    if (step > maxStep) maxStep = step
  })
  root.querySelectorAll('[data-sp-step-from]').forEach(el => {
    const step = parseInt(el.getAttribute('data-sp-step-from') || '0', 10)
    if (step > maxStep) maxStep = step
  })
  root.querySelectorAll('[data-sp-step-to]').forEach(el => {
    const step = parseInt(el.getAttribute('data-sp-step-to') || '0', 10)
    if (step > maxStep) maxStep = step
  })

  function contributeMaxStep(step: number) {
    if (step > maxStep) maxStep = step
  }

  function walk(parent: Element) {
    const children = Array.from(parent.children)
    const toRemove: Element[] = []

    for (const el of children) {
      const tag = el.tagName.toLowerCase()
      let noTag = false
      let noRecursion = false

      if (tag === 'sp-style') continue

      if (tag === 'sp-jump') {
        const { relative, value } = parseJumpAt(el.getAttribute('at'))
        if (relative) visStep += value
        else visStep = value
        toRemove.push(el)
        contributeMaxStep(visStep)
        continue
      }

      if (tag === 'sp-anim') {
        const doJump = [null, 'false'].includes(el.getAttribute('no-jump'))
        const at = el.getAttribute('at') ?? '+0'
        let virtualVisStep = visStep
        const { relative, value } = parseJumpAt(at)
        if (relative) virtualVisStep += value
        else virtualVisStep = value
        el.setAttribute('at', String(virtualVisStep))
        virtualVisStep += countAnimSpecParts(el.getAttribute('spec') || '', root)
        if (doJump) {
          visStep = virtualVisStep
          contributeMaxStep(visStep)
        } else {
          contributeMaxStep(virtualVisStep)
        }
      }

      if (tag === 'sp-alternatives') {
        const at = el.getAttribute('at') ?? '+0'
        const { relative, value } = parseJumpAt(at)
        if (relative) visStep += value
        else visStep = value
        visStep += el.childElementCount
        contributeMaxStep(visStep - 1)
        noTag = true
        noRecursion = true
      }

      if (!noTag && visStep > 0 && !el.hasAttribute('data-sp-step')) {
        el.setAttribute('data-sp-step', String(visStep))
      }

      if (!noRecursion) walk(el)
    }

    for (const el of toRemove) el.remove()
  }

  walk(root)
  return maxStep + 1
}

function applyPluginTransforms(root: Element) {
  for (const fn of registry._domTransforms) {
    fn(root)
  }
}

export function processSlideHtml(html: string): { html: string; steps: number } {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  processAliases(tmp)
  processStepsWrapper(tmp)
  processAfterModifier(tmp)
  processSpStepElements(tmp)
  const steps = processJumpsAndAnims(tmp)
  applyPluginTransforms(tmp)

  return { html: tmp.innerHTML, steps }
}

export function useSteps() {
  const stepIndex: Ref<number> = ref(0)
  const totalSteps: Ref<number> = ref(1)
  const isFirstStep = computed(() => stepIndex.value === 0)
  const isLastStep = computed(() => totalSteps.value <= 1 || stepIndex.value >= totalSteps.value - 1)

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
    processSlideHtml,
  }
}
