import type { ChunkDef } from '../types'

// Parse `<sp-chunk>` definitions from the raw text of a
// `<script type="text/html" id="sp-chunklets">` container. The body is
// plain text (no HTML parsing), so Typst snippets may contain `<`, `>`, `&`
// etc. verbatim.
export function parseChunkletsFromText(text: string): ChunkDef[] {
  const chunks: ChunkDef[] = []
  const re = /<sp-chunk\b([^>]*)>([\s\S]*?)<\/sp-chunk>/gi
  let m
  while ((m = re.exec(text)) !== null) {
    const attrs = m[1]
    const name = /name="([^"]*)"/.exec(attrs)?.[1]
    if (!name) continue
    const paramsStr = /params="([^"]*)"/.exec(attrs)?.[1] || ''
    const params = paramsStr.split(',').map(s => s.trim()).filter(Boolean)
    const html = m[2].replace(/^\s*\n/m, '').replace(/\n\s*$/m, '')
    if (!html) continue
    const kind = /data-kind="([^"]*)"/.exec(attrs)?.[1] === 'typst' ? 'typst' : 'html'
    chunks.push({ name, params, html, kind })
  }
  return chunks
}

export function parseChunklets(root: ParentNode): ChunkDef[] {
  const chunks: ChunkDef[] = []
  root.querySelectorAll('sp-chunk').forEach(el => {
    const name = el.getAttribute('name')
    if (!name) return
    const paramsStr = el.getAttribute('params') || ''
    const params = paramsStr.split(',').map(s => s.trim()).filter(Boolean)
    const html = el.innerHTML.replace(/^\s*\n/m, '').replace(/\n\s*$/m, '')
    if (!html) return
    const kind = el.getAttribute('data-kind') === 'typst' ? 'typst' : 'html'
    chunks.push({ name, params, html, kind })
  })
  return chunks
}

export function substituteParams(html: string, params: Record<string, number | string>): string {
  return html.replace(/\$(\w+)/g, (_, key) => {
    return key in params ? String(params[key]) : `$${key}`
  })
}

export type PlacementMode = 'instant' | 'click' | 'drag'

export function chunkPlacementMode(chunk: ChunkDef): PlacementMode {
  if (chunk.params.length === 0) return 'instant'
  const hasW = chunk.params.includes('w')
  const hasH = chunk.params.includes('h')
  if (hasW || hasH) return 'drag'
  return 'click'
}

export function getSlideScale(): number {
  const wrap = document.querySelector('.sp-scale-wrap') as HTMLElement | null
  if (!wrap) return 1
  const t = window.getComputedStyle(wrap).transform
  if (!t || t === 'none') return 1
  const m = t.match(/matrix\(([^)]+)\)/)
  if (m) return parseFloat(m[1].split(', ')[0]) || 1
  const m3 = t.match(/matrix3d\(([^)]+)\)/)
  if (m3) return parseFloat(m3[1].split(', ')[0]) || 1
  return 1
}
