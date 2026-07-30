#let include-fragment(src) = context {
  if target() == "html" {
    html.elem("sp-include", attrs: (src: src))
  }
}
