<template>
  <nav v-if="items.length" class="sp-toc">
    <slot :items="items" :current-index="currentIndex.value" :go-to="goTo">
      <ol>
        <li v-for="item in items" :key="item.slideIndex"
            :class="['sp-toc-h' + item.level, { 'sp-toc-active': item.slideIndex === currentIndex.value }]"
            @click="goTo(item.slideIndex)">
          <span class="sp-toc-text">{{ item.text }}</span>
        </li>
      </ol>
    </slot>
  </nav>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import type { SlideData } from '../types'
import { useSlideTree } from '../composables/useSlideTree'

const slides = inject<{ value: SlideData[] }>('slides')!
const currentIndex = inject<{ value: number }>('slideIndex')!
const goTo = inject<(n: number) => void>('goTo')!

const slidesRef = computed(() => slides.value)
const { tree } = useSlideTree(slidesRef)

const items = computed(() => tree.value)
</script>
