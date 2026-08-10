#import "@preview/cetz:0.3.3"

// ============================================================
// Helper: Cetz drawing → HTML SVG via html.frame
// ============================================================
#let cetz-drawing(..args) = {
  let canvas = cetz.canvas(..args)
  context if target() == "html" {
    html.frame(canvas)
  } else {
    canvas
  }
}

// ============================================================
// Cetz class marker system — injects SVG class attributes via
// post-processing (see tools/inject-cetz-classes.mjs)
// ============================================================
#let _cmap = state("cetz-class-map", (:))

#let _class-id(name) = {
  let alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"
  let h = 5381
  for ch in name.codepoints() {
    let p = alpha.position(ch)
    let v = if p == none { 0 } else { p }
    h = calc.rem(h * 33 + v + name.len(), 65536)
  }
  calc.rem(h, 65536)
}

#let _marker(sentinel, name) = (
  ctx => {
    let id = if name == none { 0 } else { _class-id(name) }
    let cfunc = cetz.draw.circle((0, 0), radius: 0.001pt,
      fill: rgb("#" + str(sentinel, base: 16) + ("0000" + str(id, base: 16)).slice(-4) + "01"),
      stroke: none).at(0)
    let d = cfunc(ctx)
    if name != none {
      let up = cetz.drawable.content((0, 0, 0), 0, 0, none,
        _cmap.update(mm => (..mm, (name): id)))
      d.insert("drawables", (d.at("drawables", default: ()) + (up,)))
    }
    return d
  },
)

#let class(name) = _marker(0x42, name)
#let class-begin(name) = _marker(0x43, name)
#let class-end() = _marker(0x44, none)

#let emit-class-map() = {
  context if target() == "html" {
    let m = _cmap.get()
    html.elem("script", attrs: (type: "application/json", id: "cetz-classes"), json.encode(m))
  }
}

// 

#let lilaq-plot(body) = {
  context if target() == "html" {
    html.frame(body)
  } else {
    body
  }
}
