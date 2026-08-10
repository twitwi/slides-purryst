#import "slides-purryst/lib.typ": *
#import "slides-purryst/integrations.typ": *
#import "@preview/cetz:0.3.3"
#import "@preview/lilaq:0.6.0" as lq

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

  #p(attrs: (style: "color:#64748b;font-size:0.9em"))[Arrow keys or Space to navigate]

  NB: this demo file is using Typst
]

// ============================================================
// 2. Notes & Disclaimer
// ============================================================
#slide(no-toc: true)[
  = Notes and Disclaimer: welcome to

  #drag(at: "1408|33|468.45|182.97|0")[
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

  #p(attrs: (class: "eg-small"))[
    NB: You can see the source code
  ]

  #anno(".eg-small")
  - in the source typst file #MARK(".no-square")
  - for individual slides, by pressing #component("kbd", [S])

  #style(":has(>.no-square) { list-style: square; }")
]

// ============================================================
// 3. TOC
// ============================================================
#slide(no-toc: true)[
  = Here is TOC

  #toc(end: "2")
]

// ============================================================
// 4. Slide Transitions
// ============================================================
#slide[
  = Slide Transitions

  #component("div", attrs: (class: "eg-center"), [Do not overuse...])

  Transitions don't necessarily improve the presentation, they are possible but should be used sparingly, only when they add value to the content.
]

#slide[
  == Transition Options

  Per-slide transitions via `transition` parameter.

  - `code`
  - #component("code", [none]) — default
  - #component("code", [fade]) — opacity fading
  - #component("code", [slide-up]) — vertical slide
  - #component("code", [zoom]) — scale in/out

  A \'#component("code", [transition])\' option to #component("code", [slides-theme]) serves as default.
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

  - #component("kbd", [→]) / #component("kbd", [Spc]) / swipe: advance the presentation
  - #component("kbd", [←]): backward
  - #component("kbd", [↓]) (next) / #component("kbd", [↑]) (previous) slide (skip steps)
  - #component("kbd", [A]) / #component("kbd", [Z]): prev/next slide's end
  - #component("kbd", [G]): Open goto popup (number, header content)
  - #component("kbd", [O]): Toggle overview

  More shortcuts

  - #component("kbd", [F]): Toggle fullscreen
  - #component("kbd", [B]): Trigger blackout

  #drag(at: "956|672|828|204|0")[
    #component("div", attrs: (class: "eg-small"), [
      In this presentation
      - #component("kbd", [T]): Toggle theme (TODO)
      - #component("kbd", [S]): Toggle slide source view (TODO)
    ])
  ]
]

#slide[
  == Presenter View and Slide Notes

  Use #component("code", [sp-notes]) to add notes to a slide.

  Use key #component("code", [p]) (or the toolbar at the bottom) to toggle presenter view.

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
  == A Table of Content

  One can have a "local" TOC showing only a section context.

  #toc(start: "3", ctx: true)

  #drag(at: "1202|62|524.59|961.42|0")[
    #component("div", attrs: (style: "font-size: 25px; border: 5px solid gray; background: var(--sp-bg-2); padding: 10px; position: absolute; inset: 0; overflow: scroll;"), [
      = Full TOC
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
  - as a #component("code", [at="..."]) attribute

  #drag(at: "1076|107|641.89|283.04|0")[
    #component("div", attrs: (style: "display:inline-block;text-align:center;--eg-hue:270;padding:0.5em 1em;border-radius:6px;background:lch(90 40 var(--eg-hue));"), [Draggable box (natural size)])
  ]

  #pause

  #drag[#component("div", attrs: (style: "background: rgb(255 255 0 / 0.5);"), [stuff])]

  #drag(at: "953|515|891.99|184.07|23.8")[
    #component("div", attrs: (style: "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;--eg-hue:120;background:lch(90 40 var(--eg-hue));"), [One more box (fill and center+vcenter)])
  ]
]

#slide[
  == Draggable 2 (test)

  Same locations, should not blink, also should move the right one.

  #drag(at: "1076|107|641.89|283.04|0")[
    #component("div", attrs: (style: "display:inline-block;text-align:center;--eg-hue:270;padding:0.5em 1em;border-radius:6px;background:lch(90 40 var(--eg-hue));"), [Draggable box (natural size)])
  ]

  #drag(at: "953|515|891.99|184.07|23.8")[
    #component("div", attrs: (style: "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;--eg-hue:120;background:lch(90 40 var(--eg-hue));"), [One more box (fill and center+vcenter)])
  ]
]

