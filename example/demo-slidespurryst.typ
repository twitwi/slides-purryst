#import "slides-purryst/lib.typ": *
#import "slides-purryst/integrations.typ": *
#import "@preview/cetz:0.3.3"
#import "@preview/lilaq:0.6.0" as lq

// ============================================================
// Global init (#sp-init): config/css/js consumed at boot
// Emitted as a <script id="sp-init"> payload;
// #sp-init-defs() is auto-appended by the preprocessor.
// ============================================================
#let cfg = (
  //theme: "conference",
  variants: "is-bib-accent is-bib-ellipsis",
  speaker: "Bob Cat",
)
#sp-init(
  config: cfg,
  css: "html.theme-simple { --sp-scale: .97; }",
  js: "console.log('Will init SlidesPyrryst')",
  js-mounted: "console.log('SlidesPurryst mounted with', window.__sp__.total, 'slides')",
)

// ============================================================
// Helper: colored boxes (from HTML demo's eg-* pattern)
// ============================================================
#let dbox(body, hue: 220, class: none) = context {
  let colors = (
    "0":   (fill: "#f7c5c5", stroke: "#823636", text: "#411e1e"),
    "60":  (fill: "#f7f7c5", stroke: "#828236", text: "#41411e"),
    "120": (fill: "#c5f7d5", stroke: "#368252", text: "#1e4123"),
    "180": (fill: "#c5f7f7", stroke: "#368282", text: "#1e4141"),
    "220": (fill: "#c5d3f7", stroke: "#364982", text: "#1e2341"),
    "240": (fill: "#d5c5f7", stroke: "#483682", text: "#231e41"),
    "270": (fill: "#e4c5f7", stroke: "#633682", text: "#321e41"),
    "300": (fill: "#f7c5f7", stroke: "#823682", text: "#411e41"),
  )
  let c = colors.at(str(hue), default: (fill: "#c5d3f7", stroke: "#364982", text: "#1e2341"))
  if target() == "html" {
    let attrs = (style: "background: " + c.fill + "; border: 2pt solid " + c.stroke + "; color: " + c.text + "; padding: 0.3em; border-radius: 6pt;")
    if class != none { attrs.insert("class", class) }
    html.elem("div", attrs: attrs)[#body]
  } else {
    block(fill: rgb(c.fill), inset: 0.3em, radius: 6pt, stroke: 2pt + rgb(c.stroke))[#text(fill: rgb(c.text))[#body]]
  }
}

// Shorthand for colored step boxes
#let stepbox(body, hue: 220) = dbox(body, hue: hue, class: "d" + str(hue))

// ============================================================
// Global style (from HTML demo's style section at top)
// ============================================================
#style("
  :root {
    --sp-scale: .95;
  }
  kbd { border: 5px solid var(--sp-accent-2) ; border-radius: .2em ; background: var(--sp-bg-3); padding: 0 .2em; margin: 0 0.2em; }
  .eg-natural { display: inline-block; }
  .eg-fill { position: absolute; inset: 0; }
  .eg-center { display: flex; align-items: center; justify-content: center; }
  .eg-textcenter { text-align: center; }
  .eg-small { font-size: 0.7em; color: var(--sp-gray-700); }
  .eg-spec {
    margin: 0.5em 1em;
    padding: 0.5em;
    font-family: var(--sp-font-mono, monospace);
    background: var(--sp-bg-3);
    border: 5px solid var(--sp-gray-400);
    border-radius: 10px;
  }
  .sp-badge {
    font-family: var(--sp-font-mono, monospace);
    font-size: 0.7em;
    padding: 0.1em 0.5em;
    border-radius: 4px;
    background: color-mix(in srgb, var(--sp-accent, #8b5cf6) 15%, transparent);
    color: var(--sp-accent, #8b5cf6);
    border: 3px solid color-mix(in srgb, var(--sp-accent, #8b5cf6) 30%, transparent);
  }
  .demo-items>* { padding: 0.25em 1em; border-radius: 6px; margin: 0.25em 0; }
  .eg-inlinechildren {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: .35em;
  }
  .demo-items>*:nth-child(1), .d240 { --hue: 240; }
  .demo-items>*:nth-child(2), .d120 { --hue: 120; }
  .demo-items>*:nth-child(3), .d0 { --hue: 0; }
  .demo-items>*:nth-child(4), .d180 { --hue: 180; }
  .demo-items>*:nth-child(5), .d60 { --hue: 60; }
  .demo-items>*:nth-child(6), .d300 { --hue: 300; }
  .d1 { --hue: 240; }
  .d2 { --hue: 120; }
  .d3 { --hue: 0; }
  .d4 { --hue: 180; }
  .d5 { --hue: 60; }
  .d6 { --hue: 300; }
")

// ============================================================
// 1. Welcome
// ============================================================
#slide[
  #h1[SlidesPurr(yst)]

  Where Typst meets Vue in purr-fect harmony.

  #p(style: "color:#64748b;font-size:0.9em")[Arrow keys or Space to navigate]

  NB: this demo file is using Typst
]

// ============================================================
// 2. Notes & Disclaimer
// ============================================================
#slide(no-toc: true)[
  = Notes and Disclaimer: welcome to

  #drag(rbox: "1408|33|468|183|0")[
    #img(src: path("./slides-purryst-banner-sticker.svg"))
  ]

  - This presentation acts as
    - a tutorial/demo
    - a documentation
    - an informal test suite
  - This presentation is NOT:
    - a starter template (use #component("code", [demo-minimal-slidespurr.html]) for that)
    - a showcase of the typst version (it is Typst)
    - meant to be visually polished (it illustrates features)

  #p(class: "eg-small")[
    NB: You can see the source code
  ]

  #anno(".eg-small")
  - in the source typst file #mark(".bullet-square")
  - for individual slides, by pressing #component("kbd", [S])

  #style(":has(>.bullet-square) { list-style: square; }")
]

// ============================================================
// 3. TOC
// ============================================================
#slide(no-toc: true)[
  = Here is TOC (table of contents)


  #drag(rbox: "865|631|272|172|-42.3",
  [#anno(".fit-h")#svg(src: path("./slides-purryst-banner.svg"))]
  )

  #drag(rbox: "565|631|272|172|-42.3",
  anno(".fit-h2", svg(src: path("./slides-purryst-banner.svg")))
  )

  #drag(rbox: "265|631|272|172|-42.3",
  [#anno(".fit-h", svg(src: path("./slides-purryst-banner.svg")))]
  )

  #toc(end: "2")

#style("
.sp-include.fit-h svg, .fit-h { background: chartreuse; }
.sp-drag.fit-h, .sp-drag-content.fit-h { outline: 10px solid red; }
")
]

// ============================================================
// 4. Slide Transitions
// ============================================================
#slide[
  = Slide Transitions

  #div(class: "eg-center", [Do not overuse...])

  Transitions don't necessarily improve the presentation, they are possible but should be used sparingly, only when they add value to the content.
]

