#let anim(spec) = context {
  if target() == "html" {
    html.elem("sp-anim", attrs: (spec: spec))
  } else {
    []
  }
}