// ============================================================
// Chunklets (definitions) (bodies are Typst markup, captured raw)
// ============================================================
#chunklet("X-mark", params: "x,y")[
  #div(attrs: (style: "position:absolute; left:calc($x * 1px - 1em); top: calc($y * 1px - 1em); width: 2em; height: 2em; color:var(--sp-accent); font-size:0.8em; display:flex; align-items:center; justify-content:center;"))[X]
]

#chunklet("Draggable Box", params: "x,y,w,h")[
  #drag(at: "$x|$y|$w|$h|0")[
    #div(attrs: (style: "position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:var(--sp-bg-2); border-radius:0.25em; border: 5px solid var(--sp-border)"))[Drag me]
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

  #drag(at: "1219|187|707.23|287.70|33.2")[
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

  #component("code", [step]) declares when its content appears.

  Always visible.

  #step(from: "1")[#stepbox[Step 1]]
  #step(from: "2")[#stepbox[Step 2]]
  #step(from: "3")[#stepbox[Step 3]]

  Always visible.

  #step(from: "3")[#stepbox(hue: 0)[Step 3 too.]]

  #component("p", attrs: (class: "eg-small"), [NB: step only handles its content, independently of other concepts.])
]

#slide[
  == step with animation presets (or hide)

  Elements can animate with some presets:

  #step(from: "1", animation: "fade")[#dbox([Fade in], hue: 240)]
  #step(from: "2", animation: "up")[#dbox([Slide up], hue: 120)]
  #step(from: "5", hide: true)[#dbox([Hidden (no space)], hue: 60)]
  #step(from: "3", animation: "left")[#dbox([Slide left], hue: 0)]
  #step(from: "4", animation: "scale")[#dbox([Scale in], hue: 180)]

  #component("p", attrs: (class: "eg-small"), [Presets: fade, up, down, left, right, scale, none.])
]

#slide[
  == step with also modifier

  Elements can share timing with the previous step:

  #step(from: "1")[#dbox([Step 1 (first)], hue: 240)]
  #step(also: true)[#dbox([Step 1 (same timing)], hue: 240)]

  #component("div", attrs: (style: "display: flex; gap: 1em;"), [
    #step(from: "2")[#dbox([Step 2], hue: 120)]
    #step(also: true)[#dbox([... also Step 2], hue: 120)]
  ])

  This avoids repeating the same timing for multiple elements.
]

#slide[
  == step with range visibility

  Elements can be visible only in a range of steps:

  #step(from: "1", to: "2")[#dbox([Visible at steps 1-2], hue: 240)]
  #step(from: "3")[#dbox([Visible from step 3], hue: 120)]
  #step(from: "0", to: "1")[#dbox([Visible at steps 0-1 (to=1)], hue: 60)]
  #step(from: "0", until: "2")[#dbox([Visible at steps 0-1 (until=2)], hue: 60)]

  #component("p", attrs: (class: "eg-small"), [\#step from/to use inclusive ranges; \#step from/until use exclusive end.])
]

#slide[
  == steps — children one by one

  #component("code", [steps]) is like wrapping every child with #component("code", [step]), sequentially appearing:

  #steps[
    #dbox([Item 1 (S.1)], hue: 240)
    #dbox([Item 2 (S.2)], hue: 120)
    #dbox([Item 3 (S.3)], hue: 0)
  ]

  Enter animation via #component("code", [animation: "fade"]):

  #steps(animation: "fade")[
    #dbox([Fades in (S.4)], hue: 180, class: "d4 inline")
    #dbox([Fades in (S.5)], hue: 60, class: "d5 inline")
    #dbox([Fades in (S.6)], hue: 300, class: "d6 inline")
  ]
  #style(".inline {display:inline}")
]

