
# NEXT

- [ ] rework list of todos
- [ ] typst option to add #slide-bib to all slides (it is hidden if empty anyway)
- #anim("-#focus, #formula", at: "0") creates a js error (why? and why not resurfaced?)
- on reload of the same without at, Uncaught SyntaxError: missing variable name, got string literal _S http://127.0.0.1:9999/slides-purryst.bundle.js:62 xS http://127.0.0.1:9999/slides-purryst.bundle.js:62 <anonymous> http://127.0.0.1:9999/index.html#8/1:667
- [ ] doc consider adding adding "    "dev": "pnpm exec slides-purryst index.typ"    " to package json
- [ ] UX, add a class option (and id) to drag (and most wrappers too? and also a style maybe (string or dictionary))


- [ ] consider renaming at:"" for draggable, it conflicts (in the mind) with sp-step "at" etc, ... maybe pos:""
- [ ] might get some perf issues if all svg elements get class sp-anim-shown etc (have a way to not recururse?)
- [ ] emoji fix should tag as emoji
- [ ] toc shows empty in overview at first?
- [ ] to document: the fact that #svg can take a string or a typst path() (needed for non-html output)
- [ ] perf: should parse html only once per slide, and for the overview, do render, capture as png (possible ?), do it slide by slide so we never have all slides rendered at once (need png cache busting if theme changes)

# while rationalizing

- [ ] can typst chunklets be generated without preprocess? same for cache? same for config? do we need to remove comments, do we risk loosing new lines like that?


# todo rationalize parsing etc

