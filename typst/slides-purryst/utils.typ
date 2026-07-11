
#let path-to-text(p) = {
  let c = [#p]
  return c.at("text").slice(6, -2)
}
