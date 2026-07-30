#let alternatives(at: none, cycle: false, body) = context {
  if target() == "html" {
    let attrs = (:)
    if at != none { attrs.insert("at", str(at)) }
    if cycle { attrs.insert("cycle", "") }
    html.elem("sp-alternatives", attrs: attrs)[#body]
  } else {
    body
  }
}
