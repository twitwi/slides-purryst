// Chunklets for Typst authoring.
//
// A chunklet is a reusable snippet of Typst markup that can be placed on
// slides from the chunklet toolbar (key `c`). Definitions are written as
// `#chunklet("name", params: "...")[...]` anywhere at the top level of the
// source; the preprocessor captures the body verbatim and passes it as `src`.
//
// At render time, `chunklet-defs()` emits a single
// `<script type="text/html" id="sp-chunklets">` whose content is the raw
// `<sp-chunk>` markup (a raw-text element can only contain text children, so
// the whole markup is emitted as one concatenated string).

#let chunklet-state = state("sp-chunklets", ())

#let chunklet(name, params: "", src: none, body) = {
  if src != none {
    chunklet-state.update(defs => defs + ((name: name, params: params, src: src),))
  }
  []
}

#let chunklet-defs() = context {
  let defs = chunklet-state.get()
  let parts = ()
  for d in defs {
    parts = parts + (
      "<sp-chunk name=\"" + d.at("name") + "\" params=\"" + d.at("params") + "\" data-kind=\"typst\">" + d.at("src") + "</sp-chunk>",
    )
  }
  let txt = parts.fold("", (acc, p) => acc + p + "\n")
  if txt == "" {
    return []
  }
  html.elem("script", attrs: (type: "text/html", id: "sp-chunklets"))[
    #text(txt)
  ]
}
