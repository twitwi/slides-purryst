#let drag-counter = counter("sp-drag-id")
#let drag(
  at: "",
  body,
) = context {
  if target() == "html" {
    let dragId = drag-counter.get().at(0)
    drag-counter.step()
    let attrs = ("data-drag-id": str(dragId))
    if at != "" { attrs.insert("at", at) }
    html.elem("sp-drag", attrs: attrs)[#body]
  } else {
    [((DRAG: #body))]
  }
}
