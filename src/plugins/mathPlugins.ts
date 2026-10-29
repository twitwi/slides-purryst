import type { SlidesPlugin } from '../types'

// Turn a `class:foo` label inside MathML into a real CSS class.
//
// Typst renders inline math as MathML; `text("class:start-accent")` inside a
// math expression becomes `<mtext>class:start-accent</mtext>`. This refinement
// strips the `class:` prefix onto the element's class attribute and hides the
// label text (font-size: 0), so a single token inside a formula becomes
// addressable from CSS — e.g. `.start-accent ~ *:not(.end-accent ~ *) { … }`.
export function mathTokenClass(): SlidesPlugin {
  return {
    name: 'math-token-class',
    activate(api) {
      api.addSlideRefinement({
        appliesTo(slideEl) {
          return !!slideEl.querySelector('math mtext')
        },
        apply(slideEl) {
          slideEl.querySelectorAll('mtext').forEach((it) => {
            const txt = it.textContent?.trim() ?? ''
            if (!txt.startsWith('class:')) return
            const c = txt.replace(/^class: */, '')
            ;(it as HTMLElement).style.fontSize = '0'
            it.setAttribute('class', c)
          })
        },
      })
    },
  }
}
