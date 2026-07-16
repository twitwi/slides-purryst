
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



## TODO Easy

- [ ] test an anim slide that shows then hides then shows etc, see if it works forward and backward

## TODO Now

- [ ] presenter view should not animate next slide!
- [ ] cache custom components source too so we can create a self-contained bundle
- [ ] have a proper theme, with a switch between dark and light (key 'd', unless proMode is on), a default associated to the pres, and a default associated to the typst theme (future), a button in the popup of the toolbar
- [ ] add a generic way of having query params to set (on initial load) some config options (like proMode, dark/light, theme name, etc)

## TOREVIEW


## TODO

- [ ] consider history management (think about when to push)
- [ ] consider removing prettier dependency then
- [ ] can sp-alternative and sp-step be using some similar things as @jump (vis groups)? maybe need to make them show/hide instead of refreshing their visibility at every step?
- [ ] fix/refactor sp-alternative and @jump (vis groups) (animating enter...) + redo anim
- [ ] rationalize/think the data-stuff put on sp-presentation, the options passed to create... and potentially some generic data-meta="{ ... }" on sp-presentation, maybe merge some...
- [ ] should probably better structure so that countAnimSpecParts is more generic
- [ ] (typst) integrate show raw.line into the typst theme
- [ ] (typst) show rule to map block onto a div, with explicit attributes (of block) transformed in style in div
- [ ] (typst) drag will not work with multifile input or even loop probably, or function that creates a drag, etc
- [ ] (js) drag will also not work if including a file
- [ ] explore if we can rationalize that escaping stuff:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>
- [ ] consider gsap or an alternative (anime.js?) for svg animations or text animations or transitions
- [ ] think about modularity/extensibility (plugins, custom components, etc.)
- [ ] (typst) (hard) img/svg find a way in typst to make the paths clickable (to go to source) and at the same time properly relative (so need to pass a path... but loose source line etc)
- [ ] extensible slide transitions, handling also the case of non-css animations, typically consider a registry of name->animationhandler, that defines the behavior/attrs of Transition

## Feature ideas

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] bibliography handling

## Design

- should bibliography exist in no-typst?
