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
    const h1s = all.filter(item => item.level === 1)
    if (h1s.length) {
      const cur = currentIndex.value
      const active = h1s.slice().reverse().find(h => h.slideIndex <= cur)

      let sectionStart = 0
      let sectionEnd = Infinity
      if (active) {
        sectionStart = active.slideIndex
        const idx = h1s.indexOf(active)
        if (idx + 1 < h1s.length) {
          sectionEnd = h1s[idx + 1].slideIndex
        }
      }

      filtered = filtered.filter(
        item => item.slideIndex >= sectionStart && item.slideIndex < sectionEnd
      )
    }
  }

  return filtered
})
</script>
