<script setup lang="ts">
import { ref, onMounted, onUnmounted, useSlots, type VNode } from 'vue'

const props = withDefaults(defineProps<{
  css?: string
}>(), {
  css: '',
})

const slots = useSlots() as { default?: (...args: any[]) => VNode[] }
const styleEl = ref<HTMLStyleElement | null>(null)

function getCss(): string {
  if (props.css) return props.css
  const nodes = slots.default?.() ?? []
  return nodes.map((n: VNode) => {
    const t = n.children
    if (typeof t === 'string') return t
    if (Array.isArray(t)) return t.map(c => (typeof c === 'string' ? c : '')).join('')
    return ''
  }).join('')
}

onMounted(() => {
  const css = getCss()
  if (!css) return
  const el = document.createElement('style')
  el.textContent = css
  document.head.appendChild(el)
  styleEl.value = el
})

onUnmounted(() => {
  styleEl.value?.remove()
})
</script>
<template></template>