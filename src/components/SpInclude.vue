<script setup lang="ts">
import { ref, onMounted, inject, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Transformer } from '../types'
import { getCachedInclude, preloadInclude } from '../composables/includeCache'

const contentVersion = inject<Ref<number>>('contentVersion')!

const props = withDefaults(defineProps<{
  src: string
  path?: string
  transformers?: Transformer[]
}>(), {
  path: '',
  transformers: () => [],
})

const raw = ref('')
const error = ref('')

function processContent(text: string): string {
  const d = document.createElement('div')
  d.innerHTML = text
  if (props.path) {
    const el = d.querySelector(props.path)
    if (!el) return ''
    d.innerHTML = ''
    d.appendChild(el.cloneNode(true))
  }
  for (const fn of props.transformers) {
    fn(d)
  }
  return d.innerHTML
}

function notifyContentLoaded() {
  nextTick(() => {
    contentVersion.value++
  })
}

async function load() {
  error.value = ''
  raw.value = ''

  const cached = getCachedInclude(props.src)
  if (cached !== undefined) {
    if (cached) {
      raw.value = processContent(cached)
      notifyContentLoaded()
    }
    return
  }

  try {
    await preloadInclude(props.src)
    const text = getCachedInclude(props.src)
    if (text) {
      raw.value = processContent(text)
      notifyContentLoaded()
    } else {
      throw new Error('Failed to load')
    }
  } catch (err: any) {
    error.value = `${err.message} (src: ${props.src})`
  }
}

onMounted(load)
</script>

<template>
  <span style="display: none" :data-source-file-push="src"></span>
  <div v-if="error" class="sp-include-error">{{ error }}</div>
  <div v-else v-html="raw" class="sp-include"></div>
  <span style="display: none" data-source-file-pop=""></span>
</template>

<style scoped>
.sp-include { display: contents; }
.sp-include-error {
  padding: 0.5em;
  font-size: 0.85em;
  color: #ef4444;
}
</style>
