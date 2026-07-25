
## TODO Now for v0 (0.1.20260725) (no export, no typst)

- [ ] should watch included fragments to refresh hrm
- [ ] test an anim slide that shows then hides then shows etc, see if it works forward and backward and reload
- [ ] proper demo (rework the current one, sync to purrbundle too)
- [ ] add a png/jpg include to test and illustrate cache even if not v0 target

## TODO v1 (1.0.0) (typst simplest syntax)

- [ ] typst v1 with a descent syntax (might consider later the implicit separator approach or a shortcut for commands )
- [ ] typst math
- [ ] typst cetz
- [ ] typst codeblock
- [ ] anim of the typst features, at least minimal line appear, class addition to cetz, ideally itegrate #pause in cetz etc

## TODO v2 (2.0.0) (export)

- [ ] should cache also be in a script text and not in a template? probably
- [ ] nested includes, at toplevel include part that includes slides, path probably wrong currently export async function resolveTopIncludes(
- [ ] pdf export

## TODO typst syntax

- [ ] ponder wether hacking a more compact than #anim('......') would be of any use
- [ ] same for #slide[...] #slide[...] vs ... SOMESEP --- or maybe ... #slide ...

## TOREVIEW

- [ ] cache custom components source too so we can create a self-contained bundle, see ,,discuss-custom-sfc-standalone.md but add the fact that vue says it is embedded so no more bundle size argument? https://www.npmjs.com/package/@vue/compiler-sfc
- [ ] Runtime template caching: cache `defineComponent` results keyed by template string (not full SFC). Measure perf gains before implementing. Useful for non-export dev workflow when navigating back to slides.
- [ ] ^ NB: there are two use of the bundle, one for exported pres, and then can use a compiled component, and another where we just drop the bundle and a simple html file and then we may need to load SFC
- [ ] <sp-pause/> might need (e.g. following) content to be put in a span, not pure text node. This is a limitation of css, but could we detect it (in devmode?) and notify the user?
- [ ] generate a palette of 20 creative themes, named gen1-01 to gen1-20 (for an ambiguous gen meaning generated / genai / generic / generation1), most of which should have a primary and secondary color that is configurable


## TODO

- [ ] add a generic way of having query params to set (on initial load) some config options (like proMode, dark/light, theme name, etc)
- [ ] sp-clicks with no wrapper, also as a directive (in addition)
- [ ] (anim) delay should be dropped when replaying actions (so have a "fast()" like in previous framework) to avoid race conditions
- [ ] (anim) can sp-clicks be converted to @children (if wrapper...) (or even sp-pauses if not but then beware of e.g. a span in ul... so might still benefit from the data-sp-step approach) as a preprocessing like sp-pause? and could it rather be a directive?
- [ ] (perf) do Map based caching of processHtml() (careful, might want a global state... or not in purr... handle it in purryst if any advanced thing... but maybe e.g. a js bibliography would need to be global and not per slide...)
- [ ] (anim) is at=2 intuitive or offset by one? (at=0 intuitively means play right away, at=2 should mean after 2 steps)
- [ ] (anim) along path, viewbox etc
- [ ] (edit) allow adding a drag, setting its background (e.g. a whiteout-ing box) and setting its id (for sp-anim purpose), need to do it html and typst (vite updater) -> maybe it is a custom component that allow this interactivity on itself, need to export/factor edit/replace functionality
- [ ] (edit) allow pasting image, by default added as a drag?
- [ ] (edit) allow changing image path?
- [ ] (edit) can we have a button to "view source" in vs code or something (using some vscode standard extension or api?)
- [ ] (edit) allow chunklets to use a prompt:path in params that can then be used for $path, prompts may be filled from clipboard? to allow an image chunklet, that could be made draggable by default because insert at the end is not so useful.


- [ ] consider a sp-script to avoid closing </script> in the "template"... but do we want script...? when do they get run etc? maybe rather need a very generic anim that accepts code directly?
- [ ] consider a fully async init process (createSlidespurryst) because currently plugins can't do async stuff.
- [ ] consider unocss stuff, can it be with a small footprint?
- [ ] make a demo-minimal-slidespurr.html and demo-minimal-slidespurryst.typ and demo-minimal-purrbundle.html, no plugin, no conf, no theme toggle, starter file (people will copy/adapt from the non minimal to add their own stuff)
- [ ] overview could insert separators when breaking a section (go from h3 to h2, have .sp-overview-leave-h3) to allow css styling (break flow of overview)
- [ ] consider history management (think about when to push)
- [ ] rationalize/think the data-stuff put on sp-presentation, the options passed to create... and potentially some generic data-meta="{ ... }" on sp-presentation, maybe merge some...
- [ ] (typst) integrate show raw.line into the typst theme
- [ ] (typst) show rule to map block onto a div, with explicit attributes (of block) transformed in style in div
- [ ] (typst) drag will not work with multifile input or even loop probably, or function that creates a drag, etc
- [ ] (js) drag will also not work if including a file (already done most of the work but need to add a test and sp-include support)
- [ ] explore if we can rationalize that escaping stuff:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>
- [ ] consider gsap or an alternative (anime.js?) for svg animations or text animations or transitions
- [ ] (typst) (hard) img/svg find a way in typst to make the paths clickable (to go to source) and at the same time properly relative (so need to pass a path... but loose source line etc)
- [ ] extensible slide transitions, handling also the case of non-css animations, typically consider a registry of name->animationhandler, that defines the behavior/attrs of Transition
- [ ] (slidev discord) blackout should not depend on dark/light mode -> currently black, but allow a white version (maybe a small button in the corner, so it allows to draw when on a whiteboard)
- [ ] (slidev discord) delay for anims
- [ ] (slidev discord) allow use of v-motion
- [ ] (slidev discord) allow to play directly the first @anim (at=0?)

## Feature ideas

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] bibliography handling

## Design

- should bibliography exist in no-typst?


