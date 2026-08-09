#let jump(at) = context {
  if target() == "html" {
    html.elem("sp-jump", attrs: (at: at))
  }
}

#let meanwhile = jump("0")

#let pause = jump("+1")