#slide[
  == Transition Options

  Per-slide transitions via `transition` parameter.

  - `none` — default
  - `fade` — opacity fading
  - `slide-up` — vertical slide
  - `zoom` — scale in/out

  A `transition` option to `createSlidesPurryst` serves as default.
]

#slide(transition: "fade")[
  == This one is "fade"

  #img(src: path("./slides-purryst-banner.svg"))

  Next is "slide-up".
]

#slide(transition: "slide-up")[
  == This one is "slide-up"

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")

  Next is "zoom" (with 600ms, i.e. longer animation).
]

#slide(transition: "zoom", transitionDuration: "600")[
  == This one is "zoom" (with 600ms)

  #img(src: path("./slides-purryst-banner.svg"))

  Next is "fade" (with 100ms).
]

#slide(transition: "fade", transitionDuration: "100")[
  == This one is "fade" (with 100ms)

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")
]

// ============================================================
// 5. Navigation
// ============================================================
#slide[
  = Navigation, basic features and shortcuts
]

#slide[
  == Keyboard Navigation #step(from: "1")[(please try)]

  #let kbd = c.with("kbd")

  - #kbd([→]) / #kbd([Spc]) / swipe: advance the presentation
  - #kbd([←]): backward
  - #kbd([↓]) (next) / #kbd([↑]) (previous) slide (skip steps)
  - #kbd([A]) / #kbd([Z]): prev/next slide's end
  - #kbd([G]): Open goto popup (number, header content)
  - #kbd([O]): Toggle overview

  More shortcuts

  - #kbd([F]): Toggle fullscreen
  - #kbd([B]): Trigger blackout

  #drag(rbox: "956|672|828|204|0")[
    #div(class: "eg-small", [
      In this presentation
      - #kbd([T]): Toggle theme (TODO)
      - #kbd([S]): Toggle slide source view (TODO)
    ])
  ]
]

#slide[
  == Presenter View and Slide Notes

  Use `sp-notes` to add notes to a slide.

  Use key #c("kbd", "p") (or the toolbar at the bottom) to toggle presenter view.

  #notes[
    = Notes for this slide

    These notes are only visible in presenter view.

    You can add any content here, including images and lists.
  ]
]

// ============================================================
// 6. Some interesting features
// ============================================================
#slide[
  = Some interesting features
]

#slide[
  == A Table of Contents

  One can have a "local" TOC showing only a section context.

  #toc(start: "3", ctx: true)

  #drag(rbox: "1202|62|525|961|0")[
    #div(style: "font-size: 25px; border: 5px solid gray; background: var(--sp-bg-2); padding: 10px; position: absolute; inset: 0; overflow: scroll;", [
      #h4[Full TOC]
      #toc()
    ])
  ]
]

