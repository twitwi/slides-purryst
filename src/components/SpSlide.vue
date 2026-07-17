<template>
  <div :class="slideClass">
    <component :is="comp" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, provide, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import type { SlideData } from '../types'

const props = defineProps<{
  slide: SlideData | null
  html: string
  components?: Record<string, Component>
  fixedStep?: number
}>()

const slideClass = computed(() => {
  const cls = ['sp-slide']
  if (props.slide) cls.push(`sp-slide-${props.slide.num}`)
  return cls
})

provide('slideNum', computed(() => props.slide?.num))

const comp = shallowRef<Component | null>(null)

watch(() => [props.html, props.fixedStep], ([html, fixedStep]) => {
  if (!html) {
    comp.value = null
    return
  }
  const fixed = fixedStep === undefined ? '' : ` data-fixed-step="${fixedStep}"`
  comp.value = defineComponent({
    template: `<div${fixed}>${html}</div>`,
    components: props.components,
  })
}, { immediate: true })
</script>