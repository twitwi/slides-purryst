
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

## TOREVIEW

- [ ] console.log left in SpAnim.vue

## Done (this round)

- [x] dev:typst compiles once before watching so output exists immediately
- [x] esc leaves overview mode
- [x] blackout key (b) blanks the main preview in presenter mode
- [x] clock in presenter view (elapsed time, updated every second)
- [x] cacheIgnore option in createSlidesPurryst (array of regex patterns)
- [x] bigger buttons for Counter.vue demo component
- [x] loading overlay when parsing hash to prevent first-slide flash
- [x] replaced bash/awk HTML formatter with JS in dev.mjs (handles `<pre>` properly)

## TODO

- [ ] can I have a more generic / extensible way to share synced data and events between views (presenter and main)?
- [ ] can sp-alternative and sp-step be using some similar things as @jump (vis groups)? maybe need to make them show/hide instead of refreshing their visibility at every step?
- [ ] fix/refactor sp-alternative and @jump (vis groups) (animating enter...) + redo anim
- [ ] rationalize/think the data-stuff put on sp-presentation, the options passed to create... and potentially some generic data-meta="{ ... }" on sp-presentation, maybe merge some...
- [ ] install the prettier (dev dep) + integrate in the script
- [ ] on purryst, see why there is a glitch between the two Drag slides -->> TODO FIX the fact that jump(1) is different than pause, and creates some animation
- [ ] should probably better structure so that countAnimSpecParts is more generic
- [ ] integrate show raw.line into the typst theme
- [ ] show rule to map block onto a div, with explicit attributes (of block) transformed in style in div
- [ ] cache custom components too
- [ ] (typst) drag will not work with multifile input or even loop probably, or function that creates a drag, etc
- [ ] (js) drag will also not work if including a file
- [ ] explore if we can rationalize that:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>
- [ ] consider gsap or an alternative (anime.js?) for svg animations or text animations or transitions
- [ ] consider history management (think about when to push)
- [ ] think about modularity/extensibility (plugins, custom components, etc.)
- [ ] (typst) (hard) img/svg find a way in typst to make the paths clickable (to go to source) and at the same time properly relative (so need to pass a path... but loose source line etc)
- [ ] extensible slide transitions, handling also the case of non-css animations, typically consider a registry of name->animationhandler, that defines the behavior/attrs of Transition

## Feature ideas

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)

## Design

- should bibliography exist in no-typst?
