#let step(from: none, to: none, until: none, animation: none, hide: false, also: false, body) = context {
  if target() == "html" {
    let attrs = (:)
    if from != none { attrs.insert("from", str(from)) }
    if to != none { attrs.insert("to", str(to)) }
    if until != none { attrs.insert("until", str(until)) }
    if animation != none { attrs.insert("animation", animation) }
    if hide { attrs.insert("hide", "") }
    if also { attrs.insert("also", "") }
    html.elem("sp-step", attrs: attrs)[#body]
  } else {
    body
  }
}

#let steps(every: none, at: none, animation: none, no-jump: false, ..children) = context {
  let items = children.pos()
  if target() == "html" {
    let attrs = (:)
    if every != none { attrs.insert("every", str(every)) }
    if at != none { attrs.insert("at", str(at)) }
    if animation != none { attrs.insert("animation", animation) }
    if no-jump { attrs.insert("no-jump", "") }
    let guessHasBody = children.len() == 1 and type(children.at(0)) == content
    html.elem("sp-steps", attrs: attrs, {
      if guessHasBody {
        children.at(0)
      } else {
        for child in items { html.elem("span", attrs: (class: "sp-passthrough"))[#child] }
      }
    })
  } else {
    [#for child in items { child }]
    [#body]
  }
}