#slide[
  == steps with options

  With #component("code", [every: "2"]) and #component("code", [at: "1"]):

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

  #component("code", [alternatives]) shows children one by one (or cycles if #component("code", [cycle])):
  #alternatives(at: "0", [cycle: 🌕], [cycle: 🌑])#alternatives(at: "0", cycle: true, [; no cycle: 🌕], [; no cycle: 🌑])

  #alternatives(cycle: true)[
    #component("div", attrs: (style: "background:#dbeafe;color:#1e40af;padding:0.5em;border-radius:6px"), [Alternative 1 (step 0, 3, ...)])
    #component("div", attrs: (style: "background:#dcfce7;color:#166534;padding:0.5em;border-radius:6px"), [Alternative 2 (step 1, 4, ...)])
    #component("div", attrs: (style: "background:#fef9c3;color:#653416;padding:0.5em;border-radius:6px"), [Alternative 3 (step 2, 5, ...)])
  ]

  #jump("0")

  It can start delayed (with e.g. #component("code", [at: "2"])).

  #alternatives(at: "2")[
    #component("span", attrs: (style: "background:#dbeafe;color:#1e40af;padding:0.5em;border-radius:6px"), [Alt 1 (step 2)])
    #component("span", attrs: (style: "background:#dcfce7;color:#166534;padding:0.5em;border-radius:6px"), [Alt 2 (step 3)])
    #component("span", attrs: (style: "background:#fef9c3;color:#653416;padding:0.5em;border-radius:6px"), [Alt 3 (step 4)])
  ]
]

// ============================================================
// 9. Touying-style pause/jump
// ============================================================
#slide[
  = Animations: 3. Animate like Touying

  Touying is a Typst presentation framework, which has a different approach to animations than Slidev.
  It is based on the concepts of #component("code", [pause]), #component("code", [meanwhile]) and #component("code", [jump]).
]

#slide[
  == pause — structural step separator

  #style("h3 ~ div { display: inline-block; }")

  Each #component("code", [pause]) marks a visgroup boundary:

  #dbox(hue: 300)[First — always visible]

  #component("code", attrs: (class: "sp-badge"), [pause]) #pause

  #dbox(hue: 240)[Second — after 1st pause]

  #component("code", attrs: (class: "sp-badge"), [pause]) #pause

  #dbox(hue: 120)[Third — after 2nd pause]

  #component("code", attrs: (class: "sp-badge"), [pause]) #pause

  #dbox(hue: 0)[Fourth — after 3rd pause]
]

#slide[
  == meanwhile — parallel tracks

  Content after #component("code", [meanwhile]) shows as if there were no pause before.

  #div(attrs: (class: "two-cols"), {
    dbox(hue: 300)[Always]
    pause ; component("code", attrs: (class: "sp-badge"), [pause])
    dbox(hue: 240)[Step 1]
    pause ; component("code", attrs: (class: "sp-badge"), [pause])
    dbox(hue: 120)[Step 2]
    component("br", [])
    meanwhile ; component("code", attrs: (class: "sp-badge"), [meanwhile])
    dbox(hue: 300)[Always]
    pause ; component("code", attrs: (class: "sp-badge"), [pause])
    dbox(hue: 240)[Also step 1]
    pause ; component("code", attrs: (class: "sp-badge"), [pause])
    dbox(hue: 120)[and step 2]
    style(".two-cols { columns: 2}")
  })
]


#slide[
  == jump — flexible grouping (visgroups)

  Can be relative: #component("code", [at: "+N"]) forward, #component("code", [at: "-N"]) backward.
  Can be absolute: #component("code", [at: "N"]).

  #dbox(hue: 300)[Always]

  #jump("+1") #component("code", attrs: (class: "sp-badge"), [jump +1])

  #dbox(hue: 240)[Step 1]

  #jump("+1") #component("code", attrs: (class: "sp-badge"), [jump +1])

  #dbox(hue: 120)[Step 2]

  #jump("-2") #component("code", attrs: (class: "sp-badge"), [jump -2])

  #dbox(hue: 300)[Also always (via -2)]

  #jump("+1") #component("code", attrs: (class: "sp-badge"), [jump +1])

  #dbox(hue: 240)[Step 1]

  #jump("0") #component("code", attrs: (class: "sp-badge"), [jump 0])

  #dbox(hue: 300)[Again always (via 0)]

  #jump("+3") #component("code", attrs: (class: "sp-badge"), [jump +3])

  #dbox(hue: 0)[Step 3]

  #jump("2") #component("code", attrs: (class: "sp-badge"), [jump 2])

  #dbox(hue: 120)[Step 2]

  #jump("+1") #component("code", attrs: (class: "sp-badge"), [jump +1])

  #dbox(hue: 0)[Step 3]
]

// ============================================================
// 10. sp-anim spec language
// ============================================================
#slide[
  = Animations: 4. Animate like "never before"

  The previous approaches are good for many use cases, but sometimes we want more control.
  #component("code", [anim]) defines animations with a CSS selector syntax — a #component("b", [storyboard]).
]

