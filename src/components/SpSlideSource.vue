<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { highlightCode } from '../composables/useCodeHighlight'

const props = withDefaults(defineProps<{
  for?: number
}>(), {
  for: undefined,
})

const rawSlideHtmls = inject<Ref<string[]>>('rawSlideHtmls')!
const slideIndex = inject<Ref<number>>('slideIndex')!

const forSlide = computed(() => props.for !== undefined ? props.for : slideIndex.value)
const highlightedHtml = ref('')
let highlightId = 0

watch(forSlide, async (idx) => {
  const raw = rawSlideHtmls.value[idx]
  if (!raw) { highlightedHtml.value = ''; return }
  const id = ++highlightId
  const code = `<pre><code class="language-html">${
    raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }</code></pre>`
  try {
    const result = await highlightCode(code)
    if (id === highlightId) highlightedHtml.value = result
  } catch {
    if (id === highlightId) highlightedHtml.value = code
  }
}, { immediate: true })
</script>

<template>
  <div class="sp-slide-source" v-if="highlightedHtml">
    <div class="sp-slide-source-header">Slide {{ forSlide + 1 }} source</div>
    <div class="sp-slide-source-body" v-html="highlightedHtml"></div>
  </div>
</template>

<style scoped>
.sp-slide-source {
  margin: 1em 0;
  border: 1px solid var(--sp-border, #ddd);
  border-radius: 6px;
  overflow: hidden;
}
.sp-slide-source-header {
  padding: 0.4em 0.8em;
  font-size: 0.8em;
  background: var(--sp-bg-2, #f5f5f5);
  border-bottom: 1px solid var(--sp-border, #ddd);
  color: var(--sp-text-2, #666);
  font-family: var(--sp-font-mono, monospace);
}
.sp-slide-source-body {
  overflow: auto;
  max-height: 60vh;
}
.sp-slide-source-body :deep(pre) {
  margin: 0;
  padding: 0.8em;
  font-size: 0.75em;
  line-height: 1.5;
  tab-size: 2;
}
</style>
