
## NOCOMMIT

Code syntax highlighting — Most technical presentations need this. Could integrate Shiki (same as VitePress) or Prism.js. Natural step since the audience is dev-focused.
Export — Export to PDF (using Puppeteer/Playwright headless) or a self-contained HTML bundle. High value for distribution.
Presenter timer — Clock + elapsed time in presenter sidebar. Simple but useful.
Auto-advance / slideshow mode — Configurable interval, toggle via UI or query param.

From Slidev general (not in ultracharger):
 6. Drawing/annotation — using Drauu (https://github.com/antfu/drauu) for in-presentation drawing. This is one of Slidev's most praised features.
 7. Code highlighting — Shiki (https://shiki.style) integration for <pre><code> blocks. You have the basics but no syntax coloring.
 8. LaTeX math — KaTeX (https://katex.org) for $$...$$ inline/block math.
 9. Click animations — v-click / v-clicks / v-after directives as a simpler alternative to <Anim>. v-click="n" makes elements appear step-by-step.
10. Mermaid diagrams — text-to-diagram with  ``mermaid ` code fences.



## TODO easy

- [ ] in overview mode, esc should leave overview mode
- [ ] introduce the blackout key (b) to blank the main view from presenter mode as in ultracharger
- [ ] add a clock to the presenter view (elapsed time, maybe a countdown timer)
- [ ] have an option cacheIgnore, a pattern to ignore certain paths from the cache (like .gitignore ideally)


## TODO

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] typst side
- [ ] explore if we can rationalize that:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>
- [ ] consider gsap or an alternative (anime.js?) for svg animations or text animations or transitions
- [ ] consider history management (think about when to push)
- [ ] think about modularity/extensibility (plugins, custom components, etc.)


## Design

- should bibliography exist in no-typst?
