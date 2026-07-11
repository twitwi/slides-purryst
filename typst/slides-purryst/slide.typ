#let slide(
  transition: none,
  transitionDuration: none,
  no-toc: false,
  fake-end: false,
  bg: none,
  body,
) = context {
  if target() == "html" {
    let attrs = (:)
    if transition != none { attrs.insert("transition", transition) }
    if transitionDuration != none { attrs.insert("transition-duration", transitionDuration) }
    if no-toc { attrs.insert("no-toc", "") }
    if fake-end { attrs.insert("fake-end", "") }
    if bg != none { attrs.insert("bg", bg) }
    html.elem("sp-slide", attrs: attrs)[#body]
  } else {
    body
  }
}
