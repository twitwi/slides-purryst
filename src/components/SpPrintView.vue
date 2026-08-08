<template>
  <div class="sp-print">
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
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="sp-print-wrapper"
      :style="sized"
    >
      <SpSlide
        :slide="slide"
        :style="sized"
        :html="processedHtml[i].html"
        :fixedStep="processedHtml[i].steps - 1"
        :components="components"
      />
      <div class="sp-overview-thumb-num">{{ i + 1 }}</div>
    </div>
    <component is="style" v-html="injectStyle" />
  </div>
</template>

<script setup lang="ts">
import type { SlideData } from '../types'
import SpSlide from './SpSlide.vue'
import { maybeProcessed } from '../composables/useSteps'
import { SpStorageConfig } from '../composables/useStorage';
import { computed } from 'vue';

const props = defineProps<{
  steps: boolean
  components: Record<string, any>
  designWidth: number
  designHeight: number
  config: SpStorageConfig
  slides: SlideData[]
}>()

const processedHtml = computed(() => props.slides.map(s => maybeProcessed(s)!))
const sized = computed(() => ({ width: `${props.designWidth}px`, height: `${props.designHeight}px` }))
const injectStyle = computed(() => `
@page {
  size: ${props.designWidth}px ${props.designHeight}px;
}
`)

</script>

<style>
body:has(.sp-print) {
  overflow: visible;
  .sp-print-wrapper {
    overflow: hidden;
    break-after: page;
  }
  .sp-print-helper-container {
    z-index: 100000;
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