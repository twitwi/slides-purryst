<template>
  <div sp-clicks-wrapper>
    <component
      v-for="(child, index) in children"
      :key="index"
      :is="child"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, useSlots, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  at?: number | string
  every?: number | string
  animation?: string
}>(), {
  at: '0',
  every: '1',
  animation: '',
})

const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

const children = computed(() => {
  const defaultSlot = slots.default?.() ?? []
  return defaultSlot.filter((v: VNode) => v.type !== Comment)
})

const baseAt = computed(() => parseInt(String(props.at), 10))
const every = computed(() => parseInt(String(props.every), 10))

onMounted(() => {
  nextTick(() => {
    const nodes = slots.default?.() ?? []
    const els = nodes
      .filter((v: VNode) => v.type !== Comment)
      .map((v: VNode) => v.el)
      .filter((el: any) => el && el.nodeType === 1) as HTMLElement[]

    els.forEach((el, i) => {
      const stepAt = baseAt.value + Math.floor(i / every.value)
      el.setAttribute('data-sp-step', String(stepAt))
      if (props.animation) el.setAttribute('data-sp-step-animation', props.animation)
    })
  })
})
</script>
