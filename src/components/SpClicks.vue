<template>
  <div sp-clicks-wrapper>
    <component
      v-for="(child, index) in children"
      :key="index"
      :is="wrapChild(child, index)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots, type VNode, h, defineComponent } from 'vue'

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

function wrapChild(child: VNode, index: number) {
  const stepAt = baseAt.value + Math.floor(index / every.value)
  return h(
    defineComponent({
      render() {
        const stepProps: Record<string, any> = {
          at: stepAt,
        }
        if (props.animation) {
          stepProps.animation = props.animation
        }
        return h('sp-step', stepProps, [child])
      }
    })
  )
}
</script>
