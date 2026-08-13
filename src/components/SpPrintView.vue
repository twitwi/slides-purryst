<template>
  <div class="sp-print" ref="printRootEl">
    <div class="sp-print-helper-container">
      <div class="sp-print-helper">
        <p>To export as PDF:</p>
        <ul>
          <li><kbd>Ctrl</kbd> + <kbd>P</kbd> (open the print dialog)</li>
          <li>Select "Save as/to PDF" (or similar)</li>
          <li>Select "Margins" as "None"</li>
          <li><input type="checkbox" checked disabled > Check "Print backgrounds" </li>
          <li><input type="checkbox" disabled > Uncheck "Print headers and footers" </li>
          <li>Click "Save"</li>
        </ul>
        <p><label>Dismiss this dialog! (reload to get back)<input type="checkbox"/></label> </p>
      </div>
    </div>
    <template v-for="({ slide, slideI, html, step }, i) in slidesToShow" :key="i">
      <div class="sp-print-wrapper" :style="sized">
        <SpSlide
          :slide="slide"
          :style="sized"
          :html="html"
          :fixedStep="step"
          :components="components"
        />
        <div class="sp-overview-thumb-num">{{ slideI + 1 }}</div>
      </div>
    </template>
    <component is="style" v-html="injectStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref, onMounted } from 'vue'
import type { SlideData } from '../types'
import SpSlide from './SpSlide.vue'
import { maybeProcessed } from '../composables/useSteps'
import { SpStorageConfig } from '../composables/useStorage'

const props = withDefaults(defineProps<{
  steps: boolean
  components: Record<string, any>
  designWidth: number
  designHeight: number
  config: SpStorageConfig
  slides: SlideData[]
  currentIndex?: number
  stepIndex?: number
}>(), {
  currentIndex: 0,
  stepIndex: 0,
})

const processedHtml = computed(() => props.slides.map(s => maybeProcessed(s)!))
const sized = computed(() => ({ width: `${props.designWidth}px`, height: `${props.designHeight}px` }))
const injectStyle = computed(() => `
@page {
  size: ${props.designWidth}px ${props.designHeight}px;
}
`)
// Per-slide page counts in steps mode (each step is its own printable page).
const stepCounts = computed(() =>
  processedHtml.value.map(h => Math.max(1, Math.floor(h.steps)))
)
// First page index of each slide.
const pageStarts = computed(() => {
  const starts: number[] = []
  let n = 0
  for (const s of stepCounts.value) {
    starts.push(n)
    n += s
  }
  return starts
})
// Print page for the current navigation position (slide, step).
const targetPage = computed(() => {
  if (props.slides.length === 0) return 0
  const i = Math.min(Math.max(props.currentIndex, 0), props.slides.length - 1)
  if (!props.steps) return i
  const s = Math.min(Math.max(props.stepIndex, 0), stepCounts.value[i] - 1)
  return pageStarts.value[i] + s
})

const slidesToShow = computed(() => {
  if (props.steps) {
    return props.slides.flatMap((slide, slideI) => {
      const nSteps = stepCounts.value[slideI]
      return [...Array(nSteps).keys()].map((step) => ({
        step, slide, slideI,
        html: processedHtml.value[slideI].html,
      }))
    })
  } else {
    return props.slides.map((slide, slideI) => ({
      slide, slideI,
      html: processedHtml.value[slideI].html,
      step: processedHtml.value[slideI].steps - 1,
    }))
  }
})

const printRootEl = ref<HTMLElement | null>(null)
const mounted = ref(false)

function scrollToPage(page: number) {
  printRootEl.value
    ?.querySelectorAll<HTMLElement>('.sp-print-wrapper')
    .item(page)
    ?.scrollIntoView({ block: 'start' })
}

// Navigating (keyboard, hash, the shared goto prompt) changes
// currentIndex/stepIndex → scroll the corresponding print page into view.
watch(targetPage, (page, prev) => {
  if (!mounted.value || page === prev) return
  nextTick(() => scrollToPage(page))
})

onMounted(() => {
  mounted.value = true
})
</script>

<style>
body:has(.sp-print) {
  overflow: visible;
  .sp-print-wrapper {
    overflow: hidden;
    break-after: page;
  }
  .sp-print-helper-container {
    z-index: 900;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .sp-print-helper {
    border-radius: 1em;
    padding: 1em;
    border: 5px solid var(--sp-accent-dark);
    background: var(--sp-bg-2);
    box-shadow: var(--sp-shadow-lg);
    font-size: var(--sp-bem);
    ul {
      margin-left: 2em;
    }
    label input {
      display: none;
    }
    &:has(label :checked) {
      display: none;
    }
  }
}

@media print {
  .sp-print-helper-container {
    display: none !important;
  }
}
@media screen {
  body:has(.sp-print) {
    overflow-y: scroll;
    background: var(--sp-auto-black);
    .sp-slide {
      transform: scale(.9);
    }
  }
}
</style>