#slide[
  == anim — the spec language

  Think of #component("code", [anim]) as a #component("b", [storyboard]): you write a script of what appears at each click.

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px"), [
    #component("code", attrs: (style: "font-size:0.7em"), [`spec=".d1 | .d2 | .d3 | .d4 | .d5 | .d6"`])
  ])

  - #component("code", [|]) — next #component("b", [frame/visgroup])
  - #component("code", [^]) — #component("b", [parallel]) actions within one frame
  - Default action: #component("b", [show]) matching elements
  - #component("code", [`@command(args)`]) — built-in actions

  #stepbox(hue: 240)[Step through] #stepbox(hue: 120)[S2] #stepbox(hue: 0)[S3] #stepbox(hue: 180)[S4] #stepbox(hue: 60)[S5] #stepbox(hue: 300)[S6]

  #anim(".d240 | .d120 | .d0 | .d180 | .d60 | .d300")
  #style("ul~div { display: inline }")
]

#slide[
  == anim — sequential reveal (`|`)

  Each #component("code", [|])-separated part is a CSS selector. Elements are revealed one group per step:

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px"), [
    #component("code", attrs: (style: "font-size:0.7em"), [`spec=".first | .second | .second + *"`])
  ])

  #dbox([First (class=first)], hue: 240, class: "first")
  #dbox([Second (class=second)], hue: 120, class: "second")
  #dbox([Third (next sibling)], hue: 0)

  #anim(".first | .second | .second + *")
]

#slide[
  == anim — show, hide, and revisit

  #component("code", [sp-anim]) isn't just for revealing — you can #component("b", [hide]) elements and even make them reappear. Prefix a selector with #component("code", [-]) to hide:

  #component("div", attrs: (class: "eg-spec"), [`spec=".box | -.box | .box"`])

  Step 1: box appears | Step 2: hides | Step 3: reappears.

  #dbox([Cycle me], hue: 240, class: "box")

  #anim(".box | -.box | .box")

  #jump("0")

  #component("p", attrs: (style: "margin-top: 1em;"), [The #component("code", [spec]) describes a #component("b", [timeline of actions]).])

  - #component("code", [selector]) — reveal (adds #component("code", [sp-anim-shown]) class)
  - #component("code", [-selector]) — hide (adds #component("code", [sp-anim-hidden]) class)
]

#slide[
  == anim — parallel actions (^)

  #component("code", [|]) = then. #component("code", [^]) = at the same time:

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px"), [
    #component("code", attrs: (style: "font-size:0.7em"), [`spec=".a | .b ^ .c"`])
  ])

  Step 1: A appears | Step 2: B and C appear together.

  #stepbox([A], hue: 240) #stepbox([B], hue: 120) #stepbox([C], hue: 0)

  #anim(".d240 | .d120 ^ .d0")
]

#slide[
  == anim — `@add` / `@remove` CSS classes

  #component("code", [`@add(class, sel)`]) and #component("code", [`@remove(class, sel)`]) control CSS classes:

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px;font-size:0.7em"), [
    #component("code", [`@add(hi, .a) | @remove(hi, .a) ^ @add(hi, .b) | @add(hi, .c)`])
  ])

  #component("span", attrs: (class: "a", style: "box-sizing:border-box;border:5px solid transparent;"), [A])
  #component("span", attrs: (class: "b", style: "box-sizing:border-box;border:5px solid transparent;"), [B])
  #component("span", attrs: (class: "c", style: "box-sizing:border-box;border:5px solid transparent;"), [C])

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

  #component("div", attrs: (class: "eg-spec"), [
    #component("code", [
      `@add(hi, .d1) | .d2 ^ 750ms @add(hi, .d2) ^ 1s .d2 span | 1s -.d1`
    ])
  ])

  #dbox([Step 1], hue: 240, class: "d1")

  #dbox([Step 2 #component("span")[after 1s]], hue: 120, class: "d2")

  #anim("@add(hi, .d1) | .d2 ^ 750ms @add(hi, .d2) ^ 1s .d2 span | 1s -.d1")

  - Prefix #component("code", [«duration»]) to delay the action
  - CSS transitions: override #component("code", [.sp-anim-hidden]) / #component("code", [.sp-anim-shown]) to change feel

  #style("
    .d1, .d2 { box-sizing: border-box; border: 20px solid transparent; }
    .hi { border-color: var(--sp-accent) !important; box-shadow: 0 0 10px gold; }
  ")
]

