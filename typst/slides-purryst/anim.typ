#let anim(spec) = context {
  if target() == "html" {
    html.elem("sp-anim", attrs: (spec: spec))
  } else {
    [anim(#spec)]
  }
}

#let pause() = context {
  if target() == "html" {
    html.elem("sp-jump", attrs: (at: "+1"))
  } else {
    [pause()]
  }
}
