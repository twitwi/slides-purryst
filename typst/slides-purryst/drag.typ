#let drag(
  at: "",
  body,
) = context {
  if target() == "html" {
    let attrs = (:)
    if at != "" { attrs.insert("at", at) }
    html.elem("sp-drag", attrs: attrs)[#body]
  } else {
    body
  }
}
