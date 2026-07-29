<template>
  <span ref="rootEl" style="display:none"></span>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, ref, nextTick, type Ref } from 'vue'
import type { AnimHandle } from '../types'

const rootEl = ref<HTMLElement | null>(null)
const globalStepIndex = inject<Ref<number>>('stepIndex', { value: 0 } as any)
const contentVersion = inject<Ref<number>>('contentVersion', { value: 0 } as any)
const animInstances = inject<Set<AnimHandle>>('animInstances', new Set())

let previousStep = -1

function getContainer(): HTMLElement {
  return rootEl.value?.closest('.sp-slide') as HTMLElement || rootEl.value?.parentElement as HTMLElement
}

function getTargetStep(): number {
  const container = getContainer()
  if (!container) return globalStepIndex.value
  const dfs = container.querySelector('[data-fixed-step]')?.getAttribute('data-fixed-step')
  if (dfs !== null && dfs !== undefined) return parseInt(dfs)
  return globalStepIndex.value
}

function computeVisible(el: Element, step: number): boolean {
  const stepAttr = el.getAttribute('data-sp-step')
  const fromAttr = el.getAttribute('data-sp-step-from')
  const toAttr = el.getAttribute('data-sp-step-to')

  if (fromAttr !== null) {
    const from = parseInt(fromAttr, 10)
    if (step < from) return false
    if (toAttr !== null) return step <= parseInt(toAttr, 10)
    return true
  }

  if (stepAttr !== null) return step >= parseInt(stepAttr, 10)
  return true
}

function applyStep(step: number) {
  const container = getContainer()
  if (!container) return
  const els = container.querySelectorAll('[data-sp-step], [data-sp-step-from], [data-sp-step-to], [data-sp-step-hide]')
  els.forEach(el => {
    if (el.closest('[data-sp-animated]') !== null) return
    const visible = computeVisible(el, step)
    el.classList.toggle('sp-anim-shown', visible)
    el.classList.toggle('sp-anim-hidden', !visible)
    if (el.hasAttribute('data-sp-step-hide')) {
      el.classList.toggle('sp-anim-only', true)
    }
    const preset = el.getAttribute('data-sp-step-animation')
    if (preset) {
      el.classList.toggle(`sp-anim-preset-${preset}`, true)
    }
  })
}

function applyStepWithAnims(step: number, fast: boolean) {
  const container = getContainer()
  if (!container) return
  applyStep(step)
  for (const anim of animInstances) {
    anim.syncToStep(step, fast)
  }
  if (fast) {
    for (const anim of container.getAnimations({ subtree: true })) {
      try {
        const timing = anim.effect?.getComputedTiming()
        let shouldFinish = timing && timing.iterations !== Infinity
        if (shouldFinish && anim.effect?.target?.closest('.sp-anim-protect') !== null) {
          shouldFinish = false
        }
        if (shouldFinish) {
          anim.finish()
        }
      } catch {}
    }
  }
  previousStep = step
}

onMounted(() => {
  nextTick(() => applyStepWithAnims(getTargetStep(), true))
})

watch(globalStepIndex, (curr) => {
  const target = getTargetStep()
  if (target === previousStep) return
  const fast = Math.abs(target - previousStep) > 1 || previousStep < 0
  applyStepWithAnims(target, fast)
})

watch(contentVersion, () => {
  previousStep = -1
  nextTick(() => applyStepWithAnims(getTargetStep(), true))
})
</script>