#slide[
  == Draggable Elements

  In dev mode:

  - select with #component("b", [double click])
  - move and resize
  - validate by deselecting
  - the changes are saved to the source
  - as a #component("code", [rbox="..."]) attribute

  #drag(rbox: "1263|393|496|464|31.9")[
    #div(style: "display:inline-block;text-align:center;--eg-hue:270;padding:0.5em 1em;border-radius:6px;background: lch(60 40 var(--eg-hue));")[Draggable box (natural size)]
  ]

  #drag(rbox: "", svg(src: path("./unrolled-sindy-a.svg"), width: "100%", height: "auto"))
  #pause

  #drag[#div(style: "background: rgb(255 255 0 / 0.5);")[stuff]]

  #drag(rbox: "862|609|683|354|-15")[
    #div(style: "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;--eg-hue:120;background:lch(60 40 var(--eg-hue));")[One more box (fill and center+vcenter)]
  ]
]

#slide[
  == Draggable 2 (test)

  Same locations, should not blink, also should move the right one.

  #drag(rbox: "887|284|642|283|0")[
    #div(style: "display:inline-block;text-align:center;--eg-hue:270;padding:0.5em 1em;border-radius:6px;background:lch(90 40 var(--eg-hue));")[Draggable box (natural size)]
  ]

  #drag(rbox: "953|515|892|184|23.8")[
    #div(style: "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;--eg-hue:120;background:lch(90 40 var(--eg-hue));")[One more box (fill and center+vcenter)]
  ]

]

// ============================================================
// Chunklets (definitions) (bodies are Typst markup, captured raw)
// ============================================================
#chunklet("X-mark", params: "x,y")[
  #div(style: "position:absolute; left:calc($x * 1px - 1em); top: calc($y * 1px - 1em); width: 2em; height: 2em; color:var(--sp-accent); font-size:0.8em; display:flex; align-items:center; justify-content:center;")[X]
]

#chunklet("Draggable Box", params: "x,y,w,h")[
  #drag(rbox: "$x|$y|$w|$h|0")[
    #div(style: "position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:var(--sp-bg-2); border-radius:0.25em; border: 5px solid var(--sp-border)")[Drag me]
  ]
]

#slide[
  == Chunklets

  Press #component("kbd", [C]) to toggle the chunklet toolbar, then click a chunklet and click or drag on the slide to insert it.

  Chunklet bodies are Typst markup: the preprocessor captures them verbatim, and placing one writes the snippet back into the source.

]

#slide[
  == Inline SVG (styleable, animatable)

  Move your mouse on the cat.

  #svg(src: path("./slides-purryst-banner-sticker.svg"), height: "400px")

  #style("
    svg #cat:not(:hover) { filter: blur(5px); }
    svg #cat:hover #catfill { fill: yellow; }
  ")

  #drag(rbox: "1176|227|707|288|33.2")[
    Draggable cat
    #svg(src: path("./slides-purryst-banner-sticker.svg"), wrap: true, class: "smallcat")
  ]
]

// ============================================================
// 7. Animations Overview
// ============================================================
#slide[
  = Animations: 1. Overview
]

#slide[
  == Animations: principles

  - "animations" is what happens when we step (with left/right/space/swipe)#steps[like *that*] #steps([ _or_], [ that])
  - we call each step a *step*!
  - SlidesPurryst unifies several approaches to animations
  - inspiration is taken from past and current frameworks like Slidev and Touying
  - the core system tries to follow the ancestor of SlidesPurr, the Slidev addon "Ultracharger"

  #pause
  The next sections show how to use these approaches in practice.
]

#slide[
  == Animations: multiple ways

  Depending on use cases and preferences, the best approach may vary:

  - sometimes, we just want to have bullet points appear one by one
  - sometimes, we want to say which block appears when
  - sometimes, we want to animate elements in a custom sequence

  #pause

  The approaches can be combined in a presentation and within a slide.
]

// ============================================================
// 8. Slidev-style step/steps
// ============================================================
#slide[
  = Animations: 2. Animate like in Slidev
]

#slide[
  == Explicit step

  `step` declares when its content appears.

  Always visible.

  #step(from: "1")[#stepbox[Step 1]]
  #step(from: "2")[#stepbox[Step 2]]
  #step(from: "3")[#stepbox[Step 3]]

  Always visible.

  #step(from: "3")[#stepbox(hue: 0)[Step 3 too.]]

  #p(class: "eg-small")[NB: step only handles its content, independently of other concepts.]
]

#slide[
  == step with animation presets (or hide)

  Elements can animate with some presets:

  #step(from: "1", animation: "fade")[#dbox([Fade in], hue: 240)]
  #step(from: "2", animation: "up")[#dbox([Slide up], hue: 120)]
  #step(from: "5", hide: true)[#dbox([Hidden (no space)], hue: 60)]
  #step(from: "3", animation: "left")[#dbox([Slide left], hue: 0)]
  #step(from: "4", animation: "scale")[#dbox([Scale in], hue: 180)]

  #p(class: "eg-small")[Presets: fade, up, down, left, right, scale, none.]
]

#slide[
  == step with also modifier

  Elements can share timing with the previous step:

  #step(from: "1")[#dbox([Step 1 (first)], hue: 240)]
  #step(also: true)[#dbox([Step 1 (same timing)], hue: 240)]

  #div(style: "display: flex; gap: 1em;")[
    #step(from: "2")[#dbox([Step 2], hue: 120)]
    #step(also: true)[#dbox([... also Step 2], hue: 120)]
  ]

  This avoids repeating the same timing for multiple elements.
]

