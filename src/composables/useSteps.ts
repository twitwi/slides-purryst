import { ref, computed, type Ref } from 'vue'
import { getAnimCommand } from '../animCommands'
import { registry } from '../plugin'
import { addGlobalErrorMessage } from './globalErrorMessages'
import { SlideData } from '../types'

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

const VOID_TAGS = 'sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source'

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

export function wrapEmojisInSvg(html: string): string {
  // Matches only Unicode Emoji Presentation characters
  const emojiRegex = /(\p{Emoji_Presentation})/gu;
  return html.replace(emojiRegex, (match) => {
    return `<span style="display: inline-flex; vertical-align: middle; line-height: 0;"><svg viewBox="0 0 100 100" style="width:1em; height:1em; display: inline-block;"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${match}</text></svg></span>`;
  });
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

function processAlsoModifier(tmp: Element) {
  let lastFrom = 0
  const walk = (parent: Element) => {
    const children = Array.from(parent.children)
    for (const el of children) {
      const tag = el.tagName.toLowerCase()

      if (tag === 'sp-step') {
        const also = el.getAttribute('also')
        if (also !== null) {
          el.setAttribute('from', String(lastFrom))
          el.removeAttribute('also')
        } else {
          const from = parseInt(el.getAttribute('from') || '0', 10)
          lastFrom = from
        }
      }

      walk(el)
    }
  }
  walk(tmp)
}

function processSpStepElements(tmp: Element) {
  tmp.querySelectorAll('sp-step').forEach(step => {
    const from = step.getAttribute('from')
    const to = step.getAttribute('to')
    const until = step.getAttribute('until')
    const only = step.getAttribute('only')
    const hide = step.getAttribute('hide')
    const animation = step.getAttribute('animation')

    function applyAttrs(el: Element) {
      if (from !== null) el.setAttribute('data-sp-step-from', from)
      if (to !== null) el.setAttribute('data-sp-step-to', to)
      if (until !== null) {
        const untilVal = parseInt(until, 10)
        if (!isNaN(untilVal)) el.setAttribute('data-sp-step-to', String(untilVal - 1))
      }
      if (only !== null) {
        el.setAttribute('data-sp-step-from', only)
        el.setAttribute('data-sp-step-to', only)
      }
      if (hide !== null) el.setAttribute('data-sp-step-hide', '')
      if (animation) el.setAttribute('data-sp-step-animation', animation)
    }

    const childEls = Array.from(step.children)
    if (childEls.length > 0) {
      childEls.forEach(applyAttrs)
      step.replaceWith(...Array.from(step.childNodes))
    } else {
      const span = document.createElement('span')
      applyAttrs(span)
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
        else virtualVisStep = value - 1
        el.setAttribute('at', String(virtualVisStep))
        try {
          virtualVisStep += countAnimSpecParts(el.getAttribute('spec') || '', root)
        } catch (e) {
          console.error('(Caught) Error counting anim spec parts:', e)
          addGlobalErrorMessage(`Error counting anim spec parts for <sp-anim> at step ${visStep}: ${e}`)
        }
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

      if (tag === 'sp-steps' || (!noTag && el.hasAttribute('sp-steps'))) {
        const at = el.getAttribute('at') ?? '+1'
        const doJump = [null, 'false'].includes(el.getAttribute('no-jump'))
        const every = parseInt(el.getAttribute('every') || '1', 10)
        const animation = el.getAttribute('animation') || ''

        let startStep = visStep
        const pr = parseJumpAt(at)
        if (pr.relative) startStep += pr.value
        else startStep = pr.value

        const children = Array.from(el.children)
        const childCount = Math.ceil(children.length / every)

        children.forEach((child, i) => {
          child.setAttribute('data-sp-step', String(startStep + Math.floor(i / every)))
          if (animation) child.setAttribute('data-sp-step-animation', animation)
        })

        const lastStep = startStep + childCount - 1
        if (doJump) {
          visStep = lastStep
          contributeMaxStep(visStep)
        } else {
          contributeMaxStep(lastStep)
        }

        if (tag === 'sp-steps') {
          const wrapper = document.createElement('div')
          wrapper.classList.add('sp-steps-no-tag')
          for (const attr of Array.from(el.attributes)) {
            if (!['at', 'every', 'animation', 'no-jump'].includes(attr.name)) {
              wrapper.setAttribute(attr.name, attr.value)
            }
          }
          while (el.firstChild) wrapper.appendChild(el.firstChild)
          el.replaceWith(wrapper)
        } else {
          el.removeAttribute('sp-steps')
          el.removeAttribute('at')
          el.removeAttribute('every')
          el.removeAttribute('animation')
          el.removeAttribute('no-jump')
        }

        noTag = true
        noRecursion = true
        continue
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
  processAlsoModifier(tmp)
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

export function maybeProcessed(v: SlideData | null | undefined) {
  if (v === null || v === undefined) return null
  return processSlideHtml(v.html)
}
