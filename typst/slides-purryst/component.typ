#let pending-anno = state("slides-purryst-pending-anno", none)

#let component(name, attrs: (:), body) = context {
  if target() == "html" {
    let pending = pending-anno.get()
    let out = (:)
    for (k, v) in attrs { out.insert(k, v) }
    if pending != none {
      pending-anno.update(none)
      for (k, v) in pending {
        if k == "class" and out.at("class", default: none) != none {
          out.insert("class", out.at("class") + " " + v)
        } else {
          out.insert(k, v)
        }
      }
    }
    if body == none {
      return html.elem(name, attrs: out)
    } else {
      return html.elem(name, attrs: out, body)
    }
  } else {
    if body != none { body }
  }
}
