<template>
  <template v-for="(child, i) in children" :key="i">
    <component :is="child" v-if="i === activeIndex" />
  </template>
</template>

<script setup lang="ts">
import { inject, computed, useSlots, type VNode } from 'vue'

const stepIndex = inject<{ value: number }>('stepIndex') ?? { value: 0 }
const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

const children = computed(() => {
  const defaultSlot = slots.default?.() ?? []
  return defaultSlot.filter((v: VNode) => v.type !== Comment)
})

const activeIndex = computed(() => {
  if (children.value.length === 0) return -1
  return stepIndex.value % children.value.length
})
</script>