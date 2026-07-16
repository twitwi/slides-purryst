
## TODO Easy

- [ ] test an anim slide that shows then hides then shows etc, see if it works forward and backward

## TODO Now

- [ ] presenter view should not animate next slide!
- [ ] cache custom components source too so we can create a self-contained bundle
- [ ] add a generic way of having query params to set (on initial load) some config options (like proMode, dark/light, theme name, etc)
- [ ] up arrow behavior fix

## TOREVIEW

## TODO

- [ ] anim should allow to delay the start of animation, so that we can have sequences created (play two anims with ^, one with delay)
- [ ] by default, pills should have the same color as the h1, h2, h3 border in the overview, can keep size difference too, the current could be circled in a --sp-highlight color or something
- [ ] check visgroups not working in presenter (but they might go away with the new anim system)
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
