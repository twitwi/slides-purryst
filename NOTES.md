
## TODO Easy

- [ ] test an anim slide that shows then hides then shows etc, see if it works forward and backward and reload

## TODO Now

- [ ] sp-anim should accept at="" (abs or rel), with a default to the current visgroup (based on sp-jumps), accept a boolean (default to false) to tell that each anim step should also do a sp-jump (it is equivalent to the user counting anim steps and adding a relative sp-jump), it should also optionally accept a jump="" that must be relative (error alert if not) to tune the count... or the jump="" can be replace by the user by a sp-jump anyway
- [ ] cache custom components source too so we can create a self-contained bundle, see ,,discuss-custom-sfc-standalone.md but add the fact that vue says it is embedded so no more bundle size argument? https://www.npmjs.com/package/@vue/compiler-sfc
- [ ] add a generic way of having query params to set (on initial load) some config options (like proMode, dark/light, theme name, etc)
- [ ] on live update, previous slide does not get reanimated to the last step, also shiki not rerun
- [ ] refactor rename the next() nextSlide() (actually this last one is nextStep...)
- [ ] sp-clicks with no wrapper, also as a directive (in addition)

## TOREVIEW

- [ ] check effect of pause... see       // Wrap elements after pause in sp-step for unified visibility
- [ ] Runtime template caching: cache `defineComponent` results keyed by template string (not full SFC). Measure perf gains before implementing. Useful for non-export dev workflow when navigating back to slides.
- [ ] ^ NB: there are two use of the bundle, one for exported pres, and then can use a compiled component, and another where we just drop the bundle and a simple html file and then we may need to load SFC
- [ ] <sp-pause/> might need (e.g. following) content to be put in a span, not pure text node. This is a limitation of css, but could we detect it (in devmode?) and notify the user?
- [ ] consider allowing style directly in template (no sp-style) so the editor is better handling it -> done for template>style... further thing can go with sp-slide -> slide, etc.

## TODO

- [ ] (anim) play/pause video
- [ ] (anim) along path, viewbox etc

- [ ] anim should allow to delay the start of animation, so that we can have sequences created (play two anims with ^, one with delay)
- [ ] consider history management (think about when to push)
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
- [ ] (slidev discord) blackout should not depend on dark/light mode
- [ ] (slidev discord) delay for anims
- [ ] (slidev discord) allow use of v-motion
- [ ] (slidev discord) allow to play directly the first @anim (at=0?)

## Feature ideas

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] bibliography handling

## Design

- should bibliography exist in no-typst?


