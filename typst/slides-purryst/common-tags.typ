
#import "component.typ": component

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

// to be typically used with something like sel: ".no-bullet"
// and a custom css like ":has(> .no-bullet) {...}"
#let A(sel) = {
  let (id, classes) = parse-sel(sel)
  let attrs = (class: classes.join(" "))
  if id != none { attrs.insert("id", id) }
  return component("span", none, attrs: attrs)
}

// wrap base HTML elements

#let h1(body, attrs: (:)) = component("h1", body, attrs: attrs)
#let h2(body, attrs: (:)) = component("h2", body, attrs: attrs)
#let h3(body, attrs: (:)) = component("h3", body, attrs: attrs)

#let p(body, attrs: (:)) = component("p", body, attrs: attrs)
#let span(body, attrs: (:)) = component("span", body, attrs: attrs)
#let div(body, attrs: (:)) = component("div", body, attrs: attrs)

#let ul(body, attrs: (:)) = component("ul", body, attrs: attrs)
#let ol(body, attrs: (:)) = component("ol", body, attrs: attrs)
#let li(body, attrs: (:)) = component("li", body, attrs: attrs)

