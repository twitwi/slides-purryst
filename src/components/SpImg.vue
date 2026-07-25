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
    const ref = getCachedInclude(src)
    if (ref.value) { resolvedSrc.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ref.value)}`; return }
    try {
      await preloadInclude(src)
      if (ref.value) { resolvedSrc.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ref.value)}`; return }
    } catch {}
    resolvedSrc.value = src
    return
  }

  const ref = getCachedBinary(src)
  if (ref.value) { resolvedSrc.value = ref.value; return }
  try {
    await preloadBinary(src)
    if (ref.value) { resolvedSrc.value = ref.value; return }
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
