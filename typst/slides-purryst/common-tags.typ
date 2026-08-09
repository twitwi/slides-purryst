
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
#let h1(body, attrs: (:)) = component("h1", body, attrs: attrs)
#let h2(body, attrs: (:)) = component("h2", body, attrs: attrs)
#let h3(body, attrs: (:)) = component("h3", body, attrs: attrs)

#let p(body, attrs: (:)) = component("p", body, attrs: attrs)
#let span(body, attrs: (:)) = component("span", body, attrs: attrs)
#let div(body, attrs: (:)) = component("div", body, attrs: attrs)

#let ul(body, attrs: (:)) = component("ul", body, attrs: attrs)
#let ol(body, attrs: (:)) = component("ol", body, attrs: attrs)
#let li(body, attrs: (:)) = component("li", body, attrs: attrs)

