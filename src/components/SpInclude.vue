<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Transformer } from '../types'

const props = withDefaults(defineProps<{
  src: string
  path?: string
  transformers?: Transformer[]
}>(), {
  path: '',
  transformers: () => [],
})

const raw = ref('')
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  raw.value = ''
  try {
    const r = await fetch(props.src)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    let text = await r.text()

    const d = document.createElement('div')
    d.innerHTML = text

    if (props.path) {
      const el = d.querySelector(props.path)
      if (!el) throw new Error(`Path "${props.path}" not found`)
      d.innerHTML = ''
      d.appendChild(el.cloneNode(true))
    }

    for (const fn of props.transformers) {
      fn(d)
    }

    raw.value = d.innerHTML
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-if="loading" class="sp-include-loading">…</div>
  <div v-else-if="error" class="sp-include-error">{{ error }}</div>
  <div v-else v-html="raw" class="sp-include"></div>
</template>

<style scoped>
.sp-include { display: contents; }
.sp-include-loading,
.sp-include-error {
  padding: 0.5em;
  font-size: 0.85em;
  color: #64748b;
}
.sp-include-error { color: #ef4444; }
</style>
