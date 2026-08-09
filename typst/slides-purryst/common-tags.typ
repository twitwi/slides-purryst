
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