- [ ] document and rationalize processing steps (typst preprocess, typst, html reformat, sp-content parsing, slide html parsing, more?)
- [ ] check the use of wrapPage because this might be duplicate? one might want to have a custom main.typ like and keep its stuff...
- [ ] consider moving #A as post processing 
- [ ] rationalize also the format (#sp-content, #sp-chunklets, [data-sp-cache-...], #sp-cache #sp-presentation)
- [ ] sp-step and the more generic produced data-sp-step-from etc can be restrictive. If DOM tag kept, consider more generic alt like data-sp-visible-at="2,3,4,5,8,9" ... or a list of list ="[[3, 6], [8,10]]"
- [ ] if sp-init found, maybe the include can automatically createSlidesPurryst()  (guard it still, allow setting a thing to disable).... or can the typst generate the proper call to createSlidesPurryst
- probably need to allow an open conf (authors... presenter... etc), probably ok as pure typst if to json handles all
- title should propagate to tab name, also allow tab (for tab name, if provided)
- propably distinguish config (really pure deck config like size etc) from metadata? e.g. presenter (mode) vs presenter (who presents)
- consider having a res/ folder that is containing all the things than can be copied, this might include typst sources, and a minimal script that preproc/typst/postproc... and a command line --copy or --detach or something, that shows a miniinterface asking what to detach, with some small 1 line to say what they are
- ^^^^ currently nunito.css is ugly (js packed)... maybe related but the bundle looks for ugly font paths also
- [ ] if not the case plugins get a call for init, before anything has appened (same as typst js:""
- [ ] typst should allow providing an activate and a list of plugins
- [ ] plugin packs: a factory that produces a plugin that is a list of plugins from the built in ones (or others but how to lazy include in some way?)
- [ ] (typst) add a "raw" that will dump html string as cache, and sp-include it
- [ ] v-drag and #drag do some rounding (integer design pixel?)
- [ ] #drag, handle at:"" too and maybe even missing no at: .... or at the opposite make it generic to just look for at: (maybe already doing that, so we can drag other thing?) 

## todo v2 (2.0.0) consolidate internals, potential breakage

- [ ] (demo(s)) check overflow (TOC mainly?)
- [ ] Track useless recomputes (loopy + process html only once + overview+liveupate=memhog)
- [ ] when updating, the symlink (slides-purryst) is not updated on run, causing issues, should automatically update (if symlink) and warn it did
- [ ] same when adding a file (it is not seen...), typically the bib

## TODO v3 (3.0.0) (polish and plugins?)

- [ ] (overview) put the slide number on the side/outside of the slide, or maybe ensure visible
- [ ] (chunklets) show "no chunklet" instead of nothing when bar is shown
- [ ] (typst) can we have a typst-based preview in tinymist etc... at least view all slides allow clicking etc (when?)
- [ ] (typst) codeblock improve demo, wrap each line (show rule) to animate... actually suggest a @child(ul, 1) etc in anim
- [ ] (typst) do we really need a specific codeblock or is raw sufficient in the end?
- [ ] (typst) maybe a cetz/gribouille example
- [ ] (typst) separator to break slides (to avoid ] #slide[ but don't get too far, we're not redoing a markdown either)
- [ ] (chunklets) for $x,$y do not allow drag, just click
- [ ] (chunklets) allow ${x} to avoid patterns like calc($x * 1px)
- [ ] (chunklets) allow some shortcut to easily loop/add several ones
- [ ] (chunklets) allow chunklet groups/folders, so a plugin can contribute a "flags" group with many flags, with proper ux
- [ ] consider #svg (and sp-svg) to behave by default exactly like #img, at least in a #drag
- [ ] (export) allow links (e.g. TOC) in pdfs
- [ ] (export) allow e.g. $sp.slideIndex in slides to actually take the right value when fixing the step (pass/inject a wrapper?) 
- [ ] consider propagating the global theme / classes (param of create?) to all sp-slides that don't have "no-gt" (attribute instead of class?)
- [ ] footer should probably be in all slides, maybe <sp-inside (like before and after), simpler for styling, and for export too
- [ ] can we class-tag in lilaq somewhat?
- [ ] anim some @child with negative for disappear @child(-ul, 1), handle empty in range @child(ul,1,) @child(ul,,3) and also negative indexing etc (and maybe step?), maybe with a python syntax then @child(ul, 1:-1)... maybe start at 0 for this one? think...
- [ ] 'g' when typing a number, show the corresponding slide as preview + also search for the number in the slide title
- [ ] sp-dev .typ should allow specifying the generated path (or maybe default to ,,sp-generated/${inputpathhash}/) -> done but need to try 2 entry points
- [ ] @rewind or @pause(,rewind) (if not present) + show demo like "@pause(,rewind)|@play|@pause"
- [ ] html-export looses attributes on sp-slides (transitions)
- [ ] add a cli command to "slides-purryst update" (to update if latest or if the tag moved) and "upgrade" to suggest a list of versions (with change log (from the github README.md) and allow to select one to upgrade to, incl. latest)
- [ ] better ignore in vue config, because currently, unless using the dev files demo- or index.html.... the full refresh is triggered... should we ignore all as we watch explicitly the location of interest? or keep src etc?
- [ ] add a png/jpg include to test and illustrate cache
- [ ] overview scroll current slide into view, and highlight even more
- [ ] esc should quit devpane
- [ ] add slugs/tags to slides (one tag can have multiple slugs) so we can link between slides in a semantic manner, allow jumping to next occurrence of a tag, or previous etc (e.g. can allow a custom end-of-section tag)
- [ ] why are subparts etc shown as 0 Bytes in the dev tools?
- [ ] should cache also be in a script text and not in a template? probably
- [ ] add a toc in the overview somewhat
- [ ] plugin should be able to contribute to a shared state (like source in demo) or a shared saved (localstorage) state, check that the is properly reactive intially (pb with source in sp-after, has undefined value for transform at first template render, should not need a "set timer")
- [ ] (typst) chunklets and cache actually as typst, not a preprocess?
- [ ] video add a seek action


## TODO v3 (3.0.0) (better presenter and authoring features)

- [ ] (presenter) laser pointer / cursor replication
- [ ] easy nice way to add a background images? with extensions that can parse slides dataset (data-)?
- [ ] unocss integration?
- [ ] have a way to specify a cascade of delays, simplify .da1 ^ 1s .da2 ^ 2s .da3 etc or even a delay children or something.
- [ ] notes with click markers like slidev, maybe not the same syntax, maybe closer to sp-pause
- [ ] insert images from some sites? or generators (sana?)? no, rather have an easy import from clipboard/url
- [ ] (live) have a mode where each text change (character) is sent as a text update to the client, so it can just replace the content... or maybe there is a notion of current slide (visible) and updates to this slide only are sent, with a very fast round trip update
- [ ] chunklet/draggable demo: add some font-size varying things, like https://stackoverflow.com/questions/16056591/font-scaling-based-on-size-of-container could also have post-hoc controllable params in chunklets, maybe not too "componenty" so using data-param-size.1.100="..." (controlled by a slider or something) and used in the chuncklet style="font-size: calc(var(--param-size) * 1vw)" ... reimplementing components here? maybe directly work with components, orthogonal to chunklets: if a component has a v-conf="{size: [1, 100]}" then it gets a slider to control its value :size="42"... need to resurface up to typst also
- [ ] have a configurable default, i.e. all <sp-drag> inherit a v-conf={x,y,w,h} etc
- [ ] csl discuss + doc plugin https://editor.citationstyles.org/visualEditor/


## TODO typst syntax

- [ ] ponder wether hacking a more compact than #anim('......') would be of any use (probably not)
- [ ] same for #slide[...] #slide[...] vs ... SOMESEP --- or maybe ... #slide ...

## TOREVIEW

- [ ] export from CLI? still using the ?print route
- [ ] export: pnx decktape
-             rm -rf ~/.cache/puppeteer/
-             pnx puppeteer browsers install chrome
-             pnx decktape http://localhost:3334/example/demo-slidespurryst.html ,,test.pdf

- [ ] wrapping the sp-alternatives at="0" cycle in a div actually changes semantics!!!
- [ ] should sp-step hide animation="scale"
- [ ] cache custom components source too so we can create a self-contained bundle, see ,,discuss-custom-sfc-standalone.md but add the fact that vue says it is embedded so no more bundle size argument? https://www.npmjs.com/package/@vue/compiler-sfc
- [ ] Runtime template caching: cache `defineComponent` results keyed by template string (not full SFC). Measure perf gains before implementing. Useful for non-export dev workflow when navigating back to slides.
- [ ] ^ NB: there are two use of the bundle, one for exported pres, and then can use a compiled component, and another where we just drop the bundle and a simple html file and then we may need to load SFC
- [ ] <sp-pause/> might need (e.g. following) content to be put in a span, not pure text node. This is a limitation of css, but could we detect it (in devmode?) and notify the user?
- [ ] generate a palette of 20 creative themes, named gen1-01 to gen1-20 (for an ambiguous gen meaning generated / genai / generic / generation1), most of which should have a primary and secondary color that is configurable
- [ ] investigate if we can have a rewrite of steps/anim that is compile-free, more precisely, can we e.g. imagine a vue component that creates/uses sp-steps sp-anim etc (currently most of the work is at compile time), and a kind of step manager (at the slide level?) that monitors the dom to actually define steps (and count etc)
- [ ] 4. getSourceFileFromDOMLocation processes pushes from ALL descendants of siblings (LOW, pre-existing)
src/composables/resolveIncludes.ts:101 — s.querySelectorAll(ofInterest).forEach(process) inside the sibling loop finds [data-source-file-push] across the entire subtree of each preceding sibling, including pushes from later slides (same file, harmless duplicates). Pre-existing issue, not introduced by these changes.


## TODO

- [ ] (anim) can we avoid double parsing (for counting steps and for actually running the anim) of the spec? Can we make right away the list(s)
- [ ] (anim) sp-steps should probably have an option to recurse n levels
- [ ] add a generic way of having query params to set (on initial load) some config options (like proMode, dark/light, theme name, etc)
- [ ] sp-steps with no wrapper, also as a directive (in addition)
- [ ] (anim) can sp-steps be converted to @children (if wrapper...) (or even sp-pauses if not but then beware of e.g. a span in ul... so might still benefit from the data-sp-step approach) as a preprocessing like sp-pause? and could it rather be a directive?
- [ ] (perf) do Map based caching of processHtml() (careful, might want a global state... or not in purr... handle it in purryst if any advanced thing... but maybe e.g. a js bibliography would need to be global and not per slide...)
- [ ] (anim) is at=2 intuitive or offset by one? (at=0 intuitively means play right away, at=2 should mean after 2 steps)
- [ ] (anim) along path, viewbox etc
- [ ] (edit) allow adding a drag, setting its background (e.g. a whiteout-ing box) and setting its id (for sp-anim purpose), need to do it html and typst (vite updater) -> maybe it is a custom component that allow this interactivity on itself, need to export/factor edit/replace functionality
- [ ] (edit) allow pasting image, by default added as a drag?
- [ ] (edit) allow changing image path?
- [ ] (edit) can we have a button to "view source" in vs code or something (using some vscode standard extension or api?)
- [ ] (edit) allow chunklets to use a prompt:path in params that can then be used for $path, prompts may be filled from clipboard? to allow an image chunklet, that could be made draggable by default because insert at the end is not so useful.


- [ ] consider a sp-script to avoid closing </script> in the "template"... but do we want script...? when do they get run etc? maybe rather need a very generic anim that accepts code directly?
- [ ] consider unocss stuff, can it be with a small footprint?
- [ ] overview could insert separators when breaking a section (go from h3 to h2, have .sp-overview-leave-h3) to allow css styling (break flow of overview)
- [ ] consider history management (think about when to push), typically must be able to do back when clicking a internal link (like in a toc), but not sure for every slide step though
- [ ] rationalize/think the data-stuff put on sp-presentation, the options passed to create... and potentially some generic data-meta="{ ... }" on sp-presentation, maybe merge some...
- [x] (typst) integrate show raw.line into the typst theme — codeblock uses `it.lines` in a `show raw` rule, emitting `span.cb-line` children (whole-text highlight, no JS)
- [ ] (typst) show rule to map block onto a div, with explicit attributes (of block) transformed in style in div
- [ ] (typst) drag will not work with multifile input or even loop probably, or function that creates a drag, etc
- [ ] (js) drag will also not work if including a file (already done most of the work but need to add a test and sp-include support)
- [ ] explore if we can rationalize that escaping stuff:     <h3>Explicit <code>&amp;lt;sp-step from="..."></code></h3>
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


