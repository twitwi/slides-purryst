import { serializeCache } from './composables/includeCache'
import { exportInitOptions, runtimeStyleEls } from './sp-api'
import { fixVoidElementsHtml } from './composables/useSteps'

export async function exportStandalone(): Promise<void> {
  const contentEl = document.getElementById('sp-content') as HTMLScriptElement | null
  if (!contentEl) throw new Error('Export failed: #sp-content not found')

  let slidesHtml = contentEl.textContent?.trim() || ''
  slidesHtml = fixVoidElementsHtml(slidesHtml)

  const tmp = document.createElement('div')
  tmp.innerHTML = slidesHtml
  tmp.querySelectorAll<HTMLImageElement>('img[src]').forEach(img => {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return
    const spImg = document.createElement('sp-img')
    spImg.setAttribute('src', src)
    img.replaceWith(spImg)
  })
  slidesHtml = tmp.innerHTML

  const styles: string[] = []
  const linkEls = document.querySelectorAll('link[rel="stylesheet"]')
  for (const el of linkEls) {
    const href = el.getAttribute('href')
    if (!href) continue
    if (href.includes('slides-purryst')) continue
    try {
      const r = await fetch(new URL(href, window.location.href).href)
      if (r.ok) styles.push(await r.text())
    } catch {}
  }
  // Copy user-authored `<style>` blocks from the head (theme tweaks, etc.),
  // but not styles the framework injected at runtime (`#sp-init` css, `sp-style`
  // globals) nor Vite-injected dev styles.
  document.querySelectorAll<HTMLStyleElement>('head style').forEach(el => {
    if (runtimeStyleEls.has(el)) return
    if (el.hasAttribute('data-vite-dev-id')) return
    styles.push(el.textContent ?? '')
  })
  const cacheJson = serializeCache()
  const cacheTemplate = `<template id="sp-cache">${cacheJson.replace(/</g, '&lt;')}</template>`
  const initScript = document.getElementById('sp-init')?.outerHTML ?? ''

  const initOpts: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(exportInitOptions)) {
    if (v !== undefined && v !== null) initOpts[k] = v
  }
  const optsJson = JSON.stringify(initOpts, null, 2)
    .replace(/"([^"]+)":/g, '$1:')   // unquote keys

  const themeClass = Array.from(document.documentElement.classList).find(c => c.startsWith('theme-')) ?? ''
  const htmlClassAttr = themeClass ? ` class="${themeClass}"` : ''

  const html = `<!DOCTYPE html>
<html lang="en"${htmlClassAttr}>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presentation</title>
${styles.length ? `<style>\n${styles.join('\n')}\n</style>` : ''}
</head>
<body>
<div id="app"></div>
<script type="text/html" id="sp-content">
${slidesHtml}
</script>
${cacheTemplate}
${initScript}
<script src="./slides-purryst.bundle.js"></script>
<script>
(async () => { await SlidesPurryst.createSlidesPurryst(${optsJson}) })()
</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation-standalone.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
