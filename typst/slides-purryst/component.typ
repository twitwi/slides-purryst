#let pending-anno = state("slides-purryst-pending-anno", none)

// Low level component that can be used to produce any element.
// It consumes potential annotations
// Users might prefer using the #c function instead (see common-tags.typ).
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
    let joined-body = maybe-body.pos().join("")
    html.elem(name, attrs: out, joined-body)
  } else {
    if body != none { body }
  }
  pending-anno.update(none)
}

// parse "#id.a.b" into (id: "id", classes: ("a", "b"))
#let parse-sel(sel) = {
  let id = none
  let classes = ()
  for part in sel.split(".") {
    if part == "" { continue }
    if part.starts-with("#") {
      if id == none { id = part.slice(1) }
    } else {
      classes.push(part)
    }
  }
  (id: id, classes: classes)
}

// pending annotation: applies to the next html element (components,
// native lists/enums, headings) in document order
#let anno(sel, ..maybe-body) = {
  let parsed = parse-sel(sel)
  let attrs = (:)
  if parsed.id != none { attrs.insert("id", parsed.id) }
  if parsed.classes.len() > 0 { attrs.insert("class", parsed.classes.join(" ")) }
  pending-anno.update(it => attrs)
  for b in maybe-body.pos() {
    b
  }
}

