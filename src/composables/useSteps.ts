import { ref, computed, type Ref } from 'vue'
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

  let maxAlt = 0
  const alts = tmp.querySelectorAll('sp-alternatives')
  alts.forEach(a => {
    const at = parseInt(a.getAttribute('at') || '0', 10)
    const needed = at + a.children.length
    if (needed > maxAlt) maxAlt = needed
  })

  return Math.max(pauses + animSteps + 1, maxAt + 1, maxVisStep + 1, maxAlt)
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
        // Keep sp-step — SpStep.vue handles visibility via CSS classes
        walk(el)
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
