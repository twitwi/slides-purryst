#import "../typst/slides-purryst/lib.typ": *

#show: slides-theme.with(
  title: "SlidesPurryst Demo",
  author: "You",
)

#slide[
  #h1[SlidesPurryst]

  Where Typst meets Vue in purr-fect harmony.

  _Arrow keys or Space to navigate._

  NB: this demo file is using Typst
]

#slide(no-toc: true)[
  = Table of Contents

  #toc(end: "2")
]

#slide[
  = Slide Transitions

  Do not overuse...
]

#slide[
  == Transition Options

  Per-slide transitions via `transition` attribute.

  - `fade` — default
  - `slide-up` — vertical slide
  - `zoom` — scale in/out

  A "transition" option to createSlidesPurryst, used as default.
]

#slide(transition: "fade")[
  == Fade

  #img(src: path("./slides-purryst-banner.svg")
)]

#slide(transition: "slide-up")[
  == Slide Up

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")
]

#slide(transition: "zoom", transitionDuration: "600")[
  == Zoom (600ms)

  #img(src: path("./slides-purryst-banner.svg")
)]

#slide(transition: "fade", transitionDuration: "100")[
  == Fade (100ms)

  #img(src: path("./slides-purryst-banner.svg"), style: "transform: scale(-1,1)")
]

#slide[
  == Keyboard Navigation

  - #component("kbd", body: [→]) / #component("kbd", body: [Space]) / #component("kbd", body: [↓]): Next
  - #component("kbd", body: [←]) / #component("kbd", body: [↑]): Previous
  - #component("kbd", body: [Home]) / #component("kbd", body: [End]): First / Last
  - #component("kbd", body: [a]) / #component("kbd", body: [z]): End of prev / next slide
  - #component("kbd", body: [F]): Toggle fullscreen
]

#slide[
  == Some interesting features
]

#slide[
  == A Table of Content

  One can have "local" TOC

  #toc(start: "3", ctx: true)

  #drag(at: "1202|62|524.59|961.42|0")[
    #block(
      fill: black,
      inset: 10pt,
      stroke: 5pt + gray,
    )[
      Full TOC

      #toc()
    ]
  ]
]

#slide[
  == Draggable Elements

  #pause

  #drag(at: "287|249|700|246|15")[
    #block(fill: rgb("#dbeafe"), inset: 1em, radius: 8pt, stroke: 2pt + rgb("#3b82f6"))[
      #text(fill: black)[*Draggableo box*]
    ]
  ]

  #pause

  #drag(at: "1204|306|830.41|411.49|-39")[
    #block(fill: rgb("#dcfce7"), inset: 1em, radius: 8pt, stroke: 2pt + rgb("#22c55e"))[
      #text(fill: black)[*Another box*]
    ]
  ]
]

#slide[
  == Drag 2

  #drag(at: "287|249|700|246|15")[
    #block(fill: rgb("#dbeafe"), inset: 1em, radius: 8pt, stroke: 2pt + rgb("#3b82f6"))[
      #text(fill: red)[*Draggable box*]
    ]
  ]

  #drag(at: "1204|306|830.41|411.49|-39")[
    #block(fill: rgb("#dcfce7"), inset: 1em, radius: 8pt, stroke: 2pt + rgb("#22c55e"))[
      #text(fill: red)[*Another box*]
    ]
  ]
]

#slide[
  == Inline SVG

  Move your mouse on the cat.

  #svg(src: path("./slides-purryst-banner-sticker.svg"), height: "400px")

  #style("
    h2 { filter: blur(2px); }
  ")

  Use `sp-style` in a slide or globally.

  #svg(src: path("./slides-purryst-banner-sticker.svg"), width: "100%", height: "200")

  #drag(at: "1098|284|564.37|227.06|44.5")[
    #svg(src: path("./slides-purryst-banner-sticker.svg"), wrap: true, class: "smallcat")
  ]
]

#slide[
  == Code Highlighting

  Use Typst raw blocks for code snippets.

  #component("pre", body: [
    #component("code", attrs: ("class": "language-typst"), body: [
      #text("#import \"../typst/slides-purryst/lib.typ\": *\n#show: slides-theme.with(title: \"Demo\")\n\n#slide[ = Hello ]")
    ])
  ])
]

#slide[
  == Animations: \@jump

  Always visible.

  #anim("@jump(1)")

  Appears on click 1.

  #anim("@jump(1)")

  Appears on click 2.

  #anim("@jump(1)")

  Appears on click 3.
]

#slide[
  == Animations: selectors

  Always visible.

  #anim("li:nth-of-type(1) | li:nth-of-type(2) | li:nth-of-type(3)")

  - First
  - Second
  - Third
]

#slide[
  == Animations: \@children

  #anim("@children(ul)")

  - First item
  - Second item
  - Third item
  - Fourth item
]

#slide[
  == Animations: Combined

  Always visible heading.

  #anim(".step1 | .step2 | @children(ul)")

  #component("div", attrs: (class: "step1"), body: [
    #block(fill: rgb("#dbeafe"), inset: 0.3em, radius: 6pt)[
      #text(fill: rgb("#1e40af"))[Step 1]
    ]
  ])

  #component("div", attrs: (class: "step2"), body: [
    #block(fill: rgb("#dcfce7"), inset: 0.3em, radius: 6pt)[
      #text(fill: rgb("#166534"))[Step 2]
    ]
  ])

  - Child A
  - Child B
  - Child C
]

#slide[
  == Animations: \@add / \@remove

  #svg(src: path("./slides-purryst-banner-sticker.svg"), width: "100%")

  #text(size: 0.7em)[
    Effects per step:
    + `@add(glow, #catfill)` — cat fill glows
    + `@remove(glow, #catfill) ^ @add(pulse, #catTongue)` — fill glow off, tongue pulses
    + `@add(dim, #cat)` — whole cat dims
  ]

  #anim("@add(glow, #catfill) | @remove(glow, #catfill) ^ @add(pulse, #catTongue) | @add(dim, #cat)")

  #style("
    #catTongue { fill: red; }
    .glow { filter: drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 40px #ffb300); transition: filter .3s; }
    .pulse { animation: pulse 0.5s ease-in-out 5; transform-origin: 50% 58%; }
    .dim { opacity: 0.3; transition: opacity 0.3s; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1, .1); } }
    #cat { filter: none !important; }
  ")
]

#slide(no-toc: true)[
  == TOC again

  (expect scrolling given the number of items)

  #toc()
]

#slide[
  == TOC again, full

  #toc(end: "2")
]

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

#style("
  svg #cat:not(:hover) { filter: blur(5px); }
  svg #cat:hover {
    #catfill { fill: yellow; }
    .smallcat & { fill: chartreuse; }
    #catTongue { fill: chartreuse; }
    #catT, #catV { filter: blur(10px); }
  }
")
