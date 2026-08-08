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
              :html="processedHtml[i].html"
              :fixedStep="processedHtml[i].steps - 1"
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
import { maybeProcessed } from '../composables/useSteps'
import { computed } from 'vue';

const props = defineProps<{
  slides: SlideData[]
  currentIndex: number
  slideHeadingLevels: number[]
  overviewThumbStyle: Record<string, string>
  overviewSlideStyle: Record<string, string>
  components: Record<string, any>
}>()

const processedHtml = computed(() => props.slides.map(s => maybeProcessed(s)!))

defineEmits<{
  close: []
  select: [index: number]
}>()
</script>