#slide[
  == step with range visibility

  Elements can be visible only in a range of steps:

  #step(from: "1", to: "2")[#dbox([Visible at steps 1-2], hue: 240)]
  #step(from: "3")[#dbox([Visible from step 3], hue: 120)]
  #step(from: "0", to: "1")[#dbox([Visible at steps 0-1 (to=1)], hue: 60)]
  #step(from: "0", until: "2")[#dbox([Visible at steps 0-1 (until=2)], hue: 60)]

  #p(class: "eg-small")[#step from/to use inclusive ranges; #step from/until use exclusive end.]
]

#slide[
  == steps — children one by one

  `steps` is like wrapping every child with `step`, sequentially appearing:

  #steps[
    #dbox([Item 1 (S.1)], hue: 240)
    #dbox([Item 2 (S.2)], hue: 120)
    #dbox([Item 3 (S.3)], hue: 0)
  ]

  Enter animation via `animation: "fade"`:

  #steps(animation: "fade")[
    #dbox([Fades in (S.4)], hue: 180, class: "d4 inline")
    #dbox([Fades in (S.5)], hue: 60, class: "d5 inline")
    #dbox([Fades in (S.6)], hue: 300, class: "d6 inline")
  ]
  #style(".inline {display:inline}")
]

#slide[
  == steps with options

  With `every: "2"` and `at: "1"`:

  #steps(every: "2", at: "1")[
    #dbox([Items 1 (step 1)], hue: 240)
    #dbox([Items 2 (step 1)], hue: 240)
    #dbox([Items 3 (step 2)], hue: 120)
    #dbox([Items 4 (step 2)], hue: 120)
    #dbox([Items 5 (step 3)], hue: 0)
  ]
]

#slide[
  == alternatives — Swap content

  `alternatives` shows children one by one (or cycles if `cycle: true`):
  #alternatives(at: "0", [cycle: 🌕], [cycle: 🌑])#alternatives(at: "0", cycle: true, [; no cycle: 🌕], [; no cycle: 🌑])

  #alternatives(cycle: true)[
    #div(style: "background:#dbeafe;color:#1e40af;padding:0.5em;border-radius:6px")[Alternative 1 (step 0, 3, ...)]
    #div(style: "background:#dcfce7;color:#166534;padding:0.5em;border-radius:6px")[Alternative 2 (step 1, 4, ...)]
    #div(style: "background:#fef9c3;color:#653416;padding:0.5em;border-radius:6px")[Alternative 3 (step 2, 5, ...)]
  ]

  #jump("0")

  It can start delayed (with e.g. #component("code", [at: "2"])).

  #alternatives(at: "2")[
    #span(style: "background:#dbeafe;color:#1e40af;padding:0.5em;border-radius:6px")[Alt 1 (step 2)]
    #span(style: "background:#dcfce7;color:#166534;padding:0.5em;border-radius:6px")[Alt 2 (step 3)]
    #span(style: "background:#fef9c3;color:#653416;padding:0.5em;border-radius:6px")[Alt 3 (step 4)]
  ]
]

// ============================================================
// 9. Touying-style pause/jump
// ============================================================
#slide[
  = Animations: 3. Animate like Touying

  Touying is a Typst presentation framework, which has a different approach to animations than Slidev.
  It is based on the concepts of `pause`, `meanwhile` and `jump`.
]

#let badge = c.with("code", ".sp-badge")

#slide[
  == pause — structural step separator

  #style("h3 ~ div { display: inline-block; }")

  Each `pause` marks a visgroup boundary:

  #dbox(hue: 300)[First — always visible]

  #badge("pause") #pause

  #dbox(hue: 240)[Second — after 1st pause]

  #badge("pause") #pause

  #dbox(hue: 120)[Third — after 2nd pause]

  #badge("pause") #pause

  #dbox(hue: 0)[Fourth — after 3rd pause]
]

#slide[
  == meanwhile — parallel tracks

  Content after `meanwhile` shows as if there were no pause before.

  #div(class: "two-cols", {
    dbox(hue: 300)[Always]
    pause ; badge("pause")
    dbox(hue: 240)[Step 1]
    pause ; badge("pause")
    dbox(hue: 120)[Step 2]
    component("br", [])
    meanwhile ; badge("meanwhile")
    dbox(hue: 300)[Always]
    pause ; badge("pause")
    dbox(hue: 240)[Also step 1]
    pause ; badge("pause")
    dbox(hue: 120)[and step 2]
    style(".two-cols { columns: 2}")
  })
]


