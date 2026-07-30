#let anim(spec, at: none) = context {
  if target() == "html" {
    let attrs = (spec: spec)
    if at != none { attrs.insert("at", at) }
    html.elem("sp-anim", attrs: attrs)
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
