<template>
  <span ref="rootEl" style="display:none"></span>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, ref, nextTick, type Ref } from 'vue'

const rootEl = ref<HTMLElement | null>(null)
const globalStepIndex = inject<Ref<number>>('stepIndex', { value: 0 } as any)
const contentVersion = inject<Ref<number>>('contentVersion', { value: 0 } as any)

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
  const onlyAttr = el.hasAttribute('data-sp-step-only')

  if (fromAttr !== null) {
    const from = parseInt(fromAttr, 10)
    const to = toAttr !== null ? parseInt(toAttr, 10) : Infinity
    return step >= from && step < to
  }

  if (onlyAttr) {
    return step === parseInt(stepAttr || '0', 10)
  }

  if (stepAttr !== null) {
    return step >= parseInt(stepAttr, 10)
  }

  return true
}

function applyStep(step: number) {
  const container = getContainer()
  if (!container) return
  const els = container.querySelectorAll('[data-sp-step], [data-sp-step-from], [data-sp-step-to], [data-sp-step-only]')
  els.forEach(el => {
    if (el.closest('[data-sp-animated]') !== null) return
    const visible = computeVisible(el, step)
    el.classList.toggle('sp-anim-shown', visible)
    el.classList.toggle('sp-anim-hidden', !visible)
    const onlyAttr = el.hasAttribute('data-sp-step-only')
    if (onlyAttr) el.classList.toggle('sp-anim-only', true)
    const preset = el.getAttribute('data-sp-step-animation')
    if (preset) {
      el.classList.toggle(`sp-anim-preset-${preset}`, true)
    }
  })
}

onMounted(() => {
  nextTick(() => applyStep(getTargetStep()))
})

watch(globalStepIndex, () => {
  applyStep(getTargetStep())
})

watch(contentVersion, () => {
  nextTick(() => applyStep(getTargetStep()))
})
</script>
