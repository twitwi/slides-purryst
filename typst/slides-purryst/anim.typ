#let anim(spec, at: none, no-jump: false) = context {
  if target() == "html" {
    let attrs = (spec: spec)
    if at != none { attrs.insert("at", at) }
    if no-jump { attrs.insert("no-jump", "") }
    html.elem("sp-anim", attrs: attrs)
  } else {
    [anim(#spec)]
  }
}
