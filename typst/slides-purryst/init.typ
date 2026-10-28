// #sp-init: one-stop configuration / init for a deck.
//
// Emits a single `<script type="text/html" id="sp-init">` payload consumed by
// `createSlidesPurryst()` at boot:
//
//   - `config`      merges into the "page author" layer of init params (see
//                   AGENTS.md §1.2). `createSlidesPurryst({...})` wins over it;
//                   it wins over individual `data-*` attributes on
//                   `#sp-presentation`; framework defaults come last. Styling
//                   knobs (hues, `base-font-size`, `scale`, your own vars) go in
//                   its `css-vars` sub-dict: bare keys are namespaced `--sp-`,
//                   a leading `--` is verbatim, `none` removes the property.
//   - `css`         raw CSS injected into `<head>` before the app mounts.
//   - `js`          raw JS run at the very start of `createSlidesPurryst()`
//                   (define globals, install plugin hooks, ...).
//   - `js-mounted`  raw JS run after mount, once `spApi` / `window.__sp__` is
//                   ready (navigate, tweak config, patch the DOM, ...).
//
// Call it at the top level of the deck; `#sp-init-defs()` writes the payload
// element. On the bare/demo path the preprocessor auto-appends `#sp-init-defs()`;
// `main.typ` emits it itself (outside `#sp-content`).
//
// `sp-init(config:, css:, js:, js-mounted:)` is a simple *register* (side
// effect): it stores one payload for `sp-init-defs()`. To share a base config
// across files and override per deck, build the dict with `merge-config` first
// and pass it as `config:` — see AUTHORING.md §3.3 for the recipe.

#let init-state = state("sp-init", none)

// Recursive dict merge: nested dicts merge key-by-key (so e.g. `css-vars`
// composes), arrays and scalars are replaced, `none` passes through. The right
// operand wins on conflicts. `+` already does the shallow version; this re-does
// it deeply for nested dicts (`.insert` mutates `out` in place).
#let deep-merge(a, b) = {
  let out = a + b
  for (k, v) in b {
    if type(v) == dictionary and type(a.at(k, default: none)) == dictionary {
      out.insert(k, deep-merge(a.at(k), v))
    }
  }
  out
}

// Normalize the variadic args of `merge-config` into a config dict: a named
// `config:` first, then each positional dict in order (later wins). Non-dict
// positional args are an error.
#let parse-config-args(args) = {
  let named = args.named()
  let cfg = (:)
  cfg = cfg + named.at("config", default: (:))
  for d in args.pos() {
    assert(type(d) == dictionary, message: "merge-config: positional arguments must be config dictionaries")
    cfg = deep-merge(cfg, d)
  }
  cfg
}

// Pure merge helper (no side effect): returns the merged config of the given
// dicts, for reuse in the deck body and to pass to `sp-init`. `sp-init` can't do
// both (registering is a `state.update`; a function that emits it and returns a
// value would hit "cannot join content with …"), so capture and register are
// separate: `#let cfg = merge-config(base, (tab-title: "X"))` then
// `#sp-init(config: cfg)`.
#let merge-config(..args) = parse-config-args(args)

// Register one payload (a simple overwrite). `config` is the merged dict built
// with `merge-config`. The `state.update` must stay an *unbound* expression
// statement: Typst treats it as a content action that only takes effect when
// emitted.
#let sp-init(config: (:), css: "", js: "", js-mounted: "") = {
  init-state.update(_ => (config: config, css: css, js: js, "js-mounted": js-mounted))
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
