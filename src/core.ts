import { createApp, ref } from 'vue'
import type { Component } from 'vue'
import SpPresentation from './components/SpPresentation.vue'
import { spApi, exportInitOptions, runtimeStyleEls } from './sp-api'
import SpAlternatives from './components/SpAlternatives.vue'
import SpAnim from './components/SpAnim.vue'
import SpDrag from './components/SpDrag.vue'
import SpInclude from './components/SpInclude.vue'
import SpSvg from './components/SpSvg.vue'
import SpStep from './components/SpStep.vue'
import SpStyle from './components/SpStyle.vue'
import SpToc from './components/SpToc.vue'
import SpImg from './components/SpImg.vue'
import SpSlideSource from './components/SpSlideSource.vue'
import type { SPSlidesOptions, SlideData, SlidesPlugin, SpInitPayload } from './types'
import { registry } from './plugin'
import { parseElementToSlides, parseRawInto, extractRawSlideSources } from './composables/useSlides'
import { preloadInclude, loadCache, preloadBinary, setCacheIgnore, invalidateByFilename, invalidateTextCache, getCachedInclude } from './composables/includeCache'
import { fixVoidElementsHtml, annotateEditableWithIndex, wrapEmojisInSvg } from './composables/useSteps'
import { resolveTopIncludes } from './composables/resolveIncludes'
import { parseChunkletsFromText } from './composables/useChunklets'
import { exportStandalone } from './export'
import './style.css'
import { addGlobalErrorMessage, clearGlobalErrorMessages } from './composables/globalErrorMessages.js'

const builtins: Record<string, Component> = {
  'sp-alternatives': SpAlternatives,
  'sp-anim': SpAnim,
  'sp-drag': SpDrag,
  'sp-img': SpImg,
  'sp-include': SpInclude,
  'sp-svg': SpSvg,
  'sp-step': SpStep,
  'sp-style': SpStyle,
  'sp-toc': SpToc,
  'sp-slide-source': SpSlideSource,
}

function resolveEl(el?: string | HTMLElement): HTMLElement | null {
  return typeof el === 'string'
    ? document.querySelector<HTMLElement>(el)
    : (el ?? null)
}

// Read the payload of a raw-text `<script type="text/html">` or an inert
// `<template>` uniformly. Scripts hold escaped text (`textContent`); templates
// hold real elements in a `DocumentFragment` (which has no `innerHTML`), so
// serialize it through a temporary wrapper.
function readPayload(el: Element): string {
  if (el.tagName === 'TEMPLATE') {
    const div = document.createElement('div')
    div.append((el as HTMLTemplateElement).content.cloneNode(true))
    return div.innerHTML
  }
  return el.textContent || ''
}

// Parse the `#sp-init` payload (JSON emitted by the typst `#sp-init(...)`
// helper, or hand-written). Tolerates both `js-mounted` (kebab, what typst
// emits) and `jsMounted` (camel, hand-written JSON).
function parseInitPayload(text: string): SpInitPayload {
  const t = text.trim()
  if (!t) return {}
  try {
    const data = JSON.parse(t)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        config: data.config,
        css: data.css,
        js: data.js,
        jsMounted: data['js-mounted'] ?? data.jsMounted,
      } as SpInitPayload
    }
  } catch {
    console.warn('sp-init: could not parse payload', text.slice(0, 80))
  }
  return {}
}

// Run raw init JS. A fresh `<script>` element executes synchronously on
// append and works under `file://` (no fetch involved).
function runInitScript(code: string | undefined) {
  if (!code || !code.trim()) return
  const s = document.createElement('script')
  s.textContent = code
  ;(document.head ?? document.documentElement).appendChild(s)
  s.remove()
}

function injectInitCss(css: string | undefined) {
  if (!css || !css.trim()) return
  const s = document.createElement('style')
  s.textContent = css
  document.head.appendChild(s)
  runtimeStyleEls.add(s)
}

// Swap the active `.theme-*` class on `<html>`. Themes are pure class names
// (see src/style/themes.css); colors/vars stay in CSS.
function applyThemeClass(name: string) {
  const el = document.documentElement
  Array.from(el.classList)
    .filter(c => c.startsWith('theme-'))
    .forEach(c => el.classList.remove(c))
  el.classList.add('theme-' + name.replace(/[^a-zA-Z0-9_-]/g, ''))
}

