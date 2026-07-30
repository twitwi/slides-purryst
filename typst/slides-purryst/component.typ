#let component(name, body, attrs: (:)) = context {
  if target() == "html" {
    if body == none {
      html.elem(name, attrs: attrs)
    } else {
      html.elem(name, attrs: attrs)[#body]
    }
  } else {
    if body != none { body }
  }
}
