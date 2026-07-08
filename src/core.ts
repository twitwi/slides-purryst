import { createApp } from 'vue'
import type { Component } from 'vue'
import SpPresentation from './components/SpPresentation.vue'
import SpAlternatives from './components/SpAlternatives.vue'
import type { SPSlidesOptions, SlideData } from './types'
import { parseElementToSlides } from './composables/useSlides'
import './style.css'

const builtins: Record<string, Component> = {
  'sp-alternatives': SpAlternatives,
}

function resolveEl(el?: string | HTMLElement): HTMLElement | null {
  return typeof el === 'string'
    ? document.querySelector<HTMLElement>(el)
    : (el ?? null)
}

export function createSlidesPurryst(options: SPSlidesOptions = {}) {
  let { slides, el, transition, designWidth, designHeight, author, components } = options

  if (!slides) {
    const template = document.getElementById('sp-content') as HTMLTemplateElement | null
    if (template?.content) {
      slides = parseElementToSlides(template.content)
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

  const merged = { ...builtins, ...components }

  const target = resolveEl(el) ??
    document.getElementById('sp-presentation') ??
    document.getElementById('app') ??
    document.body

  const params = new URLSearchParams(window.location.search)
  const isPresenter = options.presenter ?? params.has('presenter')

  const app = createApp(SpPresentation, {
    slides,
    transition,
    designWidth,
    designHeight,
    author,
    components: merged,
    presenter: isPresenter,
  })
  const vm = app.mount(target) as any

  if (typeof EventSource !== 'undefined' && window.location.hostname === 'localhost') {
    const es = new EventSource('/__sp_events')
    es.addEventListener('update', () => {
      fetch(window.location.href)
        .then(r => r.text())
        .then(html => {
          const m = html.match(/<template id="sp-content">([\s\S]*?)<\/template>/)
          if (m) vm.updateSlides?.(m[1])
        })
        .catch(() => {})
    })
    es.addEventListener('connected', () => {}, { once: true })
  }

  return app
}