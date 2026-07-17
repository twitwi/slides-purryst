<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, useSlots, type VNode, type Ref } from 'vue'

const props = withDefaults(defineProps<{
  css?: string
}>(), {
  css: '',
})

const slideNum = inject<Ref<number | undefined>>('slideNum', undefined as any)
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

function scopeCss(css: string): string {
  const n = slideNum?.value
  if (n === undefined) return css
  return `.sp-slide-${n} { ${css} }`
}

onMounted(() => {
  const raw = getCss()
  if (!raw) return
  const el = document.createElement('style')
  el.textContent = scopeCss(raw)
  document.head.appendChild(el)
  styleEl.value = el
})

onUnmounted(() => {
  styleEl.value?.remove()
})
</script>
<template></template>