#import "source.typ": sp-source-state

#let slide-counter = counter("sp-slide-id")
#let slide(
  transition: none,
  transitionDuration: none,
  no-toc: false,
  fake-end: false,
  notes: none,
  class: none,
  bg: none,
  body,
) = context {
  let slideId = slide-counter.get().at(0)
  slide-counter.step()
  if target() == "html" {
    let attrs = (:)
    if transition != none { attrs.insert("transition", transition) }
    if transitionDuration != none { attrs.insert("transition-duration", transitionDuration) }
    if no-toc { attrs.insert("no-toc", "") }
    if fake-end { attrs.insert("fake-end", "") }
    if notes != none { attrs.insert("notes", notes) }
    if class != none { attrs.insert("class", class) }
    if bg != none { attrs.insert("bg", bg) }
    let s = sp-source-state.get()
    if s.file != none {
      attrs.insert("data-source-file", s.file)
      attrs.insert("data-source-line", str(s.line))
    }
    html.elem("sp-slide", attrs: attrs)[#body]
  } else {
    place(bottom + left, text(size: 50pt, str(slideId + 1)))
    body
    pagebreak()
  }
}
