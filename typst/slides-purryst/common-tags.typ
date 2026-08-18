#import "utils.typ": path-to-text
#import "component.typ": component, anno, parse-sel, is-sel, c, c1, pending-anno


// wrap usual base HTML elements

#let h1 = c.with("h1")
#let h2 = c.with("h2")
#let h3 = c.with("h3")
#let h4 = c.with("h4")
#let h5 = c.with("h5")
#let h6 = c.with("h6")

#let p     = c.with("p")
#let a     = c.with("a")
#let div   = c.with("div")
#let span  = c.with("span")
#let input = c.with("input")

#let ul = c.with("ul")
#let ol = c.with("ol")
#let li = c.with("li")
#let dl = c.with("dl")

#let table = c.with("table")
#let thead = c.with("thead")
#let tbody = c.with("tbody")
#let tr = c.with("tr")
#let td = c.with("td")
#let th = c.with("th")

// prevent shadowing of Typst's native elements
//#let code = c.with("code")
//#let label = c.with("label")
#let ccode = c.with("code")
#let clabel = c.with("label")

// one param (with path-to-text) and optional annotation
#let img = c1.with("img", "sp-img", "src")
// like img but converting the possible wrap param
#let svg(..rest) = {
  let name = "svg"
  let key = "src"
  let tagname = "sp-svg"
  let pos = rest.pos()
  let named = rest.named()
  assert(pos.len() >= 1, message: "svg: src is required")
  if named.at("wrap", default: false) {
    named.insert("wrap", "")
  }
  let v1 = pos.at(0)
  let sel = none
  if is-sel(v1) {
    assert(pos.len() >= 2, message: name + ": " + key + " is required")
    let sel = v1
    v1 = pos.at(1)
    pos = pos.slice(2)
  } else {
    pos = pos.slice(1)
  }
  named.insert(key, path-to-text(v1))
  if sel != none {
    c(tagname, sel, ..pos, ..named)
  } else {
    c(tagname, ..pos, ..named)
  }
  /*
  if is-sel(pos.at(0)) {
    assert(pos.len() >= 2, message: "svg: src is required")
    let sel = pos.at(0)
    let src = path-to-text(pos.at(1))
    c("sp-svg", sel, src: src, ..pos.slice(2), ..named)
  } else {
    let src = path-to-text(pos.at(0))
    c("sp-svg", src: src, ..pos.slice(1), ..named)
  }
  */
}


// to be typically used with something like """  - hello #mark(".no-bullet") """
// and a custom css like ":has(> .no-bullet) {...}" (existing in themes.css)
#let mark(sel) = {
  c("span", sel, "")
}

// used in show rules
#let anno-list-like(tag) = (it) => context {
  let pending = pending-anno.get()
  pending-anno.update(none)
  if target() == "html" and pending != none {
    html.elem(tag, attrs: pending, {
      for ch in it.children {
        html.elem("li", ch.body)
      }
    })
  } else {
    it
  }
}

// Typst's HTML export maps heading level N to <h{N+1}>, keep that consistent

// used in show rules
// Typst's HTML-export maps heading level N to <h{N+1}>, keep that consistent
#let anno-heading(it) = {
  c("h" + str(it.level + 1), it.body)
}
