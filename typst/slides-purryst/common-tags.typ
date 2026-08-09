
#import "component.typ": component, pending-anno

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

#let component-auto(tag) = (..args, body) => {
  assert(args.pos().len() <= 1, message: "Only 1 or 2 positional")
  let sel = args.pos().at(1, default: "")
  if sel == "" { return component(tag, body, ..args) }
  let attrs = args.named().at("attrs", default: (:))
  let parsed = parse-sel(sel)
  if parsed.id != none and attrs.at("id", none) == none {
    attrs.insert("id", parsed.id)
  }
  if parsed.classes.len() > 0 {
    let cls = (attrs.at("class", default:"") + " " + parsed.classes.join(" ")).trim()
    attrs.insert("class", cls)
  }
  let named = args.named().del("attrs")
  return component(tag, attrs: attrs, body, ..named)
}

// to be typically used with something like sel: ".no-bullet"
// and a custom css like ":has(> .no-bullet) {...}"
#let MARK(sel) = {
  let (id, classes) = parse-sel(sel)
  let attrs = (class: classes.join(" "))
  if id != none { attrs.insert("id", id) }
  return component("span", none, attrs: attrs)
}

// pending annotation: applies to the next html element (components,
// native lists/enums, headings) in document order
#let anno(sel) = {
  let parsed = parse-sel(sel)
  let attrs = (:)
  if parsed.id != none { attrs.insert("id", parsed.id) }
  if parsed.classes.len() > 0 { attrs.insert("class", parsed.classes.join(" ")) }
  pending-anno.update(attrs)
}

#let anno-list-like(tag) = (it) => context {
  let pending = pending-anno.get()
  if target() == "html" and pending != none {
    pending-anno.update(none)
    html.elem(tag, attrs: pending)[
      #for c in it.children [
        #html.elem("li", c.body)
      ]
    ]
  } else {
    it
  }
}

// Typst's HTML export maps heading level N to <h{N+1}>, keep that consistent
#let anno-heading(it) = context {
  let pending = pending-anno.get()
  if target() == "html" and pending != none {
    pending-anno.update(none)
    html.elem("h" + str(it.level + 1), attrs: pending, it.body)
  } else {
    it
  }
}

// wrap base HTML elements

#let h1(body, attrs: (:)) = component("h1", attrs: attrs, body)
#let h2(body, attrs: (:)) = component("h2", attrs: attrs, body)
#let h3(body, attrs: (:)) = component("h3", attrs: attrs, body)

#let p(body, attrs: (:)) = component("p", attrs: attrs, body)
#let span(body, attrs: (:)) = component("span", attrs: attrs, body)
#let div(body, attrs: (:)) = component("div", attrs: attrs, body)

#let ul(body, attrs: (:)) = component("ul", attrs: attrs, body)
#let ol(body, attrs: (:)) = component("ol", attrs: attrs, body)
#let li(body, attrs: (:)) = component("li", attrs: attrs, body)

#let table(body, attrs: (:)) = component("table", attrs: attrs, body)
#let tr(body, attrs: (:)) = component("tr", attrs: attrs, body)
#let td(body, attrs: (:)) = component("td", attrs: attrs, body)
#let th(body, attrs: (:)) = component("th", attrs: attrs, body)

