
- Do not git commit.
- Analyze with care.
- Reflect on what you propose.
- Keep architecture clean.



Below is the AGENTS.md for authoring slides.
...... (CUTMARK) ......


# SlidesPurryst

SlidesPurryst is a Vue 3 presentation framework. Slides are authored in HTML-like markup inside a `<script>` tag. The framework handles scaling, stepping, animations, transitions, presenter mode, live reload, and export.

---

## 1. Overview & Quick Start

### Quick start (CLI, no setup)

```bash
pnpx slides-purryst
```

Opens a dev server at `localhost:9999` serving the current directory. Place your slides in an `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My talk</title>
</head>
<body>
  <div id="sp-presentation"></div>
  <script type="text/html" id="sp-content">
    <sp-slide><h1>Hello world</h1></sp-slide>
  </script>
  <script src="slides-purryst.bundle.js"></script>
  <script>SlidesPurryst.createSlidesPurryst()</script>
</body>
</html>
```

Live reload: edit the HTML file — slides update in place without page reload.

Other CLI options:

```bash
pnpx slides-purryst --port=7070 my-talk.html   # custom port and file
pnpx slides-purryst --copy-bundle              # copy bundle to cwd and exit
```

`--copy-bundle` copies `slides-purryst.bundle.js` into the current directory so you can open the HTML directly via `file://` without running the server.

### Quick start (development on the framework itself)

```bash
git clone <repo>
cd slides-purryst
pnpm install
pnpm dev          # Vite dev server on port 3334
```

Edit `example/demo-slidespurr.html`.

### Standalone (bundle, copy file to project)

Copy `dist/slides-purryst.bundle.js` into your project directory. Or use the CLI to do it for you:

```bash
pnpx slides-purryst --copy-bundle
```

The same HTML works even when opened via `file://`:

```html
<div id="sp-presentation"></div>
<script type="text/html" id="sp-content">
  <sp-slide><h1>Hello</h1></sp-slide>
</script>
<script src="slides-purryst.bundle.js"></script>
<script>SlidesPurryst.createSlidesPurryst()</script>
```

### npm dependency (version pinned)

```bash
pnpm add slides-purryst
```

```ts
import { createSlidesPurryst } from 'slides-purryst'
import 'slides-purryst/style.css'
createSlidesPurryst()
```

### How it works

Slides are written inside `<script type="text/html" id="sp-content">`:

```html
<script type="text/html" id="sp-content">
  <sp-before>
    <header>My logo</header>
  </sp-before>

  <sp-slide transition="fade">
    <h1>Title Slide</h1>
  </sp-slide>

  <sp-slide>
    <h2>Content slide</h2>
    <p>Revealed step by step</p>
  </sp-slide>

  <sp-after>
    <footer>Footer on every slide</footer>
  </sp-after>
</script>
```

### Config options

```ts
createSlidesPurryst({
  el: '#app',              // Mount target
  transition: 'fade',      // Default transition
  transitionDuration: 500, // ms
  designWidth: 1920,       // Design size (default 1920×1080)
  designHeight: 1080,
  author: 'Your Name',     // Footer text
  presenter: false,        // Force presenter mode
  plugins: [],             // See §4
  activate: (api) => {},   // Inline plugin
})
```

---

## 2. Authoring Slides with SlidesPurr (HTML)

### 2.1 Slides

```html
<sp-slide transition="fade" class="my-theme" notes="Speaker notes" no-toc fake-end>
  Content
</sp-slide>
```

- **`transition`**: `none` (default), `fade`, `zoom`, `slide-up`. Direction-aware.
- **`notes`**: Only visible in presenter mode.
- **`no-toc`**: Exclude from `<sp-toc>`.
- **`fake-end`**: Presentation continues past this slide.
- **`transition-duration`**: Override default duration (ms).

`<sp-before>` and `<sp-after>` can appear alongside slides in the content. They render once before/after all slides in the `.sp-global-top` / `.sp-global-bottom` slots — useful for persistent headers, footers, or controls.

### 2.2 The Step System

Every slide has a **step index** (0..totalSteps-1). Step 0 shows all content that is *always* visible. Higher steps progressively reveal more.

#### Writing steps

The simplest way to write steps is the `sp-steps` attribute on any container:

```html
<ul sp-steps>
  <li>Appears at step 1</li>
  <li>Appears at step 2</li>
  <li>Appears at step 3</li>
</ul>
```

