// #sp-init: one-stop configuration / init for a deck.
//
// Emits a single `<script type="text/html" id="sp-init">` payload consumed by
// `createSlidesPurryst()` at boot:
//
//   - `config`      merges into the "page author" layer of init params (see
//                   AGENTS.md §1.2). `createSlidesPurryst({...})` wins over it;
//                   it wins over individual `data-*` attributes on
//                   `#sp-presentation`; framework defaults come last.
//   - `css`         raw CSS injected into `<head>` before the app mounts.
//   - `js`          raw JS run at the very start of `createSlidesPurryst()`
//                   (define globals, install plugin hooks, ...).
//   - `js-mounted`  raw JS run after mount, once `spApi` / `window.__sp__` is
//                   ready (navigate, tweak config, patch the DOM, ...).
//
// Call it once at the top level of the deck; `#sp-init-defs()` writes the
// payload element. On the bare/demo path the preprocessor auto-appends
// `#sp-init-defs()`; `main.typ` emits it itself (outside `#sp-content`).

#let init-state = state("sp-init", none)

#let sp-init(config: (:), css: "", js: "", js-mounted: "") = {
  init-state.update(_ => (config: config, css: css, js: js, js-mounted: js-mounted))
  []
}

#let sp-init-defs() = context {
  let it = init-state.get()
  if it == none { return [] }
  // json.encode would leave `</script` intact and that would terminate the
  // raw-text <script> element early. Escape `</` -> `<\/` (a valid JSON escape,
  // so `JSON.parse` on the browser side recovers the original text) so the
  // payload can never contain a literal `</script`.
  let safe = json.encode(it).replace("</", "<\\/")
  html.elem("script", attrs: (type: "text/html", id: "sp-init"))[
    #text(safe)
  ]
}