#slide[
  == anim — `@children` (reveal children one by one)

  #component("code", [`@children(sel)`]) reveals children of a container one per step:

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px"), [
    #component("code", attrs: (style: "font-size:0.7em"), [`spec="@children(ul) | @children(ol)"`])
  ])

  - Child A
  - Child B
  - Child C
  - Child D

  #component("ol", attrs: (style: "list-style:decimal;"), [
    #component("li")[Item]
    #component("li")[Item]
    #component("li")[Item]
  ])

  #anim("@children(ul) | @children(ol)")

  Works on any container. Similar to #component("code", [steps]) but in an #component("code", [anim]) context.
]

#slide[
  == anim — `@child` (reveal specific children)

  #component("code", [`@child(sel, n)`]) reveals one child, #component("code", [`@child(sel, a, b)`]) reveals a range — both in a single step:

  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px"), [
    #component("code", attrs: (style: "font-size:0.7em"), [`spec="@child(ul, 2) | @child(ul, 1, 3) | @child(ul, 1, 4)"`])
  ])

  - Child A
  - Child B
  - Child C
  - Child D

  #anim("@child(ul, 2) | @child(ul, 1, 3) | @child(ul, 1, 4)")

  #component("code", [`@child(sel, n)`]) is an alias for #component("code", [`+sel > :nth-child(n)`]); the range form maps to a double #component("code", [`:nth-child(n+a):nth-child(-n+b)`]).
]

#slide[
  == anim — custom `@command`

  Toggle CSS classes via #component("code", [`@add`]) and #component("code", [`@remove`]):

  #component("div", attrs: (class: "eg-spec"), [
    #component("code", [
      `@add(glow, #catfill) | 2s @remove(glow, #catfill) ^ @add(pulse, #catTongue) | @add(dim, #cat)`
    ])
  ])

  #svg(src: path("./slides-purryst-banner-sticker.svg"), width: "50%")

  #anim("@add(glow, #catfill) | 2s @remove(glow, #catfill) ^ @add(pulse, #catTongue) | @add(dim, #cat)")

  - #component("code")[`@add(glow, #catfill)`] — cat fill glows
  - #component("code")[`2s @remove(glow, #catfill) ^ @add(pulse, #catTongue)`] — fill glow off, tongue pulses
  - #component("code")[`@add(dim, #cat)`] — whole cat dims

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

  #component("div", attrs: (class: "eg-spec"), [
    #component("code", [
      `@play(#myvideo) | @pause(video) | 2s @pause ^ @play | @play(,rewind) | @pause`
    ])
  ])

  #component("video", attrs: (src: "https://www.pexels.com/fr-fr/download/video/35332556/", width: "300", id: "myvideo", style: "float:right"), [])

  #anim("@play(#myvideo) | @pause(video) | 2s @pause ^ @play | @play(,rewind) | @pause")

  Pass a selector, defaulting to #component("code", [video]). #component("code", [rewind]) restarts from beginning.

  #component("div", attrs: (style: "font-size: .5em; position: absolute; right: 0; bottom: 50px;"), [
    #component("code")[https://www.pexels.com/video/35332556/]
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

  #component("ol", attrs: (style: "list-style:decimal;"), [
    #component("li")[Child C (S5)]
    #component("li")[Child D (S6)]
    #component("li")[Child E (S7)]
  ])

  #anim(".d240 | .d120 | @children(ul)")
  #anim("@children(ol)")
]

#slide[
  == anim — at offset & no-jump

  Start animations at a specific step with #component("code", [at: "2"]):
  
  #component("div", attrs: (style: "display:flex;gap:1em;margin:0.5em 0;font-family:var(--sp-font-mono);background:var(--sp-bg-3);padding:0.5em;border-radius:6px;font-size:0.7em"), [
    #component("code", [`spec=".d240 | .d120 | .d0" at="2"`])
  ])

  - This appears at step 2
  - This at step 3
  - This at step 4

  #anim("li:nth-of-type(1) | li:nth-of-type(2) | li:nth-of-type(3)", at: "2")
]

#slide[
  == anim — syntax reference

  #drag(at: "144|122|1669.398390531129|879.3043729754388|0")[
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

  Typst's #component("code", [raw]) provides syntax highlighting at compile time — no Shiki bundle needed.

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

  The end? ... Illustrating the #component("code", [fake-end])... look at slide numbers and move forward.
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
