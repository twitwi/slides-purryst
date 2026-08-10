import { watch, nextTick, type Ref } from 'vue'

// Step-aware filtering for `<sp-bib>` blocks (cached bibliographies included
// via `<sp-include class="sp-bib">`). Typst's HTML export marks bibliography
// entries as `<li id="loc-*">` inside `section[role="doc-bibliography"]` and
// citations as `<a href="#loc-*" role="doc-biblioref">`. The ids are only
// known after compilation, so the filter must run against the live DOM.
//
// For the current slide, an entry is shown iff at least one *currently step
// visible* citation in that slide points to it. Everything else is hidden, and
// the whole block is hidden when nothing is cited on the slide.

const CITE_SELECTOR = 'a[role="doc-biblioref"]'
const HIDDEN_CLASS = 'sp-bib-hidden'
const EMPTY_CLASS = 'sp-bib-empty'

// The step system toggles `.sp-anim-hidden` (opacity 0) and `.sp-anim-only`
// (display none) on stepped elements; nested content inherits invisibility.
function isStepVisible(el: Element): boolean {
  return el.closest('.sp-anim-hidden, .sp-anim-only') === null
}

function filterBibBlock(block: HTMLElement, targetIds: Set<string>): void {
  let shown = 0
  block.querySelectorAll('li').forEach(li => {
    const id = li.getAttribute('id')
    const show = id !== null && targetIds.has(id)
    li.classList.toggle(HIDDEN_CLASS, !show)
    if (show) shown++
  })
  block.classList.toggle(EMPTY_CLASS, shown === 0)
}

export function useBibFilter(opts: {
  getSlideEl: () => Element | null
  currentIndex: Ref<number>
  stepIndex: Ref<number>
  contentVersion: Ref<number>
}) {
  function run() {
    const slideEl = opts.getSlideEl()
    if (!slideEl) return
    const blocks = slideEl.querySelectorAll<HTMLElement>('.sp-bib')
    if (blocks.length === 0) return
    const targetIds = new Set<string>()
    slideEl.querySelectorAll(CITE_SELECTOR).forEach(a => {
      if (!isStepVisible(a)) return
      const href = a.getAttribute('href')
      if (href?.startsWith('#')) targetIds.add(href.slice(1))
    })
    blocks.forEach(b => filterBibBlock(b, targetIds))
  }

  const schedule = () => nextTick(run)

  watch([opts.currentIndex, opts.stepIndex, opts.contentVersion], schedule, { flush: 'post' })
  schedule()

  return { run, schedule }
}
