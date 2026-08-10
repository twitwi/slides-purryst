#import "chunklet.typ": chunklet-defs
#import "cache.typ": cache-defs
#import "init.typ": sp-init-defs

#let slides-purryst-presentation(
  body,
  title: "Presentation",
  author: "",
  design-width: 1920,
  design-height: 1080,
  theme: "simple",
  transition: "",
  transition-duration: none,
) = context {
  if target() == "html" {
    let useModule = false
    if "slides-purryst-module" in sys.inputs and sys.inputs.at("slides-purryst-module") == "true" {
      useModule = true
    }

    let jsPath = "../dist/slides-purryst.bundle.js"
    if "slides-purryst-path" in sys.inputs {
      jsPath = sys.inputs.at("slides-purryst-path")
    } else if "bundle-js-path" in sys.inputs {
      jsPath = sys.inputs.at("bundle-js-path")
    }

    let cssPath = ""
    if "slides-purryst-css-path" in sys.inputs {
      cssPath = sys.inputs.at("slides-purryst-css-path")
    }

    let presentation-attrs = (
      id: "sp-presentation",
      "data-design-width": str(design-width),
      "data-design-height": str(design-height),
      "data-author": author,
    )
    if theme != "" {
      presentation-attrs.insert("data-theme", theme)
    }
    if transition != "" {
      presentation-attrs.insert("data-transition", transition)
    }
    if transition-duration != none {
      presentation-attrs.insert("data-transition-duration", str(transition-duration))
    }

    // warning: currently page gets rewrapped (TODO)
    html.elem("html", attrs: (lang: "en", class: "theme-" + theme))[
      #html.elem("head")[
        #html.elem("meta", attrs: (charset: "utf-8"))
        #html.elem("meta", attrs: (name: "viewport", content: "width=device-width, initial-scale=1.0"))
        #html.elem("meta", attrs: (name: "color-scheme", content: "light dark"))
        #html.elem("title")[#title]
        #if cssPath != "" [
          #html.elem("link", attrs: (rel: "stylesheet", href: cssPath))
        ]
      ]
      #html.elem("body")[
        #html.elem("script", attrs: (type: "text/html", id: "sp-content"))[
          #html.elem("sp-before")[]
          #body
        ]
        #chunklet-defs()
        #cache-defs()
        #sp-init-defs()
        #html.elem("div", attrs: presentation-attrs)
        #if useModule [
          #let scriptSrc = "import { createSlidesPurryst } from \"" + jsPath + "\"\nawait createSlidesPurryst()"
          #html.elem("script", attrs: (type: "module"))[#text(scriptSrc)]
        ] else [
          #html.elem("script", attrs: (src: jsPath))[]
          #html.elem("script")[(async () => { await SlidesPurryst.createSlidesPurryst() })()]
        ]
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
