import type { Transformer } from '../types'

let nextId = 1

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

export const addViewBox: Transformer = (root) => {
  const svg = root.querySelector('svg')
  if (!svg || svg.getAttribute('viewBox')) return
  const w = parseLength(svg.getAttribute('width'))
  const h = parseLength(svg.getAttribute('height'))
  if (w && h) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    svg.removeAttribute('width')
    svg.removeAttribute('height')
  }
}

export const xlinkRewrite: Transformer = (root) => {
  root.querySelectorAll('[*|href]:not([href])').forEach(e => {
    const xlink = e.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (xlink) {
      e.setAttribute('href', xlink)
      e.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
    }
  })
}

export const idRewrite: Transformer = (root) => {
  const byId: Record<string, Element> = {}
  const refs: Record<string, { el: Element; attr: string }[]> = {}

  root.querySelectorAll('*').forEach(el => {
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
}

export const styleToAttributes: Transformer = (root) => {
  root.querySelectorAll('[style]').forEach(el => {
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
}

export const defaultTransformers: Transformer[] = [
  addViewBox,
  xlinkRewrite,
  idRewrite,
  styleToAttributes,
]
