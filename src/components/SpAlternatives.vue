<template>
  <template v-for="(child, i) in children" :key="i">
    <component :is="child" v-if="i === activeIndex" />
  </template>
</template>

<script setup lang="ts">
import { inject, computed, useSlots, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  at?: number
}>(), {
  at: 0,
})

const stepIndex = inject<{ value: number }>('stepIndex') ?? { value: 0 }
const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

const children = computed(() => {
  const defaultSlot = slots.default?.() ?? []
  return defaultSlot.filter((v: VNode) => v.type !== Comment)
})

const activeIndex = computed(() => {
  if (children.value.length === 0) return -1
  const offset = stepIndex.value - props.at
  if (offset < 0) return -1
  return offset % children.value.length
})
</script>