import { computed, type Ref } from 'vue'
import type { SlideData } from '../types'

export interface TocItem {
  slideIndex: number
  slideNum: number
  level: number
  text: string
}

export function useSlideTree(slides: Ref<SlideData[]>) {
  const tree = computed<TocItem[]>(() => {
    const items: TocItem[] = []
    for (let i = 0; i < slides.value.length; i++) {
      const s = slides.value[i]
      if (s.noToc) continue
      const d = document.createElement('div')
      d.innerHTML = s.html
      d.querySelectorAll('h1,h2,h3').forEach(el => {
        const text = el.textContent?.trim()
        if (!text) return
        items.push({
          slideIndex: i,
          slideNum: s.num,
          level: parseInt(el.tagName[1], 10),
          text,
        })
      })
    }
    return items
  })

  return { tree }
}
