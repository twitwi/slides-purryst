
## NOCOMMIT

compact
push to save

Code syntax highlighting — Most technical presentations need this. Could integrate Shiki (same as VitePress) or Prism.js. Natural step since the audience is dev-focused.
Export — Export to PDF (using Puppeteer/Playwright headless) or a self-contained HTML bundle. High value for distribution.
Presenter timer — Clock + elapsed time in presenter sidebar. Simple but useful.
Auto-advance / slideshow mode — Configurable interval, toggle via UI or query param.


Great references. Here's what ultracharger offers and what would fit nicely into slides-purryst:
From ultracharger specifically:
3. Blackout key (b key) — blanks the main view from presenter mode. Simple but useful.
From Slidev general (not in ultracharger):
 6. Drawing/annotation — using Drauu (https://github.com/antfu/drauu) for in-presentation drawing. This is one of Slidev's most praised features.
 7. Code highlighting — Shiki (https://shiki.style) integration for <pre><code> blocks. You have the basics but no syntax coloring.
 8. LaTeX math — KaTeX (https://katex.org) for $$...$$ inline/block math.
 9. Click animations — v-click / v-clicks / v-after directives as a simpler alternative to <Anim>. v-click="n" makes elements appear step-by-step.
10. Mermaid diagrams — text-to-diagram with  ``mermaid ` code fences.

NB:
- have only @jump() in the core
- have helpers like <sp-pause> for purr
- make it somewhat clear what is purr-core (targeted by purryst) and what is purr-sugar


## TODO easy

- [ ] when dragging draggable, disable touch nav
- [ ] when dragging draggable, arrow keys move the draggable, not the slides
- [x] in the overview, disable slide mouse events
- [ ] sp-drag put the handles around the object (currently it may conflict with the scrollbars) --> actually outside the border it should be
- [x] presenter when changing slide also update the main view (vice versa is already done)
- [x] presenter view button detect when the presenter closes the view to update the state
- [x] toolbar show pills with different styles (whether h1 h2 h3 containing slides)
- [x] toolbar manage something when there are too many pills, maybe beyond 20 pills, show first-pills...pills(incl current)...last-pills (with proper handling of side effects)
- [x] integrate shiki, report on increase in bundle size
- [x] make a target for the lib that is single file (include dependencies like vue), even the css, for use as a single js script src="..."

## TODO

- [ ] why is the export inlinesvg not scaling with sp-drag (slide 15)
- [ ] export as standalone single file, by serializing the cache inside the main file (to not have dependency on the includes)
- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] typst side
- [ ] build and provide a toc-like data structure so slides can use it (see how done already for goto/search)
- [ ] come back to fixing step and last slide behavior of left button in the nav bar
- [ ] ensure scalable styles e.g. TOC, so that if I wrap it changing the font size, it adapts
- [ ] explore if we can rationalize that:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>
- [ ] consider gsap or an alternative (anime.js?) for svg animations or text animations or transitions
- [ ] consider history management (think about when to push)

## Design

- should the TOC handling exist in no-typst? (js is best for linking etc, it has the slide numbers etc, but typst might be best for the rest...)
- should bibliography exist in no-typst?
