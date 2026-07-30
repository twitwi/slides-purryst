#let alternatives(at: none, cycle: false, ..children) = context {
  let items = children.pos()
  if target() == "html" {
    let attrs = (:)
    if at != none { attrs.insert("at", str(at)) }
    if cycle { attrs.insert("cycle", "") }
    let guessHasBody = children.len() == 1 and type(children.at(0)) == content
    html.elem("sp-alternatives", attrs: attrs, {
      if guessHasBody {
        children.at(0)
      } else {
        for child in items { html.elem("span", attrs: (class: "sp-passthrough"))[#child] }
      }
    })
  } else {
    [#for child in items { child }]
  }
}
