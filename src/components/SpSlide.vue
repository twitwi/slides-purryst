<template>
  <div :class="slideClass">
    <component :is="comp" />
  </div>
</template>

<script setup lang="ts">
//
// This component renders a slide, it is NOT handling the sp-slide from the source sp-content
//
import { computed, defineComponent, provide, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import type { SlideData } from '../types'
import SpStepManager from './SpStepManager.vue'

const props = defineProps<{
  slide: SlideData | null
  html: string
  components?: Record<string, Component>
  fixedStep?: number
}>()

const slideClass = computed(() => {
  const cls = ['sp-slide']
  if (props.slide) cls.push(`sp-slide-${props.slide.num}`)
  if (props.slide?.class) cls.push(props.slide.class)
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
  const merged = { 'sp-step-manager': SpStepManager, ...props.components }
  comp.value = defineComponent({
    template: `<div${fixed}>${html}<sp-step-manager /></div>`,
    components: merged,
  })
}, { immediate: true })
</script>