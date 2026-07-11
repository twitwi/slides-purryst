#let svg(
  src: none,
  width: none,
  height: none,
  wrap: false,
  class: none,
) = context {
  if target() == "html" {
    let attrs = (:)
    if src == none { panic("svg: src is required") }
    attrs.insert("src", src)
    if width != none { attrs.insert("width", str(width)) }
    if height != none { attrs.insert("height", str(height)) }
    if wrap { attrs.insert("wrap", "") }
    if class != none { attrs.insert("class", class) }
    html.elem("sp-svg", attrs: attrs)
  } else {
    image(src)
  }
}
