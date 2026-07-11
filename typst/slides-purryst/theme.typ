#let slides-theme(
  body,
  title: "Presentation",
  author: "",
  design-width: 1920,
  design-height: 1080,
) = context {
  if target() == "html" {
    let jsPath = "../dist/slides-purryst.bundle.js"
    if "bundle-js-path" in sys.inputs {
      jsPath = sys.inputs.at("bundle-js-path")
    }

    html.elem("html", attrs: (lang: "en"))[
      #html.elem("head")[
        #html.elem("meta", attrs: (charset: "utf-8"))
        #html.elem("meta", attrs: (name: "viewport", content: "width=device-width, initial-scale=1.0"))
        #html.elem("meta", attrs: (name: "color-scheme", content: "light dark"))
        #html.elem("title")[#title]
      ]
      #html.elem("body")[
        #html.elem("template", attrs: (id: "sp-content"))[
          #body
        ]
        #html.elem("div", attrs: (
          id: "sp-presentation",
          "data-design-width": str(design-width),
          "data-design-height": str(design-height),
          "data-author": author,
        ))
        #html.elem("script", attrs: (src: jsPath))[]
        #html.elem("script")[SlidesPurryst.createSlidesPurryst()]
      ]
    ]
  } else {
    set page(paper: "presentation-16-9", margin: (x: 2em, y: 2em))
    set text(fill: rgb("#1e293b"))
    show heading.where(level: 1): set text(size: 2.5em, weight: 700)
    show heading.where(level: 2): set text(size: 1.75em, weight: 600, fill: rgb("#475569"))
    show heading.where(level: 3): set text(size: 1.35em, weight: 600)
    show raw.where(block: true): it => block(
      fill: luma(30),
      inset: (x: 1.2em, y: 0.8em),
      radius: 8pt,
    )[#it]
    show link: set text(fill: rgb("#2563eb"))
    set align(horizon)
    v(2em)
    body
  }
}
