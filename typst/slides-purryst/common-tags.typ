
#import "component.typ": component, anno, parse-sel, pending-anno


// User-oriented function to produce any element, with optional annotation.
#let c(name, ..rest) = {
  let nbpos = rest.pos().len()
  if nbpos == 0 {
    component(name, attrs: rest.named())
  } else {
    let first = rest.pos().at(0)
    let with-anno = type(first) == str and (first.starts-with(".") or first.starts-with("#"))
    if with-anno {
      anno(rest.pos().at(0))
      component(name, attrs: rest.named(), ..rest.pos().slice(1))
    } else {
      component(name, attrs: rest.named(), ..rest.pos())
    }
  }
}



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
