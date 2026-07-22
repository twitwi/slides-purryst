<template>
  <div class="sp-overview" @click.self="$emit('close')">
    <div class="sp-overview-grid">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="sp-overview-thumb"
        :class="{
          active: i === currentIndex,
          'sp-overview-h1': slideHeadingLevels[i] === 1,
          'sp-overview-h2': slideHeadingLevels[i] === 2,
          'sp-overview-h3': slideHeadingLevels[i] === 3,
        }"
        :style="overviewThumbStyle"
        @click="$emit('select', i)"
      >
        <div class="sp-overview-thumb-stage">
          <div :style="overviewSlideStyle">
            <SpSlide
              :slide="slide"
              :html="overviewHtmls[i]"
              :fixedStep="processSlideHtml(slide.html).steps - 1"
              :components="components"
            />
          </div>
        </div>
        <div class="sp-overview-thumb-num">{{ i + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SlideData } from '../types'
import SpSlide from './SpSlide.vue'
import { processSlideHtml } from '../composables/useSteps'

defineProps<{
  slides: SlideData[]
  currentIndex: number
  slideHeadingLevels: number[]
  overviewHtmls: string[]
  overviewThumbStyle: Record<string, string>
  overviewSlideStyle: Record<string, string>
  components: Record<string, any>
}>()

defineEmits<{
  close: []
  select: [index: number]
}>()
</script>