#slide[
  == jump — flexible grouping (visgroups)

  Can be relative: `at: "+N"` forward, `at: "-N"` backward.
  Can be absolute: `at: "N"`.

  #dbox(hue: 300)[Always]

  #jump("+1") #badge("jump +1")

  #dbox(hue: 240)[Step 1]

  #jump("+1") #badge("jump +1")

  #dbox(hue: 120)[Step 2]

  #jump("-2") #badge("jump -2")

  #dbox(hue: 300)[Also always (via -2)]

  #jump("+1") #badge("jump +1")

  #dbox(hue: 240)[Step 1]

  #jump("0") #badge("jump 0")

  #dbox(hue: 300)[Again always (via 0)]

  #jump("+3") #badge("jump +3")

  #dbox(hue: 0)[Step 3]

  #jump("2") #badge("jump 2")

  #dbox(hue: 120)[Step 2]

  #jump("+1") #badge("jump +1")

  #dbox(hue: 0)[Step 3]
]

// ============================================================
// 10. sp-anim spec language
// ============================================================
#slide[
  = Animations: 4. Animate like "never before"
  
  The previous approaches are good for many use cases, but sometimes we want more control.
  `anim` defines animations with a CSS selector syntax — a *storyboard*.
]

#slide[
  == anim — the spec language

  Think of `anim` as a *storyboard*: you write a script of what appears at each click.

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px", [
    #ccode(style: "font-size:0.7em", [`spec=".d1 | .d2 | .d3 | .d4 | .d5 | .d6"`])
  ])

  - `|` — next *frame/visgroup*
  - `^` — *parallel* actions within one frame
  - Default action: *show* matching elements
  - `@command(args)` — built-in actions

  #stepbox(hue: 240)[Step through] #stepbox(hue: 120)[S2] #stepbox(hue: 0)[S3] #stepbox(hue: 180)[S4] #stepbox(hue: 60)[S5] #stepbox(hue: 300)[S6]

  #anim(".d240 | .d120 | .d0 | .d180 | .d60 | .d300")
  #style("ul~div { display: inline }")
]

#slide[
  == anim — sequential reveal (`|`)

  Each `|`-separated part is a CSS selector. Elements are revealed one group per step:

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px", [
    #ccode(style: "font-size:0.7em", [`spec=".first | .second | .second + *"`])
  ])

  #dbox([First (class=first)], hue: 240, class: "first")
  #dbox([Second (class=second)], hue: 120, class: "second")
  #dbox([Third (next sibling)], hue: 0)

  #anim(".first | .second | .second + *")
]

#slide[
  == anim — show, hide, and revisit

  `sp-anim` isn't just for revealing — you can *hide* elements and even make them reappear. Prefix a selector with `-` to hide:

  #div(class: "eg-spec", [`spec=".box | -.box | .box"`])

  Step 1: box appears | Step 2: hides | Step 3: reappears.

  #dbox([Cycle me], hue: 240, class: "box")

  #anim(".box | -.box | .box")

  #jump("0")

  #p(style: "margin-top: 1em;", [The `spec` describes a *timeline of actions*.])

  - `selector` — reveal (adds `sp-anim-shown` class)
  - `-selector` — hide (adds `sp-anim-hidden` class)
]

#slide[
  == anim — parallel actions (^)

  `|` = then. `^` = at the same time:

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px", [
    #ccode(style: "font-size:0.7em", [`spec=".a | .b ^ .c"`])
  ])

  Step 1: A appears | Step 2: B and C appear together.

  #stepbox([A], hue: 240) #stepbox([B], hue: 120) #stepbox([C], hue: 0)

  #anim(".d240 | .d120 ^ .d0")
]

#slide[
  == anim — `@add` / `@remove` CSS classes

  `@add(class, sel)` and `@remove(class, sel)` control CSS classes:

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px;font-size:0.7em", [
    #ccode([`@add(hi, .a) | @remove(hi, .a) ^ @add(hi, .b) | @add(hi, .c)`])
  ])

  #span(class: "a", style: "box-sizing:border-box;border:5px solid transparent;", [A])
  #span(class: "b", style: "box-sizing:border-box;border:5px solid transparent;", [B])
  #span(class: "c", style: "box-sizing:border-box;border:5px solid transparent;", [C])

  #anim("@add(hi, .a) | @remove(hi, .a) ^ @add(hi, .b) | @add(hi, .c)")

  #style("
    .a, .b, .c { box-sizing: border-box; border: 20px solid transparent; display: inline-block; padding: 0.25em 1em; border-radius: 6px; margin: 0.25em; }
    .a { background: lch(90 40 240); }
    .b { background: lch(90 40 120); }
    .c { background: lch(90 40 0); }
    .hi { border-color: var(--sp-accent) !important; box-shadow: 0 0 10px gold; }
  ")
]

#slide[
  == anim — delaying animations

  Prefix an action with a duration to delay it:

  #div(class: "eg-spec", [
    #ccode([
      `@add(hi, .d1) | .d2 ^ 750ms @add(hi, .d2) ^ 1s .d2 span | 1s -.d1`
    ])
  ])

  #dbox([Step 1], hue: 240, class: "d1")

  #dbox([Step 2 #span[after 1s]], hue: 120, class: "d2")

  #anim("@add(hi, .d1) | .d2 ^ 750ms @add(hi, .d2) ^ 1s .d2 span | 1s -.d1")

  - Prefix `duration` to delay the action
  - CSS transitions: override `.sp-anim-hidden` / `.sp-anim-shown` to change feel

  #style("
    .d1, .d2 { box-sizing: border-box; border: 20px solid transparent; }
    .hi { border-color: var(--sp-accent) !important; box-shadow: 0 0 10px gold; }
  ")
]

