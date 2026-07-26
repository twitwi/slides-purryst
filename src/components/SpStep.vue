<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, nextTick, type VNode } from 'vue'
import { useSlots } from 'vue'

const props = defineProps<{
  from?: number | string
  to?: number | string
  until?: number | string
  only?: number | string
  hide?: boolean
  animation?: string
}>()

const slots = useSlots() as { default?: (...args: any[]) => VNode[] }

onMounted(() => {
  nextTick(() => {
    const nodes = slots.default?.() ?? []
    for (const node of nodes) {
      if (typeof node === 'object' && node.el && node.el.nodeType === 1) {
        const el = node.el as HTMLElement
        if (props.from !== undefined) el.setAttribute('data-sp-step-from', String(props.from))
        if (props.to !== undefined) el.setAttribute('data-sp-step-to', String(props.to))
        if (props.until !== undefined) {
          const untilVal = typeof props.until === 'string' ? parseInt(props.until, 10) : props.until
          el.setAttribute('data-sp-step-to', String(untilVal - 1))
        }
        if (props.only !== undefined) {
          const onlyVal = typeof props.only === 'string' ? parseInt(props.only, 10) : props.only
          el.setAttribute('data-sp-step-from', String(onlyVal))
          el.setAttribute('data-sp-step-to', String(onlyVal))
        }
        if (props.hide) el.setAttribute('data-sp-step-hide', '')
        if (props.animation) el.setAttribute('data-sp-step-animation', props.animation)
        break
      }
    }
  })
})
</script>
