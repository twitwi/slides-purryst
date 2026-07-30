#import "slides-purryst/lib.typ": *

// ============================================================
// Helper: colored boxes
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

// ============================================================
// 1. Welcome
// ============================================================
#slide[
  #h1[SlidesPurryst]

  Where Typst meets Vue in purr-fect harmony.

  _Arrow keys or Space to navigate._

  NB: this demo file is using Typst
]

// ============================================================
// 2. Notes & Disclaimer
// ============================================================
#slide(no-toc: true)[
  = Notes and Disclaimer

  - This presentation acts as:
    - a tutorial/demo
    - a documentation
    - an informal test suite
  - This presentation is NOT:
    - a starter template
    - meant to be visually polished

  NB: You can see the source code in the source HTML.
]

// ============================================================
// 3. TOC
// ============================================================
#slide(no-toc: true)[
  = Table of Contents

  #toc(end: "2")
]

// ============================================================
// 4. Slide Transitions
// ============================================================
#slide[
  = Slide Transitions

  Do not overuse...

  Transitions don't necessarily improve the presentation.
]

#slide[
  == Transition Options

  Per-slide transitions via `transition` parameter.

  - `none` — default
  - `fade` — opacity fading
  - `slide-up` — vertical slide
  - `zoom` — scale in/out
]

#slide(transition: "fade")[
  == Fade

  #img(src: path("./slides-purryst-banner.svg"))
]

#slide(transition: "slide-up")[
  == Slide Up

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")
]

#slide(transition: "zoom", transitionDuration: "600")[
  == Zoom (600ms)

  #img(src: path("./slides-purryst-banner.svg"))
]

#slide(transition: "fade", transitionDuration: "100")[
  == Fade (100ms)

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")
]

// ============================================================
// 5. Navigation
// ============================================================
#slide[
  = Navigation, basic features and shortcuts
]

#slide[
  == Keyboard Navigation

  - #component("kbd", [→]) / #component("kbd", [Space]): advance
  - #component("kbd", [←]): backward
  - #component("kbd", [↓]) / #component("kbd", [↑]): next/prev slide
  - #component("kbd", [G]): Go-to prompt
  - #component("kbd", [O]): Overview grid
  - #component("kbd", [F]): Fullscreen
  - #component("kbd", [B]): Blackout
  - #component("kbd", [P]): Presenter mode
]

#slide[
  == Presenter View and Slide Notes

  Use the presenter view to see speaker notes, next slide preview, and timer.

  Press #component("kbd", [P]) to toggle.

  #notes[
    = Speaker Notes

    These notes are only visible in presenter view.

    - Key points to mention
    - Timing suggestions
  ]
]

// ============================================================
// 6. Features
// ============================================================
#slide[
  = Some interesting features
]

#slide[
  == Table of Content

  One can have a "local" TOC showing only a section context.

  #toc(start: "3", ctx: true)

  #drag(at: "1096|59|594.15|847.33|0")[
    #component("div", attrs: (style: "font-size: 25px; border: 5px solid gray; background: black; padding: 10px; position: absolute; inset: 0; overflow: scroll;"), [
      = Full TOC
      #toc()
    ])
  ]
]

#slide[
  == Draggable Elements

  #component("kbd", [double-click]) to select, move and resize.

  #pause

  #drag(at: "435|473|700|246|15")[
    #dbox[*Draggable box*]
  ]

  #pause

  #drag(at: "889|357|830.41|411.49|-39")[
    #dbox(hue: 120)[*Another box*]
  ]
]

#slide[
  == Chunklets

  Press #component("kbd", [C]) to toggle the chunklet toolbar,
  then click a chunklet and click or drag on the slide to insert it.
]

#slide[
  == Inline SVG

  Move your mouse on the cat.

  #svg(src: path("./slides-purryst-banner-sticker.svg"), height: "400px")
]

// ============================================================
// 7. Steps & Animations Overview
// ============================================================
#slide[
  = Animations overview
]

#slide[
  == Principles

  - "animations" is what happens when we step with arrow keys
  - each step is called a _step_
  - several approaches exist, combinable in a presentation
]

#slide[
  == Multiple ways

  - `step` — declare when content appears
  - `steps` — children one by one
  - `step` with `from` / `to` / `until` / `animation` — fine-grained
  - `pause` / `meanwhile` / `jump` — structural visgroups
  - `anim` — CSS selector-based spec language
]

// ============================================================
// 8. Slidev-style step/steps
// ============================================================
#slide[
  = Animations like in Slidev
]

#slide[
  == Explicit step

  Always visible.

  #step(from: "1")[#dbox([Step 1], hue: 240)]
  #step(from: "2")[#dbox([Step 2], hue: 120)]
  #step(from: "3")[#dbox([Step 3], hue: 0)]

  Always visible.
]