#slide[
  == anim — `@children` (reveal children one by one)

  `@children(sel)` reveals children of a container one per step:

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px", [
    #ccode(style: "font-size:0.7em", [`spec="@children(ul) | @children(ol)"`])
  ])

  - Child A
  - Child B
  - Child C
  - Child D

  #ol(style: "list-style:decimal;", [
    #li[Item]
    #li[Item]
    #li[Item]
  ])

  #anim("@children(ul) | @children(ol)")

  Works on any container. Similar to `steps` but in an `anim` context.
]

#slide[
  == anim — `@child` (reveal specific children)

  `@child(sel, n)` reveals one child, `@child(sel, a, b)` reveals a range — both in a single step:

  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px", [
    #ccode(style: "font-size:0.7em", [`spec="@child(ul, 2) | @child(ul, 1, 3) | @child(ul, 1, 4)"`])
  ])

  - Child A
  - Child B
  - Child C
  - Child D

  #anim("@child(ul, 2) | @child(ul, 1, 3) | @child(ul, 1, 4)")

  `@child(sel, n)` is an alias for `+sel > :nth-child(n)`; the range form maps to a double `:nth-child(n+a):nth-child(-n+b)`.
]

#slide[
  == anim — custom `@command`

  Toggle CSS classes via `@add` and `@remove`:

  #div(class: "eg-spec", [
    #ccode([
      `@add(glow, #catfill) | 2s @remove(glow, #catfill) ^ @add(pulse, #catTongue) | @add(dim, #cat)`
    ])
  ])

  #svg(src: path("./slides-purryst-banner-sticker.svg"), width: "50%")

  #anim("@add(glow, #catfill) | 2s @remove(glow, #catfill) ^ @add(pulse, #catTongue) | @add(dim, #cat)")

  - `@add(glow, #catfill)` — cat fill glows
  - `2s @remove(glow, #catfill) ^ @add(pulse, #catTongue)` — fill glow off, tongue pulses
  - `@add(dim, #cat)` — whole cat dims

  #style("
    #catTongue { fill: red; }
    .glow { filter: drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 40px #ffb300); transition: filter .3s; }
    .pulse { animation: pulse 0.5s ease-in-out 5; transform-origin: 50% 58%; }
    #cat { filter: none !important; }
    .dim { opacity: 0.3; transition: opacity 0.3s; }
  ")
  #style("
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1, .1); } }
  ")
]

#slide[
  == anim — `@play` / `@pause` video

  Control video playback through steps:

  #div(class: "eg-spec", [
    #ccode([
      `@play(#myvideo) | @pause(video) | 2s @pause ^ @play | @play(,rewind) | @pause`
    ])
  ])

  #c("video", src: "https://www.pexels.com/fr-fr/download/video/35332556/", width: "300", id: "myvideo", style: "float:right")

  #anim("@play(#myvideo) | @pause(video) | 2s @pause ^ @play | @play(,rewind) | @pause")

  Pass a selector, defaulting to `video`. `rewind` restarts from beginning.

  #div(style: "font-size: .5em; position: absolute; right: 0; bottom: 50px;", [

    #ccode[https://www.pexels.com/video/35332556/]
  ])
]

#slide[
  == anim — Testing (visgroups + #component("code", [`@children`]))

  Always visible #step(from: "2")[#dbox([... after pause 2 (via anim)], hue: 120, class: "d120")]

  #pause

  #dbox([After pause 1], hue: 240)

  #anim(".d120")

  #dbox([After pause 2 (via anim)], hue: 120, class: "d120")

  - First item (S3)
  - Second item (S4)
  - Third item (S5)

  #anim("@children(ul)")

  #jump("0")

  Always visible
]

#slide[
  == anim — Testing (selectors then children)

  Always visible heading

  #dbox([Step 1 (S1)], hue: 240, class: "d240")
  #dbox([Step 2 (S2)], hue: 120, class: "d120")

  - Child A (S3)
  - Child B (S4)

  #ol(style: "list-style:decimal;", [
    #li[Child C (S5)]
    #li[Child D (S6)]
    #li[Child E (S7)]
  ])

  #anim(".d240 | .d120 | @children(ul)")
  #anim("@children(ol)")
]

#slide[
  == anim — at offset & no-jump

  Start animations at a specific step with `at: "2"`:
  
  #div(style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px;font-size:0.7em", [
    #ccode([`spec=".d240 | .d120 | .d0" at="2"`])
  ])

  - This appears at step 2
  - This at step 3
  - This at step 4

  #anim("li:nth-of-type(1) | li:nth-of-type(2) | li:nth-of-type(3)", at: "2")
]

