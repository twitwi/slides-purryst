#let component(name, attrs: (:), body) = context {
  if target() == "html" {
    if body == none {
      return html.elem(name, attrs: attrs)
    } else {
      return html.elem(name, attrs: attrs, body)
    }
  } else {
    if body != none { body }
  }
}