// Read the "page author" layer of init params off `#sp-presentation`:
// individual `data-*` scalars, then a `data-sp-init` JSON blob (wins).
function readPresentationParams(): Record<string, unknown> {
  const root = document.getElementById('sp-presentation')
  if (!root) return {}
  const attrs: Record<string, unknown> = {}
  const num = (name: string) => {
    const v = root.getAttribute(name)
    return v ? parseInt(v, 10) : undefined
  }
  const dw = num('data-design-width')
  const dh = num('data-design-height')
  if (dw !== undefined && dh !== undefined) {
    attrs.designWidth = dw
    attrs.designHeight = dh
  }
  const author = root.getAttribute('data-author')
  if (author !== null) attrs.author = author
  const seed = num('data-seed')
  if (seed !== undefined) attrs.seed = seed
  const theme = root.getAttribute('data-theme')
  if (theme !== null && theme) attrs.theme = theme
  const transition = root.getAttribute('data-transition')
  if (transition !== null && transition) attrs.transition = transition
  const transitionDuration = num('data-transition-duration')
  if (transitionDuration !== undefined) attrs.transitionDuration = transitionDuration
  const presenter = root.getAttribute('data-presenter')
  if (presenter !== null) attrs.presenter = presenter === '' || presenter === 'true' || presenter === '1'
  const json = root.getAttribute('data-sp-init')
  if (json) {
    try {
      const obj = JSON.parse(json)
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) Object.assign(attrs, obj)
    } catch {
      console.warn('sp-init: could not parse data-sp-init attribute on #sp-presentation')
    }
  }
  return attrs
}

