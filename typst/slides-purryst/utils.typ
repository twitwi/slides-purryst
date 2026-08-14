
#let path-to-text(p) = {
  let c = [#p].at("text")
  if c.starts-with("path(\"") {
    return c.slice(6, -2)
  } else {
    return c
  }
}
