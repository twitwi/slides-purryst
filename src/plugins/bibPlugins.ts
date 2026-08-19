import { onErrorCaptured } from 'vue'
import type { SlidesPlugin } from '../types'

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

const defaultBibFilteringOptions = {
  BIB_SELECTOR: '.sp-bib',
  CITE_SELECTOR: 'a[role="doc-biblioref"], .sp-bib-cite',
  HIDDEN_CLASS: 'sp-bib-hidden',
  ABSENT_CLASS: 'sp-bib-absent',
  EMPTY_CLASS: 'sp-bib-empty',
}
export type BibFilteringOptions = typeof defaultBibFilteringOptions

const defaultBibCompactorOptions = {
  patch: (r: [string | RegExp, string, string][]) => {}
}
export type BibCompactorOptions = typeof defaultBibCompactorOptions

export function bibCompactor(override: Partial<BibCompactorOptions> = {}): SlidesPlugin {
  const options = Object.assign({}, defaultBibCompactorOptions, override)
  return {
    name: 'bib-compactor',
    activate(api) {
      const replacements = [...builtinReplacements]
      options.patch(replacements as [string | RegExp, string, string][])
      document.querySelectorAll<HTMLTemplateElement>('template[data-sp-cache="biblio.html"]').forEach((el) => {
        const titles = Array.from(el.content.children[0].querySelectorAll('li')).map((el) => el.textContent)
        let v = el.innerHTML
        for  (const [from, to] of replacements) {
          if (typeof from === 'string') {
            v = v.replace(new RegExp(from + `([ ,.])`, 'g'), to + '$1')
          } else {
            v = v.replace(from, to)
          }
        }
        el.innerHTML = v
        titles.forEach((title, index) => {
          el.content.children[0].querySelectorAll('li')[index].setAttribute('title', title)
        })
      })
    }
  }
}

export function bibFiltering(override: Partial<BibFilteringOptions> = {}): SlidesPlugin {
  const options = Object.assign({}, defaultBibFilteringOptions, override)
  return {
    name: 'bib-filtering',
    activate(api) {
      api.addSlideRefinement({
        appliesTo: slideEl => slideEl.querySelector(options.BIB_SELECTOR) !== null,
        apply: slideEl => {
          applySlideRefinement(options, slideEl)
        }
      })
    }
  }
}

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////


// The step system toggles `.sp-anim-hidden` (opacity 0) and `.sp-anim-only`
// (display none) on stepped elements; nested content inherits invisibility.
function isStepVisible(el: Element): boolean {
  return el.closest('.sp-anim-hidden, .sp-anim-only') === null
}

function applySlideRefinement(options: BibFilteringOptions, slideEl: Element) {
  const blocks = slideEl.querySelectorAll<HTMLElement>(options.BIB_SELECTOR)
  if (blocks.length === 0) return
  // `slideIds`: refs cited anywhere on the slide (any step). `targetIds`:
  // refs cited by a *currently step-visible* citation.
  const slideIds = new Set<string>()
  const targetIds = new Set<string>()
  slideEl.querySelectorAll(options.CITE_SELECTOR).forEach(a => {
    const href = a.getAttribute('href')
    if (!href?.startsWith('#')) return
    const id = href.slice(1)
    slideIds.add(id)
    if (isStepVisible(a)) targetIds.add(id)
  })
  blocks.forEach(b => filterBibBlock(options, b, targetIds, slideIds))
}

function filterBibBlock(options: BibFilteringOptions, block: HTMLElement, targetIds: Set<string>, slideIds: Set<string>): void {
  let shown = 0
  block.querySelectorAll('li').forEach(li => {
    const id = li.getAttribute('id')
    if (id !== null && targetIds.has(id)) {
      li.classList.remove(options.HIDDEN_CLASS, options.ABSENT_CLASS)
      shown++
    } else {
      // Keep space for refs cited later in the steps (`sp-bib-hidden`,
      // visibility) and drop refs not cited anywhere on the slide
      // (`sp-bib-absent`, display none).
      li.classList.add(options.HIDDEN_CLASS)
      li.classList.toggle(options.ABSENT_CLASS, id === null || !slideIds.has(id))
    }
  })
  block.classList.toggle(options.EMPTY_CLASS, shown === 0)
}

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

const builtinReplacements = [
  ///////
  ['IEEE Transactions on Pattern Analysis and Machine Intelligence', 'TPAMI', 'venue'],
  ['Association for the Advancement of Artificial Intelligence', 'AAAI', 'venue'],
  ['International Joint Conference on Artificial Intelligence', 'IJCAI', 'venue'],
  ['Conference on Computer Vision and Pattern Recognition', 'CVPR', 'venue'],
  ['International Conference on Learning Representations', 'ICLR', 'venue'],
  ['Advances in Neural Information Processing Systems', 'NeurIPS', 'venue'],
  ['International Conference on Machine Learning', 'ICML', 'venue'],
  ['European Conference on Machine Learning', 'ECML', 'venue'],
  ['European Conference on Computer Vision', 'ECCV', 'venue'],
  ['Neural Information Processing Systems', 'NeurIPS', 'venue'],
  ['Journal of Machine Learning Research', 'JMLR', 'venue'],
  ///////
  ['Artificial Intelligence', 'AI', 'word'],
  ['Proceedings of the', 'Proc.', 'word'],
  ['Transactions', 'Trans.', 'word'],
  ['Conference', 'Conf.', 'word'],
  ['International', 'Int.', 'word'],
  ['Applications', 'Appl.', 'word'],
  ['Mathematical', 'Math.', 'word'],
  ['Engineering', 'Eng.', 'word'],
  ['Letters on', 'Lett.', 'word'],
  ['National', 'Nat.', 'word'],
  ['Physical', 'Phys.', 'word'],
  ['Academy', 'Acad.', 'word'],
]
