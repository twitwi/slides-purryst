#let codeblock(source, lang: none, class: none) = context {
  if target() == "html" {
    let attrs = (class: "cb")
    if class != none { attrs.insert("class", "cb " + class) }
    show raw: it => html.elem("div", attrs: attrs, {
      for line in it.lines {
        html.elem("span", attrs: (class: "cb-line"))[#line.body]
      }
    })
    raw(source, lang: lang)
  } else {
    raw(source, lang: lang)
  }
}
