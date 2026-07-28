import { createApp, ref } from 'vue'
import type { Component } from 'vue'
import SpPresentation from './components/SpPresentation.vue'
import { spApi, exportInitOptions } from './sp-api'
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
import type { SPSlidesOptions, SlideData, SlidesPlugin } from './types'
import { registry } from './plugin'
import { parseElementToSlides, parseRawInto, extractRawSlideSources } from './composables/useSlides'
import { preloadInclude, loadCache, preloadBinary, setCacheIgnore, invalidateByFilename, invalidateTextCache } from './composables/includeCache'
import { fixVoidElementsHtml, annotateEditableWithIndex } from './composables/useSteps'
import { resolveTopIncludes } from './composables/resolveIncludes'
import { parseChunklets } from './composables/useChunklets'
import { exportStandalone } from './export'
import './style.css'
import { clearGlobalErrorMessages } from './composables/globalErrorMessages.js'

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

export async function createSlidesPurryst(options: SPSlidesOptions = {}) {
  let { slides, el, transition, transitionDuration, designWidth, designHeight, author, components, seed, cacheIgnore, plugins, activate } = options

  const scriptEl = document.getElementById('sp-content') as HTMLScriptElement | null
  const cacheTemplate = document.getElementById('sp-cache') as HTMLTemplateElement | null
  const raw = {} as Record<'before'|'after',string>

  let contentRoot: Element | null = null
  const rawSlideSources: string[] = []
  if (scriptEl) {
    const rawHtml = scriptEl.textContent || ''
    const resolvedHtml = await resolveTopIncludes(rawHtml)
    rawSlideSources.push(...extractRawSlideSources(resolvedHtml))
    const fixedHtml = annotateEditableWithIndex(fixVoidElementsHtml(resolvedHtml))
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

  const chunkletsTemplate = document.getElementById('sp-chunklets') as HTMLTemplateElement | null
  if (chunkletsTemplate?.content) {
    spApi.chunkletDefs = parseChunklets(chunkletsTemplate.content)
  }

  if (!designWidth || !designHeight || !author || !seed) {
    const root = document.getElementById('sp-presentation')
    if (root) {
      const dw = root.getAttribute('data-design-width')
      const dh = root.getAttribute('data-design-height')
      if (dw && dh) {
        designWidth = parseInt(dw, 10)
        designHeight = parseInt(dh, 10)
      }
      const da = root.getAttribute('data-author')
      if (da) author = da
      const ds = root.dataset.seed
      if (ds) seed = parseInt(ds, 10)
    }
  }

  let globalStyleEls: HTMLStyleElement[] = []
  function injectGlobalStyles(root: ParentNode) {
    Array.from(root.children).forEach(el => {
      if (['sp-style', 'style'].includes(el.tagName.toLowerCase())) {
        const css = el.textContent?.trim()
        if (!css) return
        const s = document.createElement('style')
        s.textContent = css
        document.head.appendChild(s)
        globalStyleEls.push(s)
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

  const params = new URLSearchParams(window.location.search)
  const isPresenter = options.presenter ?? params.has('presenter')

  Object.assign(exportInitOptions, {
    transition,
    transitionDuration,
    designWidth,
    designHeight,
    author,
    seed,
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

  ;(app as any).use = async (plugin: SlidesPlugin) => {
    await registry.register(plugin)
    vm.rebuildKeymap()
    return app
  }

  if (typeof EventSource !== 'undefined' && window.location.hostname === 'localhost') {
    const es = new EventSource('/__sp_events')
    es.addEventListener('update', (event: MessageEvent) => {
      liveUpdatesCount.value++
      const filename = (event.data ?? '').trim()
      if (filename) invalidateByFilename(filename)
      else invalidateTextCache()
      fetch(window.location.href + '?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
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
  }

  ;(app as any).export = exportStandalone
  return app
}