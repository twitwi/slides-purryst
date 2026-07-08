<template>
  <div class="sp-slide">
    <component :is="comp" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import type { SlideData } from '../types'

const props = defineProps<{
  slide: SlideData | null
  html: string
  components?: Record<string, Component>
}>()

const comp = shallowRef<Component | null>(null)

watch(() => props.html, (html) => {
  if (!html) {
    comp.value = null
    return
  }
  comp.value = defineComponent({
    template: `<div>${html}</div>`,
    components: props.components,
  })
}, { immediate: true })
</script>