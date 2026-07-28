<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { highlightCode } from '../composables/useCodeHighlight'

const props = withDefaults(defineProps<{
  for?: number
  transform?: ((html: string) => string) | null
}>(), {
  for: undefined,
  transform: null,
})

const rawSlideSources = inject<Ref<string[]>>('rawSlideSources')!
const slideIndex = inject<Ref<number>>('slideIndex')!
const forSlide = computed(() => props.for !== undefined ? props.for : slideIndex.value)
const highlightedHtml = ref('')
let highlightId = 0

watch([forSlide, () => props.transform, rawSlideSources], async ([idx]) => {
  const raw = rawSlideSources.value[idx]
  if (!raw) { highlightedHtml.value = ''; return }
  const id = ++highlightId
  const transformed = props.transform ? props.transform(raw) : raw
  const code = `<pre><code class="language-html">${
    transformed
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
    <div class="sp-slide-source-header">
      <slot name="header" :forSlide="forSlide">
        Slide {{ forSlide + 1 }} source
      </slot>
    </div>
    <div class="sp-slide-source-body" v-html="highlightedHtml"></div>
  </div>
</template>

<style scoped>
.sp-slide-source {
  display: flex;
  flex-direction: column;
  margin: 1em 0;
  border: 1px solid var(--sp-border, #ddd);
  border-radius: 6px;
}
.sp-slide-source-header {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.4em 0.8em;
  font-size: 0.8em;
  background: var(--sp-bg-2, #f5f5f5);
  border-bottom: 1px solid var(--sp-border, #ddd);
  color: var(--sp-text-2, #666);
  font-family: var(--sp-font-mono, monospace);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
}
.sp-slide-source-body {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.sp-slide-source-body :deep(pre) {
  margin: 0;
  padding: 0.8em;
  font-size: 0.95em;
  line-height: 1.5;
  tab-size: 2;
}
</style>
