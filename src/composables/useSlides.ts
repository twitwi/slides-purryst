import { ref, computed } from 'vue'
import type { SlideData } from '../types'

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `<!--${node.textContent}-->`
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }
  const el = node as Element
  const tag = el.tagName.toLowerCase()

  const voidTags = ['sp-anim', 'sp-jump', 'sp-pause', 'sp-meanwhile', 'sp-toc', 'sp-include', 'sp-svg']

  if (tag === 'sp-notes') return ''

  if (voidTags.includes(tag)) {
    let s = `<${tag}`
    for (let j = 0; j < el.attributes.length; j++) {
      const a = el.attributes[j]
      s += ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`
    }
    s += `></${tag}>`
    s += serializeChildren(el)
    return s
  }

  let s = `<${tag}`
  for (let j = 0; j < el.attributes.length; j++) {
    const a = el.attributes[j]
    s += ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`
  }
  s += '>'
  s += serializeChildren(el)
  s += `</${tag}>`
  return s
}

function serializeChildren(el: Element): string {
  let html = ''
  for (let i = 0; i < el.childNodes.length; i++) {
    html += serializeNode(el.childNodes[i])
  }
  return html
}

export function parseRawInto(root: ParentNode, res: Record<'before'|'after', string>) {
  root.querySelectorAll('sp-before').forEach(e => {
    const html = serializeChildren(e).trim()
    if (!html) return
    res.before = (res.before ?? '') + html
  })
  root.querySelectorAll('sp-after').forEach(e => {
    const html = serializeChildren(e).trim()
    if (!html) return
    res.after = (res.after ?? '') + html
  })
}

export function parseElementToSlides(root: ParentNode): SlideData[] {
  const els = root.querySelectorAll('sp-slide')
  const slides: SlideData[] = []
  els.forEach((el, i) => {
    const html = serializeChildren(el).trim()
    if (!html) return

    let notes: string | undefined = el.getAttribute('notes') ?? undefined
    if (!notes) {
      const notesEl = el.querySelector('sp-notes')
      if (notesEl) {
        notes = serializeChildren(notesEl).trim()
      }
    }

    slides.push({
      html,
      num: parseInt(el.getAttribute('num') || '0', 10) || i + 1,
      steps: parseInt(el.getAttribute('steps') || '0', 10),
      transition: el.getAttribute('transition') || '',
      transitionDuration: el.hasAttribute('transition-duration')
        ? parseFloat(el.getAttribute('transition-duration')!)
        : undefined,
      noToc: el.hasAttribute('no-toc'),
      fakeEnd: el.hasAttribute('fake-end'),
      notes,
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

  function nextSlide() {
    if (currentIndex.value < slides.value.length - 1) {
      currentIndex.value++
    }
  }

  function prevSlide() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function setSlides(s: SlideData[]) {
    slides.value = s
  }

  return { slides, currentIndex, current, total, goTo, nextSlide, prevSlide, setSlides }
}