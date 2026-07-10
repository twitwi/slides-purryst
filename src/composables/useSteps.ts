import { ref, type Ref } from 'vue'
import type { SlideData } from '../types'

function parseSpec(spec: string | null): number {
  return spec ? parseInt(spec, 10) : 1
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

function computeAnimVisStepChange(spec: string): number {
  const parts = spec.split('|').map(s => s.trim())
  let total = 0
  for (const part of parts) {
    const jumpMatch = part.match(/^@jump\((-?\d+)\)/)
    if (jumpMatch) {
      total += parseInt(jumpMatch[1], 10)
    }
  }
  return total
}

function computeMaxVisStep(html: string): number {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  let visStep = 0
  let maxVis = 0

  function walk(parent: Element) {
    const children = Array.from(parent.children)
    for (const el of children) {
      const tag = el.tagName.toLowerCase()

      if (tag === 'sp-pause') {
        visStep += 1
        if (visStep > maxVis) maxVis = visStep
        continue
      }

      if (tag === 'sp-step' || tag === 'sp-style') continue

      if (tag === 'sp-anim') {
        const spec = el.getAttribute('spec') || ''
        visStep += computeAnimVisStepChange(spec)
        if (visStep > maxVis) maxVis = visStep
        continue
      }

      walk(el)
    }
  }

  walk(tmp)
  return maxVis
}

export function buildSteps(slide: SlideData | null) {
  if (!slide) return 0
  const html = slide.html
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  const pauses = tmp.querySelectorAll('sp-pause').length
  const steps = tmp.querySelectorAll('sp-step')
  let maxAt = 0
  steps.forEach((s) => {
    const at = parseSpec(s.getAttribute('at'))
    if (at > maxAt) maxAt = at
  })

  let animSteps = 0
  const anims = tmp.querySelectorAll('sp-anim')
  anims.forEach(a => {
    const spec = a.getAttribute('spec') || ''
    animSteps += countAnimSpecParts(spec, html)
  })

  const maxVisStep = computeMaxVisStep(html)

  return Math.max(pauses + animSteps + 1, maxAt + 1, maxVisStep + 1)
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

      if (tag === 'sp-pause') {
        visStep += 1
        toRemove.push(el)
        continue
      }

      if (tag === 'sp-step') {
        toRemove.push(el)
        continue
      }

      if (tag === 'sp-anim') {
        const spec = el.getAttribute('spec') || ''
        visStep += computeAnimVisStepChange(spec)
        continue
      }

      if (tag === 'sp-style') continue

      if (visStep > 0) {
        el.setAttribute('data-sp-from', String(visStep))
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

export function processHtml(html: string, stepIndex: number): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  // Legacy: handle sp-step visibility
  tmp.querySelectorAll('sp-step').forEach((el) => {
    const at = parseSpec(el.getAttribute('at'))
    const type = el.getAttribute('type')
    let visible = false
    if (type === 'only') {
      visible = stepIndex === at
    } else {
      visible = stepIndex >= at
    }
    if (!visible) {
      el.remove()
    } else {
      el.replaceWith(...el.childNodes)
    }
  })

  // Anim mode: full DOM, no pause splitting
  if (tmp.querySelector('sp-anim')) {
    return stripAnimHtml(html)
  }

  // Legacy pause splitting
  const pauses = tmp.querySelectorAll('sp-pause')
  if (pauses.length > 0) {
    pauses.forEach((el) => {
      el.replaceWith(document.createComment('sp-pause'))
    })
    const parts = tmp.innerHTML.split(/<!--\s*sp-pause\s*-->/)
    return parts.slice(0, stepIndex + 1).join('')
  }

  return tmp.innerHTML
}

export function useSteps() {
  const stepIndex: Ref<number> = ref(0)
  const totalSteps: Ref<number> = ref(1)
  const isFirstStep = ref(true)
  const isLastStep = ref(false)

  function build(slide: SlideData | null) {
    const t = buildSteps(slide)
    totalSteps.value = t
    isLastStep.value = t <= 1 || stepIndex.value >= t - 1
  }

  function nextStep() {
    if (stepIndex.value < totalSteps.value - 1) {
      stepIndex.value++
      updateFlags()
    }
  }

  function prevStep() {
    if (stepIndex.value > 0) {
      stepIndex.value--
      updateFlags()
    }
  }

  function updateFlags() {
    isFirstStep.value = stepIndex.value === 0
    isLastStep.value = totalSteps.value <= 1 || stepIndex.value >= totalSteps.value - 1
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