export async function createSlidesPurryst(options: SPSlidesOptions = {}) {
  // Early `#sp-init`: run `js` first (may set up globals/hooks), inject `css`
  // before anything renders, then merge `config` into the page-author layer.
  const initEl = document.getElementById('sp-init')
  const init = initEl ? parseInitPayload(readPayload(initEl)) : {}
  runInitScript(init.js)
  injectInitCss(init.css)

  const pageParams = { ...readPresentationParams(), ...(init.config ?? {}) }
  const resolved = { ...pageParams, ...options }
  const { el, transition, transitionDuration, designWidth, designHeight, author, components, seed, cacheIgnore, plugins, activate, theme, presenter } = resolved
  let slides = resolved.slides

  if (theme) applyThemeClass(String(theme))

  const scriptEl = document.getElementById('sp-content') as HTMLScriptElement | null
  const cacheTemplate = document.getElementById('sp-cache') as HTMLTemplateElement | null
  const raw = {} as Record<'before'|'after',string>

  let contentRoot: Element | null = null
  const rawSlideSources: string[] = []
  if (scriptEl) {
    const rawHtml = scriptEl.textContent || ''
    const resolvedHtml = await resolveTopIncludes(rawHtml)
    rawSlideSources.push(...extractRawSlideSources(resolvedHtml))
    const fixedHtml = wrapEmojisInSvg(annotateEditableWithIndex(fixVoidElementsHtml(resolvedHtml)))
    contentRoot = document.createElement('div')
    contentRoot.innerHTML = fixedHtml
  }

  if (!slides) {
    if (cacheTemplate?.content) {
      const json = cacheTemplate.content.textContent?.trim()
      if (json) loadCache(json)
    }

    if (contentRoot) {
      slides = parseElementToSlides(contentRoot)
      if (transition) {
        slides.forEach(sl => {
          if (sl.transition === '') {
            sl.transition = transition
          }
        })
      }
    }
  }

  if (contentRoot) {
    parseRawInto(contentRoot, raw)
  }

  const chunkletsEl = document.getElementById('sp-chunklets')
  if (chunkletsEl?.tagName === 'SCRIPT') {
    const text = (chunkletsEl as HTMLScriptElement).textContent || ''
    if (text.trim()) {
      spApi.chunkletDefs = parseChunkletsFromText(text)
    }
  }

  // Seed cache entries (`<template data-sp-cache="...">`, emitted by the typst
  // `#cache-defs()`) into the include cache so that `<sp-include src="...">`
  // resolves without a network fetch, in all modes (dev, export, file://).
  document.querySelectorAll('template[data-sp-cache]').forEach(t => {
    const src = t.getAttribute('data-sp-cache')
    const html = readPayload(t).trim()
    if (src && html) {
      getCachedInclude(src).value = html
    }
  })

  let globalStyleEls: HTMLStyleElement[] = []
  function injectGlobalStyles(root: ParentNode) {
    Array.from(root.children).forEach(el => {
      if (['sp-style', 'style'].includes(el.tagName.toLowerCase())) {
        const css = el.getAttribute('css') ?? el.textContent?.trim()
        if (!css) return
        const s = document.createElement('style')
        s.textContent = css
        document.head.appendChild(s)
        globalStyleEls.push(s)
        runtimeStyleEls.add(s)
      }
    })
  }
  function removeGlobalStyles() {
    globalStyleEls.forEach(s => s.remove())
    globalStyleEls = []
  }
  function reapplyGlobalStyles(html: string) {
    removeGlobalStyles()
    const d = document.createElement('div')
    d.innerHTML = html
    injectGlobalStyles(d)
  }

  if (cacheIgnore) setCacheIgnore(cacheIgnore)

  if (contentRoot) {
    injectGlobalStyles(contentRoot)
    const preloadPromises: Promise<void>[] = []
    contentRoot.querySelectorAll('sp-include').forEach(el => {
      const src = el.getAttribute('src')
      if (src) preloadPromises.push(preloadInclude(src))
    })
    const imgSrcs = new Set<string>()
    contentRoot.querySelectorAll<HTMLImageElement>('img[src]').forEach(el => {
      const src = el.getAttribute('src')
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) imgSrcs.add(src)
    })
    contentRoot.querySelectorAll<HTMLElement>('sp-img[src]').forEach(el => {
      const src = el.getAttribute('src')
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) imgSrcs.add(src)
    })
    imgSrcs.forEach(src => {
      if (src.match(/\.svg(\?|#|$)/i)) {
        preloadPromises.push(preloadInclude(src))
      } else {
        preloadPromises.push(preloadBinary(src))
      }
    })
    await Promise.all(preloadPromises)
  }

  const merged = { ...builtins, ...components }

  const target = resolveEl(el) ??
    document.getElementById('sp-presentation') ??
    document.getElementById('app') ??
    document.body

  const query = new URLSearchParams(window.location.search)
  const isPresenter = presenter ?? query.has('presenter')

  Object.assign(exportInitOptions, {
    transition,
    transitionDuration,
    designWidth,
    designHeight,
    author,
    seed,
    theme,
    raw,
    el: '#app',
  })

  const allPlugins: SlidesPlugin[] = [...(plugins ?? [])]
  if (activate) {
    allPlugins.unshift({ name: '__user__', order: 100, activate })
  }
  const sorted = allPlugins.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const plugin of sorted) {
    await registry.register(plugin)
  }

  // TODO: fuse use of window.location (see other window.location.search)
  function has(q: string) {
    return window.location.search.match(`[?]${q}($|[?])`)
  }
  const print = has('print') ? has('steps') ? 'steps' : 'slides' : false

  const app = createApp(SpPresentation, {
    slides,
    rawSlideSources,
    transition,
    transitionDuration,
    designWidth,
    designHeight,
    author,
    seed,
    raw,
    components: merged,
    presenter: isPresenter,
    print
  })
  app.config.globalProperties.$sp = spApi
  app.provide('sp-api', spApi)
  app.provide('sp-registry', registry)
  const liveUpdatesCount = ref(0)
  app.provide('liveUpdatesCount', liveUpdatesCount)

  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any).__sp__ = spApi
  }
  const vm = app.mount(target) as any

  // `js-mounted`: spApi / window.__sp__ is live now.
  runInitScript(init.jsMounted)

  ;(app as any).use = async (plugin: SlidesPlugin) => {
    await registry.register(plugin)
    vm.rebuildKeymap()
    return app
  }

  if (typeof EventSource !== 'undefined') {
    const es = new EventSource('/__sp_events')
    const generateHash = (s: string) => {
      let hash = 0
      for (const char of s) {
        hash = (hash << 5) - hash + char.charCodeAt(0)
        hash |= 0
      }
      return hash
    }

    let lastNonContentHash = parseInt(window.localStorage.getItem('sp-non-content-hash') ?? '0', 10)
    es.addEventListener('update', (event: MessageEvent) => {
      liveUpdatesCount.value++
      const filename = (event.data ?? '').trim()
      if (filename) invalidateByFilename(filename)
      else invalidateTextCache()
      fetch(window.location.href + '?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
        const nonContentHash = generateHash(html.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ''))
        if (lastNonContentHash !== 0 && lastNonContentHash !== nonContentHash) {
          // will still miss it if the very first modification is in non-content
          window.localStorage.setItem('sp-non-content-hash', nonContentHash.toString())
          window.location.reload()
          return            
        }
        lastNonContentHash = nonContentHash
        const m = html.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/)
        if (m) {
          ;(async () => {
            const resolvedHtml = await resolveTopIncludes(m[1])
            clearGlobalErrorMessages()
            vm.updateSlides?.(resolvedHtml)
            reapplyGlobalStyles(resolvedHtml)
          })().catch(() => {})
        }
      })
      .catch(() => {})
    })
    es.addEventListener('connected', () => {}, { once: true })
    es.addEventListener('typst-error', (event: MessageEvent) => {
      clearGlobalErrorMessages()
      try {
        const msgs = JSON.parse(event.data ?? '[]')
        ;(Array.isArray(msgs) ? msgs : [msgs]).forEach(msg => addGlobalErrorMessage(msg))
      } catch {}
    })
  }

  ;(app as any).export = exportStandalone
  return app
}