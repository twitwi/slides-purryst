#import "utils.typ": path-to-text

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
#let is-sel(v) = {
  if type(v) != str { return false }
  return v.match(regex("^[#.][[:alnum:]].*")) != none
}
#let parse-sel(sel) = {
  assert(is-sel(sel), message: "parse-sel: sel must be a string starting with '#' or '.': " + sel)
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


// User-oriented function to produce any element, with optional annotation.
#let c(name, ..rest) = {
  let nbpos = rest.pos().len()
  if nbpos == 0 {
    component(name, attrs: rest.named())
  } else {
    let first = rest.pos().at(0)
    let with-anno = is-sel(first)
    if with-anno {
      anno(rest.pos().at(0))
      component(name, attrs: rest.named(), ..rest.pos().slice(1))
    } else {
      component(name, attrs: rest.named(), ..rest.pos())
    }
  }
}



#let c1(name, tagname, key, ..rest) = {
  let pos = rest.pos()
  let named = rest.named()
  assert(pos.len() >= 1, message: name + ": " + key + " is required")

  let v1 = pos.at(0)
  let sel = none
  if is-sel(v1) {
    assert(pos.len() >= 2, message: name + ": " + key + " is required")
    (sel, v1, ..pos) = pos
  } else {
    pos = pos.slice(1)
  }
  named.insert(key, path-to-text(v1))
  if sel != none {
    c(tagname, sel, ..pos, ..named)
  } else {
    c(tagname, ..pos, ..named)
  }
}
