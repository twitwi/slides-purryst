<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  path?: string
  transformers?: string
  wrap?: boolean
}>(), {
  path: '',
  transformers: 'auto',
  wrap: false,
})

let nextId = 1

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

    if (props.path) {
      const d = document.createElement('div')
      d.innerHTML = text
      const el = d.querySelector(props.path) as HTMLElement | null
      if (!el) throw new Error(`Path "${props.path}" not found`)
      text = el.outerHTML
    }

    const ts = resolveTransformers(text)
    if (ts.length > 0) {
      const d = document.createElement('div')
      d.innerHTML = text
      const svg = d.querySelector('svg') as SVGSVGElement | null
      if (svg) applyTransformers(svg, ts)
      text = d.innerHTML
    }

    raw.value = text
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function resolveTransformers(text: string): string[] {
  const t = props.transformers
  if (t !== 'auto') return t ? t.split(',').map(s => s.trim()).filter(Boolean) : []
  return text.trim().startsWith('<svg') || props.src.toLowerCase().endsWith('.svg')
    ? ['addViewBox', 'xlinkRewrite', 'idRewrite', 'styleToAttributes']
    : []
}

const units: Record<string, number> = {
  '': 1, px: 1, cm: 96 / 2.54, mm: 96 / 10 / 2.54,
  Q: 96 / 40 / 2.54, in: 96, pc: 96 / 6, pt: 96 / 72,
}

function parseLength(v: string | null): number {
  if (!v) return 0
  const m = v.match(/^([\d.]+)(\w*)$/)
  if (!m) return 0
  return parseFloat(m[1]) * (units[m[2]] ?? 1)
}

function applyTransformers(svg: SVGElement, list: string[]) {
  for (const name of list) {
    switch (name) {
      case 'addViewBox': {
        if (svg.getAttribute('viewBox')) break
        const w = parseLength(svg.getAttribute('width'))
        const h = parseLength(svg.getAttribute('height'))
        if (w && h) {
          svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
          svg.removeAttribute('width')
          svg.removeAttribute('height')
        }
        break
      }
      case 'xlinkRewrite': {
        svg.querySelectorAll('[*|href]:not([href])').forEach(e => {
          const xlink = e.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
          if (xlink) {
            e.setAttribute('href', xlink)
            e.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
          }
        })
        break
      }
      case 'idRewrite': {
        const byId: Record<string, Element> = {}
        const refs: Record<string, { el: Element; attr: string }[]> = {}

        svg.querySelectorAll('*').forEach(el => {
          const id = el.id
          if (id) byId[id] = el
          for (const attr of ['clip-path', 'color-profile', 'fill', 'filter', 'marker-start', 'marker-mid', 'marker-end', 'mask', 'stroke']) {
            const val = el.getAttribute(attr)
            if (!val) continue
            const m = val.trim().match(/^url\(#(.+?)\)$/)
            if (m) (refs[m[1]] ??= []).push({ el, attr })
          }
          const href = el.getAttribute('href')?.trim()
          if (href?.startsWith('#')) (refs[href.slice(1)] ??= []).push({ el, attr: 'href' })
        })

        for (const id in refs) {
          const old = byId[id]
          if (!old) continue
          const newId = `svgid-${nextId++}`
          old.id = newId
          for (const { el, attr } of refs[id]) {
            const prev = el.getAttribute(attr)!
            el.setAttribute(attr, prev.replace('#' + id, '#' + newId))
          }
        }
        break
      }
      case 'styleToAttributes': {
        svg.querySelectorAll('[style]').forEach(el => {
          const st = el.getAttribute('style')
          if (!st) return
          st.split(';').forEach(part => {
            const s = part.trim()
            if (!s || s.startsWith('-')) return
            const [k, ...rest] = s.split(':').map(x => x.trim())
            if (k && rest.length) el.setAttribute(k, rest.join(':'))
          })
          el.removeAttribute('style')
        })
        break
      }
    }
  }
}

onMounted(load)
</script>

<template>
  <div v-if="loading" class="sp-include-loading">…</div>
  <div v-else-if="error" class="sp-include-error">{{ error }}</div>
  <div v-else-if="wrap" v-html="raw" class="sp-include"></div>
  <div v-else v-html="raw" class="sp-include"></div>
</template>

<style scoped>
.sp-include { display: contents; }
.sp-include svg { max-width: 100%; height: auto; }
.sp-include-loading,
.sp-include-error {
  padding: 0.5em;
  font-size: 0.85em;
  color: #64748b;
}
.sp-include-error { color: #ef4444; }
</style>