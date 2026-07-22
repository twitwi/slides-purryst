import { createApp } from 'vue'
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
import type { SPSlidesOptions, SlideData } from './types'
import type { SlidesPlugin } from './keymap/types'
import { registry } from './keymap/plugin'
import { parseElementToSlides, parseRawInto } from './composables/useSlides'
import { preloadInclude, loadCache, preloadBinary, setCacheIgnore } from './composables/includeCache'
import { setDefaultClicksAt } from './composables/useSteps'
import { exportStandalone } from './export'
import './style.css'

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
}

function resolveEl(el?: string | HTMLElement): HTMLElement | null {
  return typeof el === 'string'
    ? document.querySelector<HTMLElement>(el)
    : (el ?? null)
}

export function createSlidesPurryst(options: SPSlidesOptions = {}) {
  let { slides, el, transition, transitionDuration, designWidth, designHeight, author, components, seed, cacheIgnore, clicksAt, plugins, activate } = options

  const template = document.getElementById('sp-content') as HTMLTemplateElement | null
  const cacheTemplate = document.getElementById('sp-cache') as HTMLTemplateElement | null
  const raw = {} as Record<'before'|'after',string>

  if (clicksAt !== undefined) {
    setDefaultClicksAt(clicksAt)
  }

  if (!slides) {
    if (cacheTemplate?.content) {
      const json = cacheTemplate.content.textContent?.trim()
      if (json) loadCache(json)
    }

    if (template?.content) {
      slides = parseElementToSlides(template.content)
      if (transition) {
        slides.forEach(sl => {
          if (sl.transition === '') {
            sl.transition = transition
          }
        })
      }
    }
  }

  if (template?.content) {
    parseRawInto(template.content, raw)
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

  if (template?.content) {
    injectGlobalStyles(template.content)
    template.content.querySelectorAll('sp-include').forEach(el => {
      const src = el.getAttribute('src')
      if (src) preloadInclude(src)
    })
    const imgSrcs = new Set<string>()
    template.content.querySelectorAll<HTMLImageElement>('img[src]').forEach(el => {
      const src = el.getAttribute('src')
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) imgSrcs.add(src)
    })
    template.content.querySelectorAll<HTMLElement>('sp-img[src]').forEach(el => {
      const src = el.getAttribute('src')
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) imgSrcs.add(src)
    })
    imgSrcs.forEach(src => {
      if (src.match(/\.svg(\?|#|$)/i)) {
        preloadInclude(src)
      } else {
        preloadBinary(src)
      }
    })
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

  for (const plugin of plugins ?? []) {
    registry.register(plugin)
  }

  const app = createApp(SpPresentation, {
    slides,
    transition,
    transitionDuration,
    designWidth,
    designHeight,
    author,
    seed,
    raw,
    components: merged,
    presenter: isPresenter,
    activate,
  })
  app.config.globalProperties.$sp = spApi
  app.provide('sp-api', spApi)
  app.provide('sp-registry', registry)
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any).__sp__ = spApi
  }
  const vm = app.mount(target) as any

  ;(app as any).use = (plugin: SlidesPlugin) => {
    registry.register(plugin)
    vm.rebuildKeymap?.()
    return app
  }

  if (typeof EventSource !== 'undefined' && window.location.hostname === 'localhost') {
    const es = new EventSource('/__sp_events')
    let lastTemplateHtml = ''
    es.addEventListener('update', () => {
      fetch(window.location.href + '?_=' + Date.now())
      .then(r => r.text())
      .then(html => {
          const m = html.match(/<template id="sp-content"([\s\S]*?)<\/template>/)
          if (m && m[1] !== lastTemplateHtml) {
            lastTemplateHtml = m[1]
            vm.updateSlides?.(m[1])
            reapplyGlobalStyles(m[1])
          }
        })
        .catch(() => {})
    })
    es.addEventListener('connected', () => {}, { once: true })
  }

  ;(app as any).export = exportStandalone
  return app
}