#slide[
  == step with animation presets

  #step(from: "1", animation: "fade")[#dbox([Fade in], hue: 240)]
  #step(from: "2", animation: "up")[#dbox([Slide up], hue: 120)]
  #step(from: "5", hide: true)[#dbox([Hidden (no space)], hue: 300)]
  #step(from: "3", animation: "left")[#dbox([Slide left], hue: 0)]
  #step(from: "4", animation: "scale")[#dbox([Slide right], hue: 60)]
]

#slide[
  == step with range visibility

  #step(from: "1", to: "2")[#dbox([Steps 1-2], hue: 240)]
  #step(from: "3")[#dbox([From step 3], hue: 120)]
  #step(from: "0", until: "2")[#dbox([Steps 0-1], hue: 180)]
]

#slide[
  == steps — children one by one

  #steps[
    #dbox([Item 1], hue: 240)
    #dbox([Item 2], hue: 120)
    #dbox([Item 3], hue: 0)
  ]
]

#slide[
  == steps with options

  #steps(every: "2", at: "1")[
    #dbox([1 + 2], hue: 240)
    #dbox([1 + 2], hue: 240)
    #dbox([3 + 4], hue: 120)
    #dbox([3 + 4], hue: 120)
    #dbox([5th], hue: 0)
  ]
]

#slide[
  == alternatives

  #alternatives(cycle: true)[
    #block(fill: rgb("#dbeafe"), inset: 0.5em, radius: 6pt)[#text(fill: rgb("#1e40af"))[Alternative 1]]
    #block(fill: rgb("#dcfce7"), inset: 0.5em, radius: 6pt)[#text(fill: rgb("#166534"))[Alternative 2]]
    #block(fill: rgb("#fef9c3"), inset: 0.5em, radius: 6pt)[#text(fill: rgb("#653416"))[Alternative 3]]
  ]
]

// ============================================================
// 9. Touying-style pause/jump
// ============================================================
#slide[
  = Animations like Touying
]

#slide[
  == pause

  Always visible.

  #pause

  First pause.

  #pause

  Second pause.
]

#slide[
  == meanwhile

  Always visible.

  #pause

  Step 1.

  #meanwhile

  Also step 1 (parallel track).
]

#slide[
  == jump — flexible grouping

  Always visible.

  #jump("+1")

  Step 1.

  #jump("+1")

  Step 2.

  #jump("0")

  Always visible again.
]

// ============================================================
// 10. sp-anim spec language
// ============================================================
#slide[
  = Animations: spec language
]

#slide[
  == Sequential reveal

  Each #component("code", [|])—separated part shows one group per step.

  - First
  - Second
  - Third

  #anim("li:nth-of-type(1) | li:nth-of-type(2) | li:nth-of-type(3)")
]

#slide[
  == Show, hide, and revisit

  Prefix a selector with `-` to hide.

  #dbox([Cycle me], class: "box")

  #anim(".box | -.box | .box")
]

#slide[
  == Parallel actions with `^`

  Within one step, separate parallel actions with `^`.

  #anim(".a | .b ^ .c")

  #dbox([A], class: "a", hue: 240)
  #dbox([B], class: "b", hue: 120)
  #dbox([C], class: "c", hue: 120)
]

#slide[
  == \@add / \@remove CSS classes

  #anim("@add(hi, .a) | @remove(hi, .a) ^ @add(hi, .b) | @add(hi, .c)")

  Step 1: A glows | Step 2: A dims, B glows | Step 3: C glows.

  #dbox([A], class: "a", hue: 240)
  #dbox([B], class: "b", hue: 120)
  #dbox([C], class: "c", hue: 0)

  #style(".a, .b, .c { box-sizing: border-box; border: 5px solid transparent; transition: box-shadow 0.2s; }
    .hi { box-shadow: 0 0 10px gold; }")
]

#slide[
  == \@children — reveal children one by one

  #anim("@children(ul)")

  - Child A
  - Child B
  - Child C
  - Child D
]

#slide[
  == at offset & no-jump

  Start animations at a specific step with `at="2"`:

  #anim("li:nth-of-type(1) | li:nth-of-type(2) | li:nth-of-type(3)", at: "2")

  - This appears at step 2
  - This at step 3
  - This at step 4
]

// ============================================================
// 11. TOC again
// ============================================================
#slide(no-toc: true)[
  = TOC again

  (expect scrolling given the number of items)

  #toc()
]

#slide[
  = TOC again, full

  #toc(end: "2")
]

// ============================================================
// 12. End slides
// ============================================================
#slide(no-toc: true, fake-end: true)[
  #h1[The END]

  The end? ... look at slide numbers and move forward.
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

// ============================================================
// 13. Global style
// ============================================================
#style("
  svg #cat:not(:hover) { filter: blur(5px); }
  svg #cat:hover #catfill { fill: yellow; }
  .smallcat #catfill { fill: chartreuse; }
")
