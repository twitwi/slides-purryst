<template>
  <nav v-if="items.length" class="sp-toc">
    <slot :items="items" :current-index="currentIndex.value" :go-to="goTo"
          :active-section="activeSection">
      <div v-if="props.context && activeSection" class="sp-toc-section">{{ activeSection.text }}</div>
      <ol>
        <li v-for="item in items" :key="item.slideIndex"
            :class="['sp-toc-h' + item.level, { 'sp-toc-active': item.slideIndex === activeIdx }]"
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
  highlight?: number
  context?: boolean
}>(), {
  start: 2,
  end: 999,
  highlight: 0,
  context: false,
})

const slides = inject<{ value: SlideData[] }>('slides')!
const currentIndex = inject<{ value: number }>('slideIndex')!
const goTo = inject<(n: number) => void>('goTo')!

const slidesRef = computed(() => slides.value)
const { tree } = useSlideTree(slidesRef)

const activeIdx = computed(() => currentIndex.value + props.highlight)

const items = computed(() => {
  const all = tree.value

  let filtered = all.filter(item => item.level >= props.start && item.level <= props.end)

  if (props.start > 1) {
    const parentLevel = props.start - 1
    const cur = activeIdx.value

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

const activeSection = computed(() => {
  if (props.start <= 1) return null
  const all = tree.value
  const parentLevel = props.start - 1
  const cur = activeIdx.value
  const parent = all.slice().reverse().find(
    item => item.level === parentLevel && item.slideIndex <= cur
  )
  return parent ?? null
})
</script>
