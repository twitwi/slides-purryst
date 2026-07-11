#let pause = context {
  if target() == "html" {
    html.elem("sp-step")
  } else {
    v(1em)
  }
}

#let step(at: none, type: none, body) = context {
  if target() == "html" {
    let attrs = (:)
    if at != none { attrs.insert("at", str(at)) }
    if type != none { attrs.insert("type", type) }
    html.elem("sp-step", attrs: attrs)[#body]
  } else {
    body
  }
}

#let steps(body) = context {
  if target() == "html" {
    html.elem("sp-alternatives")[#body]
  } else {
    body
  }
}
