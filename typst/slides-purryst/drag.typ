#import "source.typ": sp-source-state

#import "component.typ": component

#let drag-counter = counter("sp-drag-id")
#let drag(
  rbox: "",
  body,
) = context {
  if target() == "html" {
    let dragId = drag-counter.get().at(0)
    drag-counter.step()
    let attrs = ("data-drag-id": str(dragId))
    if rbox != "" { attrs.insert("rbox", rbox) }
    let s = sp-source-state.get()
    if s.file != none {
      attrs.insert("data-source-file", s.file)
      attrs.insert("data-source-line", str(s.line))
    }
    component("sp-drag", attrs: attrs)[#body]
  } else {
    [((DRAG: #body))]
  }
}
