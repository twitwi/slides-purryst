#import "source.typ": sp-source-state

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
    let s = sp-source-state.get()
    if s.file != none {
      attrs.insert("data-source-file", s.file)
      attrs.insert("data-source-line", str(s.line))
    }
    html.elem("sp-drag", attrs: attrs)[#body]
  } else {
    [((DRAG: #body))]
  }
}
