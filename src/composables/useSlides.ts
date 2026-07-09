import { ref, computed } from 'vue'
import type { SlideData } from '../types'

export function parseElementToSlides(root: ParentNode): SlideData[] {
  const els = root.querySelectorAll('sp-slide')
  const slides: SlideData[] = []
  els.forEach((el, i) => {
    const html = el.innerHTML.trim()
    if (!html) return
    slides.push({
      html,
      num: parseInt(el.getAttribute('num') || '0', 10) || i + 1,
      steps: parseInt(el.getAttribute('steps') || '0', 10),
      transition: el.getAttribute('transition') || '',
    })
  })
  return slides
}

export function useSlides(initial?: SlideData[]) {
  const slides = ref<SlideData[]>(initial ?? [])
  const currentIndex = ref(0)

  const current = computed(() => slides.value[currentIndex.value] ?? null)
  const total = computed(() => slides.value.length)

  function goTo(index: number) {
    if (index >= 0 && index < slides.value.length) {
      currentIndex.value = index
    }
  }

  function next() {
    if (currentIndex.value < slides.value.length - 1) {
      currentIndex.value++
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function setSlides(s: SlideData[]) {
    slides.value = s
  }

  return { slides, currentIndex, current, total, goTo, next, prev, setSlides }
}