import { createApp } from 'vue'
import type { Component } from 'vue'
import SpPresentation from './components/SpPresentation.vue'
import { spApi, exportInitOptions } from './sp-api'
import SpAlternatives from './components/SpAlternatives.vue'
import SpAnim from './components/SpAnim.vue'
import SpDrag from './components/SpDrag.vue'
import SpInclude from './components/SpInclude.vue'
import SpSvg from './components/SpSvg.vue'
import SpStyle from './components/SpStyle.vue'
import SpToc from './components/SpToc.vue'
import SpImg from './components/SpImg.vue'
import type { SPSlidesOptions, SlideData } from './types'
import { parseElementToSlides } from './composables/useSlides'
import { preloadInclude, loadCache, preloadBinary } from './composables/includeCache'
import { exportStandalone } from './export'
import './style.css'

const builtins: Record<string, Component> = {
  'sp-alternatives': SpAlternatives,
  'sp-anim': SpAnim,
  'sp-drag': SpDrag,
  'sp-img': SpImg,
  'sp-include': SpInclude,
  'sp-svg': SpSvg,
  'sp-style': SpStyle,
  'sp-toc': SpToc,
}

function resolveEl(el?: string | HTMLElement): HTMLElement | null {
  return typeof el === 'string'
    ? document.querySelector<HTMLElement>(el)
    : (el ?? null)
}

export function createSlidesPurryst(options: SPSlidesOptions = {}) {
  let { slides, el, transition, transitionDuration, designWidth, designHeight, author, components } = options

  if (!slides) {
  const cacheTemplate = document.getElementById('sp-cache') as HTMLTemplateElement | null
  if (cacheTemplate?.content) {
    const json = cacheTemplate.content.textContent?.trim()
    if (json) loadCache(json)
  }

  const template = document.getElementById('sp-content') as HTMLTemplateElement | null
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

  if (!designWidth || !designHeight || !author) {
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
    }
  }

  let globalStyleEls: HTMLStyleElement[] = []
  function injectGlobalStyles(root: ParentNode) {
    Array.from(root.children).forEach(el => {
      if (el.tagName.toLowerCase() === 'sp-style') {
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

  const template = document.getElementById('sp-content') as HTMLTemplateElement | null
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
    el: '#app',
  })

  const app = createApp(SpPresentation, {
    slides,
    transition,
    transitionDuration,
    designWidth,
    designHeight,
    author,
    components: merged,
    presenter: isPresenter,
  })
  app.config.globalProperties.$sp = spApi
  app.provide('sp-api', spApi)
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any).__sp__ = spApi
  }
  const vm = app.mount(target) as any

  if (typeof EventSource !== 'undefined' && window.location.hostname === 'localhost') {
    const es = new EventSource('/__sp_events')
    es.addEventListener('update', () => {
      fetch(window.location.href)
        .then(r => r.text())
        .then(html => {
          const m = html.match(/<template id="sp-content">([\s\S]*?)<\/template>/)
          if (m) {
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