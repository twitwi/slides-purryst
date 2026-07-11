#let toc(
  start: none,
  end: none,
  ctx: false,
) = context {
  if target() == "html" {
    let attrs = (:)
    if start != none { attrs.insert("start", str(start)) }
    if end != none { attrs.insert("end", str(end)) }
    if ctx { attrs.insert("context", "") }
    html.elem("sp-toc", attrs: attrs)
  } else {
    [((TOC))]
  }
}
