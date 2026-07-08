import { ref, type Ref } from 'vue'
import type { SlideData } from '../types'

function parseSpec(spec: string | null): number {
  return spec ? parseInt(spec, 10) : 1
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

  return Math.max(pauses, maxAt) + 1
}

export function processHtml(html: string, stepIndex: number): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

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