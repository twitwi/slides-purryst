// Cache entries for Typst authoring.
//
// A cache entry is a chunk of *rendered* HTML that is registered once and can
// be included later, possibly many times, e.g. inside slides. Definitions are
// written as `#add-cache-entry("biblio.html")[#bibliography(...)]` anywhere at
// the top level of the source.
//
// Unlike chunklets (which capture source text verbatim via the preprocessor),
// the cache captures rendered content: each entry is emitted by `cache-defs()`
// as an inert `<template data-sp-cache="...">` element, which the engine reads
// at boot and seeds into the include cache. An entry can then be included with
// `<sp-include src="name">` (or the `#slide-bib()` helper for bibliographies),
// and it resolves from the cache without any network fetch.

#let cache-state = state("sp-cache-entries", ())

#let add-cache-entry(name, body) = {
  cache-state.update(entries => entries + ((name: name, body: body),))
  []
}

// Register a bibliography as a cache entry: `#sp-bibliography(path("demo.bib"))`
// renders the bibliography once; `#slide-bib()` then includes the cached
// rendering per slide, filtered to the references cited on the current slide.
// The `bib` argument must be a `path()` value so typst resolves it relative to
// the *calling* file (paths passed as plain strings would resolve against this
// module instead).
#let sp-bibliography(bib, name: "biblio.html", ..args) = {
  add-cache-entry(name)[#bibliography(bib, ..args)]
}

#let cache-defs() = context {
  let entries = cache-state.get()
  for (i, e) in entries.enumerate() {
    html.elem("template", attrs: (
      "data-sp-cache": e.at("name"),
      "data-sp-cache-n": str(i),
    ))[
      #e.at("body")
    ]
  }
}

// Include a cached bibliography and let the runtime filter it to the
// references cited on the current slide (step-aware). The filter is a runtime
// concern: typst's HTML export assigns `loc-*` ids to entries and citations
// that cannot be known (nor matched) from CSS.
#let slide-bib(name: "biblio.html") = html.elem("sp-include", attrs: (
  src: name,
  class: "sp-bib",
))[]
