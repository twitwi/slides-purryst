<template>
  <div class="sp-slide">
    <component :is="comp" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import type { SlideData } from '../types'

const props = defineProps<{
  slide: SlideData | null
  html: string
  components?: Record<string, Component>
  fixedStep?: number
}>()

const comp = shallowRef<Component | null>(null)

watch(() => [props.html, props.fixedStep], ([html, fixedStep]) => {
  if (!html) {
    comp.value = null
    return
  }
  const fixed = fixedStep === undefined ? '' : ` data-fixed-step="${fixedStep}"`
  // maybe consider processing html here, base on slide step number
  comp.value = defineComponent({
    template: `<div${fixed}>${html}</div>`,
    components: props.components,
  })
}, { immediate: true })
</script>