<script setup lang="ts">
import { computed } from 'vue'
import SpInclude from './SpInclude.vue'
import * as svgTransformers from '../transformers/svg'
import type { Transformer } from '../types'

const props = withDefaults(defineProps<{
  src: string
  path?: string
  wrap?: boolean
  width?: string | number
  height?: string | number
}>(), {
  path: 'svg',
  wrap: false,
})

const transformers = computed<Transformer[]>(() => {
  const list = [...svgTransformers.defaultTransformers]
  if (props.width != null) {
    list.push((root) => {
      const svg = root.querySelector('svg')
      if (svg) svg.setAttribute('width', String(props.width))
    })
  }
  if (props.height != null) {
    list.push((root) => {
      const svg = root.querySelector('svg')
      if (svg) svg.setAttribute('height', String(props.height))
    })
  }
  return list
})
</script>

<template>
  <div v-if="wrap" v-bind="$attrs" class="sp-svg-wrap">
    <SpInclude :src="src" :path="path" :transformers="transformers" no-fix-void no-component />
  </div>
  <SpInclude v-else v-bind="$attrs" :src="src" :path="path" :transformers="transformers" no-fix-void no-component />
</template>

<style scoped>
.sp-svg-wrap { display: block; }
.sp-svg-wrap svg,
.sp-svg-wrap ::v-deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
