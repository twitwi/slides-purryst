#let style(css) = context {
  if target() == "html" {
    html.elem("sp-style", attrs: (css: css))
  } else {
    text(css)
  }
}
