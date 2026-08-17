#import "utils.typ": path-to-text

#import "component.typ": component

#let img(
  src: none,
  alt: "",
  width: none,
  height: none,
  style: none,
) = context {
  if src == none { panic("img: src is required") }
  if target() == "html" {
    let attrs = (:)
    attrs.insert("src", path-to-text(src))
    if alt != "" { attrs.insert("alt", alt) }
    if width != none { attrs.insert("width", str(width)) }
    if height != none { attrs.insert("height", str(height)) }
    if style != none { attrs.insert("style", style) }
    component("sp-img", attrs: attrs)
  } else {
    image(src, width: 30%)
    [((IMG: #path-to-text(src)))]
  }
}
