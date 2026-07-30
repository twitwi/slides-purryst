#let anim(spec, at: none) = context {
  if target() == "html" {
    let attrs = (spec: spec)
    if at != none { attrs.insert("at", at) }
    html.elem("sp-anim", attrs: attrs)
  } else {
    [anim(#spec)]
  }
}
