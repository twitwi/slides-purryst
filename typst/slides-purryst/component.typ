#let pending-anno = state("slides-purryst-pending-anno", none)

#let component(name, attrs: (:), ..maybe-body) = {
  context if target() == "html" {
    let out = (:)
    for (k, v) in attrs { out.insert(k, v) }
    let pending = pending-anno.get()      
    if pending != none {
      for (k, v) in pending {
        if k == "class" and out.at("class", default: none) != none {
          out.insert("class", out.at("class") + " " + v)
        } else {
          out.insert(k, v)
        }
      }
    }
    html.elem(name, attrs: out, ..maybe-body)
  } else {
    if body != none { body }
  }
  pending-anno.update(pending => {
    return none
  })
}
