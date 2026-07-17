<template>
  <div :class="rootClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import type { Ref } from 'vue'

const props = withDefaults(defineProps<{
  at?: number | string
  from?: number | string
  to?: number | string
  type?: string
  animation?: string
}>(), { at: 0 })

const stepIndex = inject<Ref<number>>('stepIndex', { value: 0 } as any)

const currentAt = computed(() => {
  return typeof props.at === 'string' ? parseInt(props.at, 10) : props.at
})

const visible = computed(() => {
  const step = stepIndex.value
  
  // Handle range (from/to)
  if (props.from !== undefined) {
    const from = typeof props.from === 'string' ? parseInt(props.from, 10) : props.from
    const to = props.to !== undefined 
      ? (typeof props.to === 'string' ? parseInt(props.to, 10) : props.to)
      : Infinity
    return step >= from && step < to
  }
  
  // Handle type="only" - visible only at exact step
  if (props.type === 'only') return step === currentAt.value
  
  // Default: visible from step onward
  return step >= currentAt.value
})

const rootClass = computed(() => ({
  'sp-anim-shown': visible.value,
  'sp-anim-hidden': !visible.value,
  'sp-anim-only': props.type === 'only',
  [`sp-anim-preset-${props.animation}`]: props.animation,
}))
</script>
