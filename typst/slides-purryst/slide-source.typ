#let slide-source(for-slide: none) = context {
  if target() == "html" {
    let attrs = (:)
    if for-slide != none { attrs.insert("for", str(for-slide)) }
    html.elem("sp-slide-source", attrs: attrs)
  }
}
