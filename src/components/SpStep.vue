<template>
  <slot />
</template>

<script setup lang="ts">
import { inject, onMounted, nextTick, type Ref, type VNode } from 'vue'
import { useSlots } from 'vue'

const props = withDefaults(defineProps<{
  at?: number | string
  from?: number | string
  to?: number | string
  type?: string
  animation?: string
}>(), { at: 0 })

const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

onMounted(() => {
  nextTick(() => {
    const nodes = slots.default?.() ?? []
    for (const node of nodes) {
      if (typeof node === 'object' && node.el && node.el.nodeType === 1) {
        const el = node.el as HTMLElement
        const atVal = typeof props.at === 'string' ? parseInt(props.at, 10) : props.at
        if (atVal) el.setAttribute('data-sp-step', String(atVal))
        if (props.from !== undefined) el.setAttribute('data-sp-step-from', String(props.from))
        if (props.to !== undefined) el.setAttribute('data-sp-step-to', String(props.to))
        if (props.type === 'only') el.setAttribute('data-sp-step-only', '')
        if (props.animation) el.setAttribute('data-sp-step-animation', props.animation)
        break
      }
    }
  })
})
</script>
