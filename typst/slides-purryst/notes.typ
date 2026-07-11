#let notes(body) = context {
  if target() == "html" {
    html.elem("sp-notes")[#body]
  } else {
    body
  }
}