Equivalent: `<sp-steps>` wrapper (produces a `.sp-steps-no-tag` `display:contents` wrapper).

**Options**: `at="+2"` (start offset), `every="2"` (group children), `animation="fade"`, `no-jump` (don't advance counter).

#### Fine-grained control

Use `<sp-step>` to control visibility ranges on specific children:

```html
<sp-step from="2" to="5">
  <p>Visible for steps 2, 3, 4, 5</p>
</sp-step>
<sp-step only="3">
  <p>Visible only at step 3</p>
</sp-step>
<sp-step from="1" until="4">
  <p>Visible for steps 1, 2, 3 (until is exclusive)</p>
</sp-step>
<sp-step from="1" hide animation="fade">
  <p>Visible from step 1, no space reservation when hidden, fade animation</p>
</sp-step>
```

**`<sp-step also>`**: Inherits `from` from preceding `<sp-step>`.

#### Jumping

Control the step counter without content:

```html
<sp-jump at="+1">   <!-- Advance 1 step (invisible) -->
<sp-jump at="0">    <!-- Reset to step 0 -->
<sp-jump at="5">    <!-- Jump to absolute step 5 -->
```

**Aliases**: `<sp-pause>` = `<sp-jump at="+1">`, `<sp-meanwhile>` = `<sp-jump at="0">`.

#### How it renders at runtime

At compile time, steps are converted to data attributes on the elements:

| Attribute | Meaning |
|---|---|
| `data-sp-step="5"` | Visible when `step >= 5` |
| `data-sp-step-from="2"` | Visible when `step >= 2` |
| `data-sp-step-to="7"` | Visible when `step <= 7` |
| `data-sp-step-hide` | No space reservation when hidden |
| `data-sp-step-animation="fade"` | Preset transition |

Classes applied at runtime:
- `.sp-anim-shown` — `opacity: 1; pointer-events: auto`
- `.sp-anim-hidden` — `opacity: 0; pointer-events: none`
- `.sp-anim-only` — can have `display:none` (if `hide`)
- `.sp-anim-preset-fade/up/down/left/right/scale/none` — transition presets

### 2.3 Animations (`<sp-anim>`)

`<sp-anim>` runs spec-based actions at each step. It does not move DOM — it manages CSS classes and element visibility.

```html
<sp-anim at="+0" spec=".foo | 500ms .bar ^ -.baz | @add(highlight, .qux)"></sp-anim>
```

**Spec syntax**: pipe (`|`) separates steps, carat (`^`) separates concurrent actions within a step.

| Pattern | What it does |
|---|---|
| `.my-class` | Show matching elements |
| `-#my-id` | Hide matching elements |
| `@children(sel)` | Expand each child of `sel` into one step per child |
| `@child(sel, n[, b])` | Show child `n` (or range `a..b`) of `sel` in one step — alias for `+sel > :nth-child(n)` / `+sel > :nth-child(n+a):nth-child(-n+b)` |
| `@add(cls, sel)` | Add class `cls` to elements matching `sel` |
| `@remove(cls, sel)` | Remove class |
| `@+class cls sel` | Add class (space-separated syntax) |
| `@-class cls sel` | Remove class |
| `@play(sel, rewind?)` | Play video |
| `@pause(sel)` | Pause video |
| `100ms .foo` | Delay 100ms then show `.foo` |
| `0.5s @add(hl, .bar)` | Delay 500ms then add class |

**`at`**: Step offset. Relative (`+N`) resolved to absolute at compile time. Default `+0`.

**`no-jump`**: Don't advance the step counter.

#### Fast mode

When stepping backward, jumping multiple steps, or on initial render, animations run in **fast mode**: CSS transitions are suppressed, animation `finish()`/`cancel()` is called, and `setTimeout` delays are skipped. Fast mode is coordinated by `SpStepManager` across all animations on a slide.

### 2.4 Alternatives

```html
<sp-alternatives at="+0">
  <p>Shown at step 0</p>
  <p>Shown at step 1</p>
  <p>Shown at step 2</p>
</sp-alternatives>
```

Cycles through children one at a time based on `(step - at) % children.length`. Inactive children get `.sp-anim-hidden.sp-hidden-is-empty` (display:none).

### 2.5 Including External Content

**`<sp-include src="file.html">`**: Fetches and inlines HTML. Cached. Works recursively.

**`<sp-svg src="diagram.svg">`**: Fetches SVG, auto-adds `viewBox`, rewrites `xlink:href` → `href`, deduplicates IDs, moves inline styles to attributes.

**`<sp-img src="photo.png">`**: Images with caching. SVGs inlined as data URIs. Non-SVG preloaded as blobs.

### 2.6 Draggable Elements

```html
<sp-drag at="100|200|300|250|0">
  <div style="background: var(--sp-accent-soft); padding: 1em;">
    Drag me
  </div>
</sp-drag>
```

`at="x|y|width|height|rotate"`. Double-click to enter edit mode — drag to move, corner handles to resize, top handle to rotate. "Save" writes new position back to source via `POST /__sp_edit` (falls back to clipboard).

### 2.7 Table of Contents

```html
<sp-toc start="1" end="-1" highlight="auto">
  <template #default="{ items, currentIndex, goTo, activeSection }">
    <ul>
      <li v-for="item in items" :key="item.index"
          :class="{ active: item.index === currentIndex }"
          @click="goTo(item.index)">
        {{ item.title }}
      </li>
    </ul>
  </template>
</sp-toc>
```

Extracts h1/h2/h3 from all slides. The default slot receives `items`, `currentIndex`, `goTo`, `activeSection`.

### 2.8 Slide Source Display

```html
<sp-slide-source for="2" :transform="(html) => html.replace(/secret/g, '***')"></sp-slide-source>
```

Shows the raw HTML source of a slide with Shiki syntax highlighting. The `for` prop selects which slide (defaults to current). The `transform` prop optionally transforms the source before display. Has a named `header` slot (`v-slot:header="{ forSlide }"`) for custom toolbar controls.

### 2.9 Scoped Styles

```html
<sp-style>
  .my-slide h2 { color: var(--sp-accent); }
</sp-style>
```

Inside a slide, the CSS is scoped to that slide's `.sp-slide-{num}` class. Outside slides (in `<sp-before>`/`<sp-after>`), it's injected globally.

### 2.10 Navigation

**Keyboard** (default bindings):

| Key | Action |
|---|---|
| `Right` / `Space` | Next step or slide |
| `Left` | Previous step or slide |
| `Up` | Previous slide beginning |
| `Down` | Next slide beginning |
| `a` / `z` | Previous/next slide end |
| `f` | Fullscreen |
| `p` | Presenter mode |
| `o` | Overview grid |
| `g` | Go-to prompt (type slide number or search heading text) |
| `b` | Blackout |
| `d` | Dev pane (pro mode) or dark mode |
| `c` | Chunklet toolbar |
| `Home` / `End` | First / last slide |

**Touch**: Swipe left/right on the viewport.

**Nav bar**: Bottom center, auto-hides. Shows slide position, prev/next, counter (clickable for Go prompt), fullscreen/presenter/menu buttons.

**spApi** (accessible as `window.__sp__` or `$sp` in templates):

| Method | Effect |
|---|---|
| `next()` / `prev()` | Next/previous step or slide |
| `nextSlide()` / `prevSlide()` | Next/previous slide unconditionally |
| `goTo(n)` | Jump to slide |
| `goToPrevBegin()` / `goToNextBegin()` | Beginning of prev/next slide |
| `goToPrevEnd()` / `goToNextEnd()` | End of prev/next slide |
| `toggleNavLock()` | Keep nav bar visible |
| `toggleFullscreen()` | Toggle fullscreen |
| `togglePresenter()` | Open/close presenter window |
| `toggleBlackout()` | Toggle black overlay |
| `toggleDevPane()` | Toggle developer tools |
| `toggleChunkBar()` | Toggle chunklet toolbar |
| `export()` | Download standalone HTML |

**Properties**: `navLocked`, `currentIndex`, `stepIndex`, `total`, `dragging`, `showChunletskBar`, `config`, `chunkletDefs`, `chunkletMode`, `selectedChunklet`.

### 2.11 Presenter Mode

Open with `p` key or `?presenter=1` URL param. Shows current slide, next slide preview (at final step), speaker notes, timer with CSV export.

### 2.12 Chunklets

Define reusable content blocks for on-the-fly insertion. Definitions live in a
`<script type="text/html" id="sp-chunklets">` element (same convention as
`#sp-content`); the raw body is parsed at runtime without HTML parsing, so the
chunk bodies may contain any markup — including Typst snippets:

```html
<script type="text/html" id="sp-chunklets">
  <sp-chunk name="box" params="x,y,w,h">
    <sp-drag at="$x|$y|$w|$h|0">
      <div style="background: var(--sp-accent-soft); padding: 1em;"></div>
    </sp-drag>
  </sp-chunk>
</script>
```

- **`params=""`** — inserted immediately
- **`params="x,y"`** — click to place
- **`params="x,y,w,h"`** — drag to draw rectangle
- `$x`, `$y`, `$w`, `$h` are substituted on placement
- Toggle the bar with `c`, select a chunklet, then click/drag on the slide

#### Typst chunklets

In a `.typ` source, define chunklets with `#chunklet("name", params: "...")[...]`.
The preprocessor captures the body verbatim and injects it as `src`, then
`chunklet-defs()` (auto-appended by the preprocessor, or emitted by
`slides-theme`) writes the `<sp-chunk>` markup into the `sp-chunklets` script
with `data-kind="typst"`:

```typst
#chunklet("box", params: "x,y,w,h")[
  #drag(at: "$x|$y|$w|$h|0")[
    Drag me
  ]
]
```

Placing a Typst chunklet shows a placeholder on the slide and POSTs the
substituted snippet (plus the slide's `data-source-line`) to `/__sp_edit`; the
snippet is inserted into the matching `#slide(...)[...]` block in the source
and the slide reappears after recompilation.

The `sp-chunklets` script emitted by Typst is a raw-text element, so its
`<sp-chunk>` markup must be one concatenated text child (`html.elem("script")`
cannot contain element children). Chunklet bodies are excluded from `#source`
line annotation during preprocessing.

### 2.13 Live Reload

On `localhost`, the page auto-updates when source files change. Content changes (edits to `#sp-content`) update in place; CSS/config changes trigger a full page reload.

### 2.14 Export

```js
spApi.export()
```

Creates a standalone `.html` with inlined content, serialized cache, and the slides-purryst bundle — auto-downloads as a Blob.

### 2.15 Configuration

Runtime config stored in `localStorage` key `sp-config`:

```ts
{
  navLocked: boolean,       // Keep nav bar visible
  overviewScale: number,    // 0.05–0.5 (default 0.15)
  proMode: boolean,         // Developer mode
  logSteps: boolean,        // Log step changes in presenter
  darkMode: 'auto' | 'light' | 'dark'
}
```

Config is reactive and auto-saved. Access via `spApi.config`.

---

## 3. Authoring Slides with SlidesPurryst (Typst)

Slides are authored in `.typ` with a `main.typ`-style document, or compiled
through the demo/CLI path (`example/demo-slidespurryst.typ`). The preprocessor
(`lib/preprocess-typst.mjs`) and the typst dev server
(`lib/typst-dev.mjs`) turn Typst into the same `#sp-content` markup the HTML
path uses; everything in §2 (slides, steps, animations, drag, chunklets, …)
is available. Several helpers are re-exported from `slides-purryst/lib.typ`:

| Helper | Emits |
|---|---|
| `#slide(transition: "fade", ...)[...]` | `<sp-slide>` |
| `#steps[...]` / `#step(...)` | `<sp-steps>` / `<sp-step>` |
| `#anim(at, spec)` | `<sp-anim>` |
| `#drag(at: "…")[...]` | `<sp-drag>` |
| `#chunklet("name", params: "…")[...]` | `<sp-chunk>` definition |
| `#add-cache-entry("name.html")[rendered content]` | cache entry |
| `#slide-bib(name: "biblio.html")` | `<sp-include class="sp-bib">` |

### Cache entries

`#add-cache-entry(name)[body]` registers *rendered* HTML once; `#cache-defs()`
then emits each entry as an inert `<template data-sp-cache="…">`. The engine
seeds those into the include cache at boot (`readPayload` in `src/core.ts`), so
`<sp-include src="name">` (or `#include-fragment`) resolves without a fetch —
also in exported/`file://` standalone pages. When the preprocessor finds an
`#add-cache-entry` and no explicit `#cache-defs()` call, it appends one; the
templates are pulled out of `#sp-content` by `wrapPage` (same treatment as the
chunklets script) so they end up as real DOM.

### Bibliographies

```typst
#add-cache-entry("biblio.html")[#bibliography("demo.bib")]
```

Renders the bibliography once. Then any slide that cites works:

```typst
#slide[
  Citing @kadkhodaie2024generalization.
  #slide-bib()
]
```

`#slide-bib()` includes the cached entry with class `sp-bib`; the runtime
filter (`src/composables/useBibFilter.ts`) tags each entry and the block:
`li` whose `id` is cited by a *currently step-visible* citation is shown; a
`li` cited on the slide but not at the current step gets `sp-bib-hidden`
(visibility), and a `li` whose ref is not cited anywhere on the slide gets
`sp-bib-absent` (display none, in addition to `sp-bib-hidden`). The block is
tagged `sp-bib-empty` and hidden when nothing is cited. Typst's HTML export
marks citations as `a[role="doc-biblioref"][href="#loc-…"]` and entries as
`li#loc-…`, so filtering happens against the live DOM after compile.

---

## 4. Developing Plugins

### Plugin structure

```ts
import { definePlugin } from 'slides-purryst'

export default definePlugin({
  name: 'my-plugin',
  order: 0,                    // Lower runs first
  disable: [],                 // Facets to skip: 'anim' | 'keymap' | 'style' | 'chunklet'
  activate: (api: PluginAPI) => {
    // Return a teardown function if needed
    return () => { /* cleanup */ }
  },
})
```

### PluginAPI

| Method | Purpose |
|---|---|
| `api.spApi` | Reactive presentation state (§2.10) |
| `api.addKeymapSetup(fn)` | Register keybindings (see below) |
| `api.addAnimCommand(name, handler)` | Register custom `@command` for `<sp-anim>` specs |
| `api.addAnimActionType(type, handler)` | Register custom action type handler |
| `api.injectStyle(css)` | Inject global CSS |
| `api.addChunklet(def)` | Register a chunklet definition (§2.12) |
| `api.addDomTransform(fn)` | Register a DOM transform applied after step processing |

### Adding keybindings

```ts
import { bind, createDefaultKeymap } from 'slides-purryst'

api.addKeymapSetup((context) => {
  return {
    'x': bind(() => { /* handler */ }, { when: () => !context.dragging }),
  }
})
```

`bind(handler, { when?, preventDefault? })` wraps a handler with a context filter. The `context` object exposes `dragging`, `overviewOpen`, `blackoutActive`, `devPaneOpen`, `goPromptOpen`, `presenterActive`.

To extend (not replace) defaults:

```ts
api.addKeymapSetup((context) => {
  const defaults = createDefaultKeymap(context)
  return { ...defaults, 'x': bind(() => { ... }) }
})
```

### Adding anim commands

```ts
api.addAnimCommand('fade', {
  countSteps: (args) => 1,
  parse: (args) => [{ type: 'addClass', className: 'faded', selector: args }],
  expand: (args, root) => { /* return AnimAction[][] */ },
})
```

### Adding action types

```ts
api.addAnimActionType('addClass', {
  apply: (container, action, fast) => {
    container.querySelectorAll(action.selector).forEach(el => {
      el.classList.add(action.className)
    })
  },
  reverse: (container, action) => { /* undo */ },
  init: (container, action) => { /* setup for first render */ },
})
```

### Adding DOM transforms

```ts
api.addDomTransform((root: Element) => {
  root.querySelectorAll('my-custom-tag').forEach(el => {
    // Mutate the DOM before mounting
  })
})
```

Transforms run after `processSlideHtml` converts step/animation markup to data attributes, just before the slide HTML is compiled into a Vue component. This is the right place to introduce new custom elements that map to data attributes or component props.

### Inline `activate`

```ts
createSlidesPurryst({
  activate: (api) => {
    api.addKeymapSetup(() => ({ ... }))
  }
})
```

This is sugar for a plugin with `order: 100`.

---

## 5. Evolving SlidesPurryst Itself

### Project structure

```
bin/
  cli.mjs              # CLI entry: HTTP server, live reload, --copy-bundle
lib/
  edit-handler.mjs     # Shared /__sp_edit handler (drag, chunklets, typst)
src/
  index.ts              # Public API exports
  core.ts               # createSlidesPurryst(), builtin components, boot sequence
  types.ts              # All TypeScript interfaces
  sp-api.ts             # Reactive spApi singleton
  plugin.ts             # Plugin registry
  animCommands.ts       # Built-in anim commands + action type handlers
  components/
    SpPresentation.vue   # Root component — viewport, nav, transitions
    SpSlide.vue          # Per-slide wrapper, provides animInstances set
    SpStepManager.vue    # Per-slide step orchestrator (watch + register + synchronize)
    SpAnim.vue           # Spec-based animation engine
    SpStep.vue           # Runtime <sp-step> (compile-time equivalent in useSteps.ts)
    SpAlternatives.vue   # Cycle through children by step
    SpDrag.vue           # Draggable positioned element
    SpInclude.vue        # External HTML inclusion
    SpSvg.vue            # SVG-specific inclusion
    SpImg.vue            # Image with caching
    SpStyle.vue          # Scoped style injection
    SpToc.vue            # Table of contents
    SpSlideSource.vue    # Raw source display
    SpPresenterView.vue  # Presenter mode layout
    SpDevPane.vue        # Developer tools
    SpOverview.vue       # Slide grid overview
    SpGoPrompt.vue       # Go-to slide dialog
  composables/
    useSteps.ts          # processSlideHtml(), useSteps() composable, step/animation processing
    useSlides.ts         # Slide parsing from DOM
    useScale.ts          # Viewport scaling
    usePresenter.ts      # Presenter mode communication via BroadcastChannel
    useNavigation.ts     # Keyboard + touch + hash navigation
    useStorage.ts        # localStorage config persistence
    useSlideTree.ts      # Heading extraction for TOC
    resolveIncludes.ts   # <sp-include> resolution with stack tracking
    includeCache.ts      # Text + binary include cache
  style/
    anim.css             # Animation/step CSS classes
    theme.css            # Design tokens
    (other CSS files)
  transformers/
    svg.ts               # SVG transformers (viewBox, xlink, IDs, style→attribute)
```

### The pipeline

When `createSlidesPurryst()` boots:

1. Read `#sp-content` text content
2. `resolveTopIncludes()` — recursively resolve `<sp-include>` tags in raw HTML
3. `extractRawSlideSources()` — save unmodified per-slide HTML for source display
4. `fixVoidElementsHtml()` — close void tags (`<sp-anim/>` → `<sp-anim></sp-anim>`)
5. `annotateEditableWithIndex()` — add `:editable-index` to `<sp-slide>` and `<sp-drag>`
6. `parseElementToSlides()` — parse DOM into `SlideData[]`
7. For each slide: `processSlideHtml()` — process aliases, `sp-step`, `sp-steps`, `sp-jump`, `sp-anim`, alternatives, apply DOM transforms, compute step count
8. Mount `SpPresentation` with props (slides, transitions, components)

### Key Architecture

**Step reactivity**: `SpPresentation` provides `stepIndex` (a `Ref<number>`) via `provide('stepIndex')`. All step-reactive components inject it.

**Orchestration**: `SpSlide` provides a `Set<AnimHandle>`. On each slide:
- `SpAnim` registers a handle (exposing `syncToStep` and `refresh`) on mount, unregisters on unmount
- `SpStepManager` watches `stepIndex` and content version, then iterates all handles in a coordinated fast-mode batch
- Fast mode: adds `.sp-anim-fast` to the slide container → calls own step visibility → calls all anims' `syncToStep` → runs `getAnimations({ subtree: true })` finish/cancel → removes class

**Scaling**: The `.sp-viewport` div is scaled via CSS `transform: scale(...)` to fit the browser window based on the design width/height ratio.

**Transitions**: Three slides preloaded (prev at final step, current, next at step 0). On slide change, the transition class (e.g. `fade`) triggers CSS transitions on the swapped slides.

### Developer commands

```bash
pnpm install           # Install deps
pnpm dev               # sp-dev with --watch example/ (opens demo-slidespurr.html)
pnpm dev:typst         # sp-dev with .typ compilation
pnpm build             # Build dist/ (library + bundle)
pnpm dev:bundle        # Zero-dep CLI (bundle-based static server)
```

### Releasing

Tags include `dist/` for zero-setup consumption via `pnpm add github:twitwi/slides-purryst#latest`.
The `latest` tag is a moving reference; version tags are immutable.

```bash
bash scripts/release.sh v0.1.0                # normal release, moves latest
bash scripts/release.sh --no-latest v0.1.0    # backport fix to existing tag
bash scripts/release.sh --only-latest         # update latest from main (no version tag)
```

The script builds `dist/`, commits it along with the version tag, pushes
(both tag and latest), then resets main to its pre-release state.

### Conventions

- Components are single-file Vue 3 `<script setup lang="ts">`
- State shared across components uses provide/inject (not a global store)
- `spApi` is the one reactive singleton — used sparsely for truly global state
- Anim commands and action types are registered via the plugin registry, not hardcoded
- Step processing is compile-time (in `processSlideHtml`), not runtime — all `data-*` attributes are set before mounting