#slide[
  == anim — syntax reference

  #drag(rbox: "144|122|1669|879|0")[
    #table[
      #tr[#th[Syntax]#th[Meaning]]
      #tr[#td[selector]#td[Show element(s) by CSS selector]]
      #tr[#td[-selector]#td[Hide element(s)]]
      #tr[#td[|]#td[Separator between steps]]
      #tr[#td[^]#td[Parallel actions within one step]]
      #tr[#td[`@add(class, sel)`]#td[Add a CSS class]]
      #tr[#td[`@remove(class, sel)`]#td[Remove a CSS class]]
      #tr[#td[`@children(sel)`]#td[Show children one per step]]
      #tr[#td[`@child(sel, n[, b])`]#td[Show child n (or range a..b) of a container]]
      #tr[#td[`@play(sel)`]#td[Play video element]]
      #tr[#td[`@pause(sel)`]#td[Pause video]]
      #tr[#td[`@command(...)`]#td[Execute custom command]]
      #tr[#td[«dur» «action»]#td[Delay action by duration]]
      #tr[#td[at="+N"]#td[Offset start step by N]]
      #tr[#td[no-jump]#td[Don't advance step counter]]
    ]]
  #style(":has(>table) {
    font-size: 0.6em;
    border: 3px solid var(--sp-accent);
    overflow: auto;
    position: absolute;
    inset: 0;
  }")
]

// ============================================================
// 11. Typst-Specific Gains
// ============================================================
#slide[
  = Typst-Specific Gains

  Features uniquely enabled by authoring in Typst.
]

#slide[
  == Code Highlighting — Native, "No Shiki"

  Typst's `raw` provides syntax highlighting at compile time — no Shiki bundle needed.

  #codeblock("fn main() {
    println!(\"Hello Typst!\");
  }", lang: "rust", class: "demo-cb1")

  #anim("@children(.demo-cb1)")

  #codeblock("import { createSlidesPurryst } from \"slides-purryst\"

  createSlidesPurryst({
    transition: \"fade\",
  })", lang: "typescript", class: "demo-cb2")

  #anim("@child(.demo-cb2, 1, 2) | @child(.demo-cb2, 3, 4)")

  #step(from: "5")[
    #codeblock("#import \"slides-purryst/lib.typ\": *
  slide[
    = Hello
    World
  ]", lang: "typst")
  ]
]

#slide[
  == Native Math Typesetting

  No MathJax or KaTeX — Typst renders math to MathML at compile time.

  Inline: $a^2 + b^2 = c^2$

  Display:
  $ sum_(k=0)^n k = (n(n+1)) / 2 $

  #step(from: "1")[
    Matrices: $ mat(1, 2; 3, 4) vec(5, 6) = vec(17, 39) $
  ]

  #step(from: "2")[
    Cases: $ f(x) = cases(0 & "if " x < 0, 1 & "otherwise") $
  ]
]

#slide[
  == Native Vector Graphics with CeTZ

  CeTZ diagrams compile to inline SVG — no external editors needed.

  #cetz-drawing(length: 2cm, {
    import cetz.draw: *
    rect((-1.5, -1), (1.5, 1), fill: blue.transparentize(70%))
    circle((0, 0), radius: 0.8, stroke: blue + 3pt, fill: white)
    line((-0.5, -0.5), (0.5, 0.5), stroke: red + 2pt)
  })
]

#slide[
  == Animating a Cetz Cat

  Class markers tag SVG paths in a single canvas — a post-processor injects `class` attrs \
  ... so we can animate them with `anim`

  #cetz-drawing(length: 3cm, {
    import cetz.draw: *
    class("head")
    circle((0, 0), radius: (1.3cm, 1.15cm), fill: gray.transparentize(30%), stroke: black + 1.5pt)
    class("head")
    circle((-0.8cm, 0.25cm), radius: 0.22cm, fill: rgb("#f2c4c4"), stroke: none)
    class("head")
    circle((0.8cm, 0.25cm), radius: 0.22cm, fill: rgb("#f2c4c4"), stroke: none)
    class-begin("ears")
    polygon((-0.8cm, 0.95cm), 3, angle: 100deg, radius: 0.25, fill: gray.transparentize(50%), stroke: black + 1.5pt)
    polygon((0.8cm, 0.95cm), 3, angle: 80deg, radius: 0.25, fill: gray.transparentize(50%), stroke: black + 1.5pt)
    polygon((-0.8cm, 1.0cm), 3, angle: 100deg, radius: 0.12, fill: rgb("#e6a0a0"), stroke: none)
    polygon((0.8cm, 1.0cm), 3, angle: 80deg, radius: 0.12, fill: rgb("#e6a0a0"), stroke: none)
    class-end()
    class-begin("eyes")
    arc((-0.58cm, -0.1cm), start: 180deg, stop: 0deg, radius: 0.18cm, stroke: black + 1.5pt)
    arc((0.22cm, -0.1cm), start: 180deg, stop: 0deg, radius: 0.18cm, stroke: black + 1.5pt)
    class-end()
    class("nose")
    circle((0, -0.45cm), radius: 0.08cm, fill: black)
    class-begin("whiskers")
    line((-0.3cm, -0.4cm), (-1.4cm, -0.35cm))
    line((-0.3cm, -0.5cm), (-1.4cm, -0.55cm))
    line((-0.3cm, -0.6cm), (-1.4cm, -0.75cm))
    line((0.3cm, -0.4cm), (1.4cm, -0.35cm))
    line((0.3cm, -0.5cm), (1.4cm, -0.55cm))
    line((0.3cm, -0.6cm), (1.4cm, -0.75cm))
    class-end()
    class-begin("mouth")
    arc((-0.25cm, -0.55cm), start: 180deg, stop: 360deg, radius: 0.25cm, stroke: black + 1.5pt)
    class-end()
  })

  #anim(".whiskers | .eyes | .nose | .mouth | .ears | .head | @add(rotate, .eyes)")
  #style("svg { margin: auto; } .rotate { transition: transform 2s; transform: translate(45.921259843px, 45.598275064px) rotate(5turn); ")
]

