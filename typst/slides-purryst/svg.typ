#import "utils.typ": path-to-text
#import "component.typ": component

#let svg(
  src: none,
  width: none,
  height: none,
  wrap: false,
  class: none,
) = context {
  if src == none { panic("svg: src is required") }
  if target() == "html" {
    let attrs = (:)
    attrs.insert("src", path-to-text(src))
    if width != none { attrs.insert("width", str(width)) }
    if height != none { attrs.insert("height", str(height)) }
    if wrap { attrs.insert("wrap", "") }
    if class != none { attrs.insert("class", class) }
    component("sp-svg", attrs: attrs)
  } else {
    image(src, width: 30%)
    [((IMG: #path-to-text(src)))]
  }
}
