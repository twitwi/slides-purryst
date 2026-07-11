#let img(
  src: none,
  alt: "",
  width: none,
  height: none,
  style: none,
) = context {
  if target() == "html" {
    let attrs = (:)
    if src == none { panic("img: src is required") }
    attrs.insert("src", src)
    if alt != "" { attrs.insert("alt", alt) }
    if width != none { attrs.insert("width", str(width)) }
    if height != none { attrs.insert("height", str(height)) }
    if style != none { attrs.insert("style", style) }
    html.elem("sp-img", attrs: attrs)
  } else {
    image(src)
  }
}
