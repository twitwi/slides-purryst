<template>
  <span ref="ghostEl" style="display:none"></span>
  <template v-for="(child, i) in children" :key="i">
    <component :is="child" :class="i === activeIndex ? 'sp-anim-shown' : 'sp-anim-hidden sp-hidden-is-empty'" />
  </template>
</template>

<script setup lang="ts">
import { inject, computed, ref, useSlots, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  at?: number | string
  cycle?: boolean
}>(), {
  at: 0,
  cycle: false
})

const ghostEl = ref<HTMLElement | null>(null)
const globalStepIndex = inject<{ value: number }>('stepIndex') ?? { value: 0 }
const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

function getTargetStep(): number {
  const dfs = ghostEl.value?.closest('.sp-slide')?.querySelector('[data-fixed-step]')?.getAttribute('data-fixed-step')
  if (dfs !== null && dfs !== undefined) return parseInt(dfs)
  return globalStepIndex.value
}

const children = computed(() => {
  const defaultSlot = slots.default?.() ?? []
  return defaultSlot.filter((v: VNode) => typeof v.type == 'string')
})

const activeIndex = computed(() => {
  if (children.value.length === 0) return -1
  const step = getTargetStep()
  const offset = step - (typeof props.at === 'string' ? parseInt(props.at, 10) : props.at)
  if (offset < 0) return -1
  if (!props.cycle && offset >= children.value.length) return children.value.length - 1
  return offset % children.value.length
})
</script>