#slide[
  == Plotting with Lilaq

  Lilaq provides ready-made plots backed by CeTZ.

  #lilaq-plot[
    #let xs = lq.linspace(-3, 3)
    #lq.diagram(
      height: 4.4cm,
      width: 9cm,
      xlabel: $x$,
      ylabel: $y$,
      lq.plot(xs, xs.map(x => x * x), label: $x^2$),
      lq.plot(xs, xs.map(x => calc.sin(x)), label: $sin(x)$),
      lq.plot(xs, xs.map(x => calc.cos(x)), label: $cos(x)$),
    )
  ]
]


#slide[
  == Example 🤯 : Lilaq + alternatives + for loops

  Each step shows the same plot with an evolving parameter:

  #{
    let xs = lq.linspace(0, 6, num: 101)
    let plots = (1, 2, 3, 4, 5).map(f => {
      lilaq-plot(
        lq.diagram(
          height: 4.4cm,
          width: 7.5cm,
          xlabel: $x$,
          ylabel: $y$,
          legend: (position: (100% + .5em, 0%)),
          lq.plot(xs, xs.map(x => calc.sin(f * x)), label: [$ sin(#f x) $], mark: none),
        )
      )
    })
    alternatives(at: "0", ..plots)
  }
]

#slide[
  == Demo/Test of adding classes and id

    #anno(".bordered")
  ==== TEST 

  ---
  #c("strong")[Test1]
  ---
  #c("em", ".nice")[Test2]
  ---
  #c("em", [Test2bis])
  ---
  #c("em", ".nice", [Test2ter])
  ---
//  #c("em", "Test2err")
  ---
  #c("em", ".nice", "hohoho")
  ---
  #c("strong")[Test3]
  ---
  #c("strong", [Test], [3b])
  ---
  #c("strong", "Test", "3c")
  ---
  #c("strong", ".nice", "3d")
  ---
  #c("strong", ".nice", "Test", "3e")
  ---
  #c("strong", class: "nice", style: "border: 5px solid var(--sp-accent);", "Test", "3f")
  ---
  #c("strong")[Test4]
  ---

  #anno(".bordered")
  - anno(".bordered")
    - da
    - plip
  - plop

  #style(".nice { color: var(--sp-accent); font-size: 1.5em; } .bordered { border: 5px solid var(--sp-accent); }")

]


// The bibliography is rendered once and registered as a cache entry via
// `#sp-bibliography` (the bib path is wrapped in `path()` so it resolves
// against this file). `#slide-bib()` then includes it per slide, filtered at
// runtime to the references cited on the current slide.
#sp-bibliography(path("demo.bib"),
  style: path("compact.csl"),
  title: "")
//#sp-bibliography(path("demo.bib"))

#slide[
  == Bibliography

  Citing @gagneux2025avisualdive @bertrand2025self

  #slide-bib()
]

#slide[
  == Another Bibliography

  Citing @pearson1901pca

  #slide-bib()

  #steps[
    #html.elem("p")[And now @gagneux2025avisualdive too (stepped).]
  ]
]

// ============================================================
// 12. TOC again
// ============================================================
#slide(no-toc: true)[
  = Here comes the TOC again

  (expect scrolling given the number of items)

  #toc()
]

#slide[
  == Here comes the TOC again, full

  #toc(end: "2")
]

// ============================================================
// 13. End slides
// ============================================================
#slide(no-toc: true, fake-end: true)[
  #h1[The END]

  The end? ... Illustrating the `fake-end`... look at slide numbers and move forward.
]

#slide[
  (wait for it)
]

#slide(fake-end: true)[
  (wait some more)
]

#slide(no-toc: true)[
  #h1[END (for real)]
]

#emit-class-map()

// ============================================================
// 14. Global style (cat blur)
// ============================================================
#style("
  svg #cat:not(:hover) { filter: blur(5px); }
  svg #cat:hover #catfill { fill: yellow; }
  .smallcat #catfill { fill: chartreuse; }
")
