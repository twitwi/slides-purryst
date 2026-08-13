import type { SlideRefinement } from '../types'

// Step-aware refinement of `.sp-bib` bibliography blocks (tagged `<sp-bib>`
// elements or `<sp-include class="sp-bib">`, as emitted by typst's
// `#slide-bib()`). The ids of the entries are only known after compilation,
// so the refinement must run against the live DOM.
//
// For a slide, an entry is shown iff at least one *currently step visible*
// citation in that slide points to it. Everything else is hidden, and the
// whole block is hidden when nothing is cited on the slide.
//
// Typst's HTML export marks bibliography entries as `<li id="loc-*">` inside
// a `section[role="doc-bibliography"]` and citations as
// `a[role="doc-biblioref"]`. Hand-written HTML may use the `.sp-bib-cite`
// class on its citation links instead — both are matched.

const CITE_SELECTOR = 'a[role="doc-biblioref"], .sp-bib-cite'
const HIDDEN_CLASS = 'sp-bib-hidden'
const ABSENT_CLASS = 'sp-bib-absent'
const EMPTY_CLASS = 'sp-bib-empty'

// The step system toggles `.sp-anim-hidden` (opacity 0) and `.sp-anim-only`
// (display none) on stepped elements; nested content inherits invisibility.
function isStepVisible(el: Element): boolean {
  return el.closest('.sp-anim-hidden, .sp-anim-only') === null
}

function filterBibBlock(block: HTMLElement, targetIds: Set<string>, slideIds: Set<string>): void {
  let shown = 0
  block.querySelectorAll('li').forEach(li => {
    const id = li.getAttribute('id')
    if (id !== null && targetIds.has(id)) {
      li.classList.remove(HIDDEN_CLASS, ABSENT_CLASS)
      shown++
    } else {
      // Keep space for refs cited later in the steps (`sp-bib-hidden`,
      // visibility) and drop refs not cited anywhere on the slide
      // (`sp-bib-absent`, display none).
      li.classList.add(HIDDEN_CLASS)
      li.classList.toggle(ABSENT_CLASS, id === null || !slideIds.has(id))
    }
  })
  block.classList.toggle(EMPTY_CLASS, shown === 0)
}

export const bibRefinement: SlideRefinement = {
  name: 'bib',
  appliesTo: slideEl => slideEl.querySelector('.sp-bib') !== null,
  apply: slideEl => {
    const blocks = slideEl.querySelectorAll<HTMLElement>('.sp-bib')
    if (blocks.length === 0) return
    // `slideIds`: refs cited anywhere on the slide (any step). `targetIds`:
    // refs cited by a *currently step-visible* citation.
    const slideIds = new Set<string>()
    const targetIds = new Set<string>()
    slideEl.querySelectorAll(CITE_SELECTOR).forEach(a => {
      const href = a.getAttribute('href')
      if (!href?.startsWith('#')) return
      const id = href.slice(1)
      slideIds.add(id)
      if (isStepVisible(a)) targetIds.add(id)
    })
    blocks.forEach(b => filterBibBlock(b, targetIds, slideIds))
  },
}