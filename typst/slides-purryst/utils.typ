
// relative path from the typ root dir to the input file dir
#let dir = if "slides-purryst-typfile-dir" in sys.inputs {
      "/" + sys.inputs.at("slides-purryst-typfile-dir") + "/"
} else {
      "/"
}

#let path-to-text(p) = {
  let c = [#p].at("text")
  if c.starts-with("path(\""+dir) {
    return c.slice(6+dir.len(), -2)
  }
  if c.starts-with("path(\"") {
    return c.slice(6, -2)
  }
  return c
}
