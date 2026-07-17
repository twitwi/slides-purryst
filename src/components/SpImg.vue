<template>
  <img v-if="resolvedSrc" :src="resolvedSrc" :alt="alt" :class="$attrs.class as string" :style="$attrs.style as any" />
  <span v-else class="sp-img-loading">…</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getCachedInclude, preloadInclude, getCachedBinary, preloadBinary } from '../composables/includeCache'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
}>(), {
  alt: '',
})

const resolvedSrc = ref('')

async function resolve() {
  const src = props.src
  if (!src) { resolvedSrc.value = ''; return }
  if (src.startsWith('data:') || src.startsWith('blob:')) { resolvedSrc.value = src; return }

  if (src.match(/\.svg(\?|#|$)/i)) {
    const cached = getCachedInclude(src)
    if (cached) { resolvedSrc.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cached)}`; return }
    try {
      await preloadInclude(src)
      const text = getCachedInclude(src)
      if (text) { resolvedSrc.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`; return }
    } catch {}
    resolvedSrc.value = src
    return
  }

  const cached = getCachedBinary(src)
  if (cached) { resolvedSrc.value = cached; return }
  try {
    await preloadBinary(src)
    const dataUrl = getCachedBinary(src)
    if (dataUrl) { resolvedSrc.value = dataUrl; return }
  } catch {}
  resolvedSrc.value = src
}

watch(() => props.src, resolve, { immediate: true })
</script>

<style scoped>
.sp-img-loading {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: middle;
  text-align: center;
  color: var(--sp-text-3);
  font-size: 0.8em;
}
</style>
