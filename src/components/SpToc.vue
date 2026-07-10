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

const props = withDefaults(defineProps<{
  start?: number
  end?: number
}>(), {
  start: 2,
  end: 999,
})

const slides = inject<{ value: SlideData[] }>('slides')!
const currentIndex = inject<{ value: number }>('slideIndex')!
const goTo = inject<(n: number) => void>('goTo')!

const slidesRef = computed(() => slides.value)
const { tree } = useSlideTree(slidesRef)

const items = computed(() => {
  const all = tree.value

  let filtered = all.filter(item => item.level >= props.start && item.level <= props.end)

  if (props.start > 1) {
    const parentLevel = props.start - 1
    const cur = currentIndex.value

    const parent = all.slice().reverse().find(
      item => item.level === parentLevel && item.slideIndex <= cur
    )

    if (!parent) {
      console.warn(
        `[sp-toc] no h${parentLevel} before slide ${cur + 1}, showing all`
      )
    } else {
      const boundaries = all.filter(item => item.level < props.start)
      const idx = boundaries.indexOf(parent)
      const sectionStart = parent.slideIndex
      const sectionEnd = idx + 1 < boundaries.length
        ? boundaries[idx + 1].slideIndex
        : Infinity

      filtered = filtered.filter(
        item => item.slideIndex >= sectionStart && item.slideIndex < sectionEnd
      )
    }
  }

  return filtered
})
</script>
