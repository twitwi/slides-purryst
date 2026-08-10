# SlidesPurryst — Authoring Guide

SlidesPurryst is a Vue 3 presentation framework. You write slides in an
HTML-like markup that is a *superset of HTML*: any regular element plus a few
custom `<sp-*>` components for slides, stepping, animations, and more. The
framework then handles scaling, stepping, animations, transitions, presenter
mode, live reload, and export.

There are two authoring paths that produce the **same** intermediate markup:

- **Raw HTML** — write the markup directly inside a `<script type="text/html">`
  tag in your page.
- **Typst** — write your deck in `.typ`; a preprocessor turns it into the
  HTML-like markup for you.

Every feature in this guide is shown for both paths, side by side.

> **For agents** working on the framework code, a short rule list lives in
> [`AGENTS.md`](AGENTS.md). The internal architecture (pipeline, project
> layout, development and release commands) is covered in
> [Part IV](#part-iv-extending--contributing).

---

## Table of contents

- [Part I — Get going](#part-i--get-going)
  - [1. Concepts](#1-concepts)
  - [2. Your first deck](#2-your-first-deck)
  - [3. Configuration](#3-configuration)
- [Part II — Authoring](#part-ii--authoring)
  - [4. Slides & persistent regions](#4-slides--persistent-regions)
  - [5. Revealing content step by step](#5-revealing-content-step-by-step)
  - [6. Animations](#6-animations)
  - [7. Alternatives](#7-alternatives)
  - [8. Includes: HTML, SVG, images](#8-includes-html-svg-images)
  - [9. Draggable elements](#9-draggable-elements)
  - [10. Table of contents](#10-table-of-contents)
  - [11. Showing slide source](#11-showing-slide-source)
  - [12. Styling](#12-styling)
  - [13. Chunklets (reusable snippets)](#13-chunklets-reusable-snippets)
  - [14. Bibliographies & cache entries](#14-bibliographies--cache-entries)
  - [15. Vue components in slides](#15-vue-components-in-slides)
- [Part III — Presenting](#part-iii--presenting)
  - [16. Navigation](#16-navigation)
  - [17. Presenter mode](#17-presenter-mode)
  - [18. Runtime config & the `spApi` reference](#18-runtime-config--the-spapi-reference)
- [Part IV — Extending & contributing](#part-iv--extending--contributing)
  - [19. Plugins](#19-plugins)
  - [20. Architecture](#20-architecture)
  - [21. Development & releasing](#21-development--releasing)

---

# Part I — Get going

## 1. Concepts

Slides live in a `<script type="text/html" id="sp-content">` element. This is
just text — the browser does not render it, the framework reads it at boot:

```html
<script type="text/html" id="sp-content">
  <sp-slide>
    <h1>Hello</h1>
  </sp-slide>
</script>
```

Inside `#sp-content` you can use:

- **Any regular HTML** (headings, lists, tables, `img`, …).
- **Custom `<sp-*>` elements**: `<sp-slide>`, `<sp-steps>`/`<sp-step>`,
  `<sp-anim>`, `<sp-include>`, `<sp-drag>`, `<sp-toc>`, and a few others.
- **`<sp-before>` / `<sp-after>`** regions rendered once before/after all
  slides (persistent headers, footers, controls).
- **A `<style>` / `<sp-style>`** block for global (or per-slide scoped) CSS.

The markup inside `#sp-content` is **processed at compile time**: steps and
animations are rewritten into `data-sp-*` attributes *before* the slide is
compiled into a Vue component. This happens once per slide on load, not at
runtime per keypress.

When authoring in **Typst**, the preprocessor generates this exact markup. So
everything below that mentions `<sp-…>` has a `#…(...)` Typst counterpart, and
anything you can hand-write in HTML can also be produced from Typst.

## 2. Your first deck

### 2.1 The HTML skeleton

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

The equivalent Typst deck (`index.typ`):

```typst
#import "slides-purryst/lib.typ": *

#slide[
  #h1[Hello world]
]
```

You write `.typ`; the preprocessor compiles it into the `#sp-content` markup
above.

### 2.2 Running it

| What you want | Command |
|---|---|
| Serve an HTML deck with live reload (no setup) | `pnpx slides-purryst` |
| Serve a Typst deck | `pnpm slides-purryst index.typ` |
| Custom port / file | `pnpx slides-purryst --port=7070 my-talk.html` |
| Copy the bundle next to your HTML and quit | `pnpx slides-purryst --copy-bundle` |
| Vite dev server (npm-dependency setup) | `pnpm sp-dev` |
| Hacking on the framework itself | `pnpm dev` (serves `example/`) |
`--copy-bundle` copies `slides-purryst.bundle.js` into the current directory so
the HTML works even when opened via `file://` (no server). Note that under
`file://` network fetches fail: custom Vue components, `<sp-include>` and
`<sp-svg>` only work if the content is already in the cache (e.g. from a
standalone export).

### 2.3 A few slides and some navigation

Add more `<sp-slide>` elements, plus a persistent footer via `<sp-before>` /
`<sp-after>`:

```html
<script type="text/html" id="sp-content">
  <sp-before>
    <header class="my-logo">My talk</header>
  </sp-before>

  <sp-slide transition="fade">
    <h1>Title Slide</h1>
  </sp-slide>

  <sp-slide>
    <h2>Agenda</h2>
    <ul sp-steps>
      <li>Part one</li>
      <li>Part two</li>
    </ul>
  </sp-slide>

  <sp-after>
    <footer>Footer on every slide</footer>
  </sp-after>
</script>
```

Navigate with `→`/`Space` (next), `←` (previous), `Home`/`End`. See
[Part III](#part-iii--presenting) for the full key map.

## 3. Configuration

### 3.1 Config options

`createSlidesPurryst({ ... })` accepts:

```ts
createSlidesPurryst({
  el: '#app',              // Mount target
  transition: 'fade',      // Default transition (none | fade | zoom | slide-up)
  transitionDuration: 500, // ms
  designWidth: 1920,       // Design size, default 1920×1080
  designHeight: 1080,
  author: 'Your Name',     // Footer text
  presenter: false,        // Force presenter mode
  theme: 'simple',         // <html> class theme-* (see themes registry)
  seed: 12345678,          // Favicon seed
  plugins: [],             // See §19
  activate: (api) => {},   // Inline plugin
})
```

In **Typst**, the same options can come from the `slides-purryst-presentation`
wrapper (for the bare/demo path the preprocessor wraps things for you):

```typst
#slides-purryst-presentation(
  title: "My talk",
  author: "Your Name",
  design-width: 1920,
  design-height: 1080,
  theme: "conference",
  transition: "fade",
  transition-duration: 500,
)[
  #slide[ ... ]
]
```

It emits `<div id="sp-presentation" data-design-width="..." data-author="..."
data-theme="...">` plus the bundle `<script>` tags.

### 3.2 The layer model

Init params resolve from several layers. Precedence (highest wins):

```
localStorage prefs          (darkMode, navLocked, ... — user-level, own keys)
createSlidesPurryst({...})  ← JS, overrides everything below
  #sp-init config           ← page author (typst #sp-init or HTML payload)
    data-* on id="sp-presentation"  (design-width, design-height, author, seed,
                                 theme, transition, transition-duration,
                                 presenter, or a data-sp-init='{...json...}' blob)
      framework defaults    ← lowest
```

`id="sp-presentation"` accepts the `data-*` scalars shown above, or one
`data-sp-init='{...json...}'` blob containing any of them (the blob wins over
the individual scalars). `createSlidesPurryst({...})` always wins.

### 3.3 `#sp-init` — config / css / js from the page

Both paths can ship an optional `<script type="text/html" id="sp-init">`
payload consumed at boot:

```html
<script type="text/html" id="sp-init">
{"config": {"theme": "conference"}, "css": "html { --sp-scale: .9; }",
 "js": "window.__myHooks = {...}", "jsMounted": "console.log(window.__sp__.total)"}
</script>
```

- **`config`** — merges into the page-author layer (see precedence above).
- **`css`** — injected into `<head>` before the app mounts.
- **`js`** — runs at the very start of `createSlidesPurryst()` (before options
  resolve / mount). `window.__sp__` does **not** exist yet — use it to define
  globals, patch helpers, or install plugin hooks.
- **`js-mounted`** — runs right after mount; `window.__sp__` / `spApi` and the
  DOM are live.

In Typst this is a single helper call at the top of your deck (the preprocessor
auto-appends `#sp-init-defs()`, which writes the payload element):

```typst
#sp-init(
  config: (transition: "fade", theme: "conference", presenter: false),
  css: "html.theme-conference { --sp-scale: .97; }",
  js: "window.__myPlugin = { activate(api) { ... } }",
  js-mounted: "console.log('booted', window.__sp__.total)",
)
```

Values must be JSON-serializable; the payload is JSON-encoded with `</` escaped
to `<\/` so it can never terminate the raw-text `<script>` early.

### 3.4 Themes

The `theme` option is a **class name only**: the framework swaps the
`.theme-*` class on `<html>`. Built-in themes (`simple`, `conference`, `draft`,
`funky`) and variants (`is-small`, `is-sharp`, `is-paper`, …) live in
`src/style/themes.css`. Colors stay in CSS; custom hues via
`--sp-theme-hue` / `--sp-theme-secondary-hue`, and you can inject arbitrary
overrides with the `css:` key of `#sp-init`.

---

# Part II — Authoring

> Each section shows the **HTML form** first, then the **Typst form** of the
> same feature.

## 4. Slides & persistent regions

### HTML

```html
<sp-slide transition="fade" class="my-theme" notes="Speaker notes" no-toc fake-end>
  Content
</sp-slide>
```

- **`transition`** — `none` (default), `fade`, `zoom`, `slide-up`.
  Direction-aware (forward/backward).
- **`notes`** — speaker notes, only visible in presenter mode.
- **`no-toc`** — exclude from `<sp-toc>`.
- **`fake-end`** — the presentation continues past this slide (the counter /
  nav treat it as an intermediate "end").
- **`transition-duration`** — override the default duration (ms).

`<sp-before>` and `<sp-after>` can appear alongside slides; they render once in
the `.sp-global-top` / `.sp-global-bottom` slots — persistent headers, footers,
or controls.

### Typst

```typst
#slide(transition: "fade", class: "my-theme", notes: "Speaker notes", no-toc: true, fake-end: true)[
  Content
]
```

Notes can also be attached with `#notes[...]` anywhere inside the slide body
(emits an `<sp-notes>` element, picked up by the slide parser).

Typst's `slides-purryst-presentation` emits an empty `<sp-before>` region;
there is currently no Typst helper to fill it. Persistent content (headers,
footers) is usually done per-slide, or injected globally via the `css` /
`js-mounted` keys of `#sp-init` (§3.3) in the Typst path.

## 5. Revealing content step by step

Every slide has a **step index** from `0` (shows everything always visible) up
to `totalSteps-1`. Higher steps progressively reveal content.

### 5.1 `sp-steps`

The simplest way: the `sp-steps` attribute on any container.

```html
<ul sp-steps>
  <li>Appears at step 1</li>
  <li>Appears at step 2</li>
  <li>Appears at step 3</li>
</ul>
```

Options: `at="+2"` (start offset), `every="2"` (group children), `animation="fade"`, `no-jump` (don't advance the counter). An `<sp-steps>` wrapper element produces a `display: contents` wrapper and does the same.

**Typst:**

```typst
#steps[
  #p[Appears at step 1]
  #p[Appears at step 2]
]
#steps(at: "+2", every: 2, animation: "fade")[
  ...
]
```

### 5.2 `sp-step` — fine-grained ranges

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

`<sp-step also>` inherits `from` from the preceding `<sp-step>`.

**Typst:**

```typst
#step(from: 2, to: 5)[ ... ]
#step(only: 3)[ ... ]
#step(from: 1, until: 4)[ ... ]
#step(from: 1, hide: true, animation: "fade")[ ... ]
```

### 5.3 Jumping the counter without content

```html
<sp-jump at="+1">   <!-- Advance 1 step (invisible) -->
<sp-jump at="0">    <!-- Reset to step 0 -->
<sp-jump at="5">    <!-- Jump to absolute step 5 -->
```

Aliases: `<sp-pause>` = `<sp-jump at="+1">`, `<sp-meanwhile>` = `<sp-jump at="0">`.

**Typst:**

```typst
#jump("+1")
#pause   // = #jump("+1")
#meanwhile // = #jump("0")
```

### 5.4 How it renders at runtime

At compile time, steps become data attributes:

| Attribute | Meaning |
|---|---|
| `data-sp-step="5"` | Visible when `step >= 5` |
| `data-sp-step-from="2"` | Visible when `step >= 2` |
| `data-sp-step-to="7"` | Visible when `step <= 7` |
| `data-sp-step-hide` | No space reservation when hidden |
| `data-sp-step-animation="fade"` | Preset transition |

At runtime, classes are applied:

- `.sp-anim-shown` — `opacity: 1; pointer-events: auto`
- `.sp-anim-hidden` — `opacity: 0; pointer-events: none`
- `.sp-anim-only` — can have `display: none` (if `hide`)
- `.sp-anim-preset-fade/up/down/left/right/scale/none` — transition presets

### 5.5 Fast mode

When stepping backward, jumping multiple steps, or on initial render, step
updates run in **fast mode**: CSS transitions are suppressed, running CSS
animations are finished/cancelled, and `setTimeout` delays are skipped. Fast
mode is coordinated by the per-slide `SpStepManager` across all animations on
the slide.

## 6. Animations

`<sp-anim>` runs spec-based actions at each step. It does not move DOM — it
manages CSS classes and element visibility.

```html
<sp-anim at="+0" spec=".foo | 500ms .bar ^ -.baz | @add(highlight, .qux)"></sp-anim>
```

**Spec syntax**: pipe (`|`) separates steps, carat (`^`) separates concurrent
actions within a step.

| Pattern | What it does |
|---|---|
| `.my-class` | Show matching elements |
| `-#my-id` | Hide matching elements |
| `@children(sel)` | Expand each child of `sel` into one step per child |
| `@child(sel, n[, b])` | Show child `n` (or range `a..b`) of `sel` in one step |
| `@add(cls, sel)` | Add class `cls` to elements matching `sel` |
| `@remove(cls, sel)` | Remove class |
| `@+class cls sel` | Add class (space-separated syntax) |
| `@-class cls sel` | Remove class |
| `@play(sel, rewind?)` | Play video |
| `@pause(sel)` | Pause video |
| `100ms .foo` | Delay 100ms then show `.foo` |
| `0.5s @add(hl, .bar)` | Delay 500ms then add class |

**`at`**: step offset. Relative (`+N`) is resolved to absolute at compile time.
Default `+0`. **`no-jump`**: don't advance the step counter.

**Typst:**

```typst
#anim(".foo | 500ms .bar ^ -.baz | @add(highlight, .qux)", at: "+0")
```

See §19 for how to register your own `@command`s and action types.

## 7. Alternatives

Cycles through children, one visible at a time, based on `(step - at) % count`:

```html
<sp-alternatives at="+0">
  <p>Shown at step 0</p>
  <p>Shown at step 1</p>
  <p>Shown at step 2</p>
</sp-alternatives>
```

Inactive children get `.sp-anim-hidden.sp-hidden-is-empty` (`display: none`).
The `cycle` flag lets it wrap around instead of clamping at the last child.

**Typst:**

```typst
#alternatives(at: "+0", cycle: true)[
  #p[Shown at step 0]
  #p[Shown at step 1]
]
```

## 8. Includes: HTML, SVG, images

### `<sp-include src="file.html">`

Fetches and inlines HTML. Cached, works recursively. Props: `src`, `path`
(extract a sub-tree via a selector), `transformers` (DOM transforms),
`no-fix-void`, `no-component`.

**Typst:** `#include-fragment("file.html")`.

### `<sp-svg src="diagram.svg">`

Fetches an SVG, auto-adds `viewBox`, rewrites `xlink:href` → `href`, dedups
IDs, moves inline styles to attributes. Props: `src`, `path` (default `svg`),
`wrap`, `width`, `height`, `class`.

**Typst:** `#svg(src: "diagram.svg", width: 40%, wrap: true)`.

### `<sp-img src="photo.png">`

Images with caching; SVGs are inlined as data URIs, non-SVG as blobs. Props:
`src`, `alt`.

**Typst:** `#img(src: "photo.png", alt: "A photo", width: 50%)`.

### Caching

`<sp-include src="...">` resolves from an include cache. Under Typst, cache
entries (see §14) seed that cache so includes resolve with **no network fetch**
in every mode (dev, export, `file://`).

## 9. Draggable elements

```html
<sp-drag at="100|200|300|250|0">
  <div style="background: var(--sp-accent-soft); padding: 1em;">
    Drag me
  </div>
</sp-drag>
```

`at="x|y|width|height|rotate"`. **Double-click** to enter edit mode — drag to
move, corner handles to resize, top handle to rotate, arrow keys to nudge
(`Shift` = 10px). **Save** writes the new position back to source via
`POST /__sp_edit` (falls back to the clipboard with an alert).

**Typst:**

```typst
#drag(at: "100|200|300|250|0")[
  Drag me
]
```

## 10. Table of contents

```html
<sp-toc start="1" end="3" highlight="0">
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

Extracts `h1`/`h2`/`h3` from all slides. Props: `start` (default 2), `end`
(default 999), `highlight` (default 0), `context`. The default slot receives
`items`, `currentIndex`, `goTo`, `activeSection`.

**Typst:**

```typst
#toc(start: 1, end: 3)
```

## 11. Showing slide source (for demo)

```html
<sp-slide-source for="2" :transform="(html) => html.replace(/secret/g, '***')"></sp-slide-source>
```

Shows the raw HTML source of a slide with syntax highlighting. The `for` prop
selects which slide (defaults to the current one). The `transform` prop
optionally transforms the source before display. A named `header` slot
(`v-slot:header="{ forSlide }"`) provides a custom toolbar.

**Typst:** `#slide-source(for-slide: 2)`.

## 12. Styling

### Scoped to a slide

```html
<sp-slide>
  <sp-style>
    .my-slide h2 { color: var(--sp-accent); }
  </sp-style>
</sp-slide>
```

Inside a slide, the CSS is scoped to that slide's `.sp-slide-{num}` class.

### Global

Outside slides (in `<sp-before>`/`<sp-after>`, or top-level in `#sp-content`),
a `<style>` or `<sp-style>` block is injected globally. This is the right
place for theme overrides:

```html
<style>
  :root { --sp-theme-hue: 125; --sp-theme-secondary-hue: 195; }
  .sp-slide { font-size: 4em; }   /* scale slides only, default 3.75em */
  :root { font-size: 19px; }      /* scale UI too */
</style>
```

**Typst:** `#style("h1 { color: red; }")` emits `<sp-style css="...">`.

## 13. Chunklets (reusable snippets)

Chunklets are reusable content blocks you can drop onto slides from a toolbar.
Definitions live in a `<script type="text/html" id="sp-chunklets">` element:

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
- **`params="x,y,w,h"`** — drag to draw a rectangle
- `$x`, `$y`, `$w`, `$h` are substituted on placement

Toggle the bar with `c`, select a chunklet, then click/drag on the slide.

### Typst chunklets

```typst
#chunklet("box", params: "x,y,w,h")[
  #drag(at: "$x|$y|$w|$h|0")[
    Drag me
  ]
]
```

The preprocessor captures the body verbatim (so Typst snippets with `<`, `>`,
`&` survive), and `#chunklet-defs()` writes the `<sp-chunk>` markup into the
`sp-chunklets` script with `data-kind="typst"`. Placing a Typst chunklet shows
a placeholder on the slide and POSTs the substituted snippet (plus the slide's
`data-source-line`) to `/__sp_edit`, inserting it into the matching
`#slide(...)[...]` block in the source.

## 14. Bibliographies & cache entries

### Cache entries

`#add-cache-entry(name)[body]` registers *rendered* HTML once;
`#cache-defs()` emits each entry as an inert `<template data-sp-cache="...">`
element. The engine seeds those into the include cache at boot, so
`<sp-include src="name">` resolves without a fetch — also in exported /
`file://` standalone pages. When the preprocessor finds an
`#add-cache-entry` and no explicit `#cache-defs()` call, it appends one.

### Bibliographies

```typst
#add-cache-entry("biblio.html")[#bibliography(path("demo.bib"))]
```

Renders the bibliography once. Then any slide that cites works:

```typst
#slide[
  Citing @pearson1901pca.
  #slide-bib()
]
```

`#slide-bib()` includes the cached entry with class `sp-bib`; the runtime
filter (`src/composables/useBibFilter.ts`) tags each entry and the block:

- an entry `li` whose `id` is cited by a **currently step-visible** citation is
  shown;
- an entry cited on the slide but not at the current step gets `sp-bib-hidden`
  (visibility only);
- an entry whose ref is not cited anywhere on the slide gets `sp-bib-absent`
  (`display: none`, in addition to `sp-bib-hidden`);
- the block gets `sp-bib-empty` and is hidden when nothing is cited.

Typst's HTML export marks citations as `a[role="doc-biblioref"][href="#loc-…"]`
and entries as `li#loc-…`, so filtering happens against the live DOM after
compile. `#sp-bibliography(path("demo.bib"))` is sugar for `add-cache-entry`
+ `#bibliography` — pass a `path()` so typst resolves it relative to the
calling file.

## 15. Vue components in slides

Any Vue component registered via the `components` option can be used inside
`#sp-content`:

```ts
import MyChart from './MyChart.vue'

createSlidesPurryst({
  components: { 'my-chart': MyChart },
})
```

```html
<sp-slide>
  <my-chart :data="[1, 2, 3]" />
</sp-slide>
```

Templates inside slides can access `$sp` (same object as `window.__sp__`) for
reactive navigation state, e.g. `{{ $sp.currentIndex }}`. `spApi` is also
available via Vue `provide('sp-api')`.

---

# Part III — Presenting

## 16. Navigation

**Keyboard** (default bindings):

| Key | Action |
|---|---|
| `Right` / `Space` | Next step or slide |
| `Left` | Previous step or slide |
| `Up` | Previous slide beginning |
| `Down` | Next slide beginning |
| `a` / `z` | Previous / next slide end |
| `f` | Fullscreen |
| `p` | Presenter mode |
| `o` | Overview grid |
| `g` | Go-to prompt (type slide number or search heading text) |
| `b` | Blackout |
| `d` | Dev pane (in pro mode) or dark mode |
| `c` | Chunklet toolbar |
| `Home` / `End` | First / last slide |
| `Escape` | Exit fullscreen / overview / blackout |

**Touch**: swipe left/right on the viewport.

**Nav bar**: bottom center, auto-hides. Shows slide position, prev/next,
counter (clickable for the Go prompt), fullscreen / presenter / menu buttons,
and slide "pills". The 🔒 button locks the nav visible (`config.navLocked`).

**URL**: `#slide/step` is kept in the hash; `?presenter` opens presenter
mode; `?print` / `?print?steps` render a printable layout.

## 17. Presenter mode

Open with `p` or `?presenter`. Shows the current slide, a preview of the
next slide (at its final step), speaker notes, and a timer with CSV export.
State syncs between windows via `BroadcastChannel`.

## 18. Runtime config & the `spApi` reference

Runtime config is stored in `localStorage` under `sp-config`:

```ts
{
  navLocked: boolean,       // Keep nav bar visible
  overviewScale: number,    // 0.05–0.5 (default 0.15)
  proMode: boolean,         // Developer mode
  logSteps: boolean,        // Log step changes in presenter
  darkMode: 'auto' | 'light' | 'dark',
}
```

Config is reactive and auto-saved. Access via `spApi.config` (`$sp.config`).

`spApi` is available as `window.__sp__` or `$sp` in templates:

| Method | Effect |
|---|---|
| `next()` / `prev()` | Next/previous step or slide |
| `nextSlide()` / `prevSlide()` | Next/previous slide unconditionally |
| `goTo(n)` | Jump to slide |
| `export()` | Download standalone HTML |

| Property | Meaning |
|---|---|
| `currentIndex` | Current slide index |
| `stepIndex` | Current step index |
| `total` | Total number of slides |
| `effectiveLast` / `effectiveTotal` | Last index / total respecting `fake-end` |
| `fakeEndIndices` | Indices of fake-end slides |
| `navLocked` | Nav bar visibility lock |
| `dragging` | True while editing a `<sp-drag>` |
| `config` | The reactive runtime config (see above) |
| `showChunkletsBar` | Chunklet toolbar visibility |
| `chunkletDefs` / `chunkletMode` / `selectedChunklet` | Chunklet placement state |

`toggleNavLock()` toggles `config.navLocked`; fullscreen / presenter /
blackout / dev-pane / chunk-bar toggles are available as functions inside
`SpPresentation` and through the nav bar buttons.

---

# Part IV — Extending & contributing

## 19. Plugins

### 19.1 Structure

```ts
import { definePlugin } from 'slides-purryst'

export default definePlugin({
  name: 'my-plugin',
  order: 0,                    // Lower runs first (so can be erased by higher)
  disable: [],                 // Facets to skip: 'anim' | 'keymap' | 'style' | 'chunklet'
  activate: (api: PluginAPI) => {
    // Return a teardown function if needed
    return () => { /* cleanup */ }
  },
})
```

### 19.2 PluginAPI

| Method | Purpose |
|---|---|
| `api.spApi` | Reactive presentation state (§18) |
| `api.addKeymapSetup(fn)` | Register keybindings (below) |
| `api.addAnimCommand(name, handler)` | Register custom `@command` for `<sp-anim>` specs |
| `api.addAnimActionType(type, handler)` | Register a custom action type handler |
| `api.injectStyle(css)` | Inject global CSS |
| `api.addChunklet(def)` | Register a chunklet definition (§13) |
| `api.addDomTransform(fn)` | Register a DOM transform applied after step processing |

### 19.3 Keybindings

`addKeymapSetup(fn)` registers a function that **mutates** the keymap object:

```ts
import { bind } from 'slides-purryst'

api.addKeymapSetup((keymap) => {
  keymap['x'] = bind(() => { /* handler */ }, {
    when: (context) => !context.dragging,
  })
})
```

`bind(handler, { when?, preventDefault? })` wraps a handler; `when` receives the
live key context (`dragging`, `overview`, `presenter`, `blackout`, `devPane`,
`goPrompt`). Setups run in registration order after the default keymap, so a
plugin can add keys or override existing ones (e.g. replace `ArrowLeft`).

### 19.4 Anim commands

Add a new `@fade` anim command (that produces an already existing `addClass` action type).

```ts
api.addAnimCommand('fade', {
  countSteps: (args) => 1,
  parse: (args) => [{ type: 'addClass', className: 'faded', selector: args }],
  expand: (args, root) => { /* return AnimAction[][] */ },
})
```

### 19.5 Action types

```ts
api.addAnimActionType('myClass', {
  apply: (container, action) => {
    container.querySelectorAll(action.selector).forEach(el => {
      el.classList.add(action.className)
    })
  },
  reverse: (container, action) => { /* undo */ },
  init: (container, action) => { /* setup for first render */ },
})
```

### 19.6 DOM transforms

```ts
api.addDomTransform((root: Element) => {
  root.querySelectorAll('my-custom-tag').forEach(el => {
    // Mutate the DOM before mounting
  })
})
```

Transforms run after `processSlideHtml` converts step/animation markup to data
attributes, just before the slide HTML is compiled into a Vue component.

### 19.7 Inline `activate`

```ts
createSlidesPurryst({
  activate: (api) => {
    api.addKeymapSetup(() => ({ ... }))
  }
})
```

This is sugar for a plugin with `order: 100`.

## 20. Architecture

### 20.1 Project structure

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
    SpPrintView.vue      # ?print=slides / ?print=steps layout
  composables/
    useSteps.ts          # processSlideHtml(), useSteps() composable
    useSlides.ts         # Slide parsing from DOM
    useScale.ts          # Viewport scaling
    usePresenter.ts      # Presenter mode communication via BroadcastChannel
    useNavigation.ts     # Keyboard + touch + hash navigation
    useStorage.ts        # localStorage config persistence
    useSlideTree.ts      # Heading extraction for TOC
    useBibFilter.ts      # Step-aware bibliography filtering
    resolveIncludes.ts   # <sp-include> resolution with stack tracking
    includeCache.ts      # Text + binary include cache
    useChunklets.ts      # Chunklet parsing + placement
  keymap/
    useKeymap.ts         # Keymap manager
    defaults.ts          # createDefaultKeymap()
    bind.ts              # bind() wrapper
    types.ts             # KeyContext etc.
  style/
    anim.css             # Animation/step CSS classes
    themes.css           # Theme + variant registry
    transitions.css      # Slide transition classes
  transformers/
    svg.ts               # SVG transformers (viewBox, xlink, IDs, style→attribute)
```

### 20.2 The boot pipeline

When `createSlidesPurryst()` boots:

0. Read the `#sp-init` payload — run its `js`, inject its `css` into `<head>`,
   merge its `config` into the page-author init-param layer
   (`createSlidesPurryst` options win over it; it wins over `data-*`; defaults
   come last). Apply `theme` (`theme-*` class on `<html>`) if set.
1. Read `#sp-content` text content.
2. `resolveTopIncludes()` — recursively resolve `<sp-include>` tags in raw HTML.
3. `extractRawSlideSources()` — save unmodified per-slide HTML for source display.
4. `fixVoidElementsHtml()` — close void tags (`<sp-anim/>` → `<sp-anim></sp-anim>`).
5. `annotateEditableWithIndex()` — add `:editable-index` to `<sp-slide>`/`<sp-drag>`.
6. `parseElementToSlides()` — parse DOM into `SlideData[]`.
7. On each rendered slide (current + preloaded neighbours), run
   `processSlideHtml()` lazily: process aliases, `sp-step`, `sp-steps`,
   `sp-jump`, `sp-anim`, alternatives, apply DOM transforms, compute the step
   count.
8. Mount `SpPresentation` with props (slides, transitions, components).
9. Run `#sp-init`'s `js-mounted` (`window.__sp__` is live).

### 20.3 Key architecture

**Step reactivity** — `SpPresentation` provides `stepIndex` (a `Ref<number>`)
via `provide('stepIndex')`. All step-reactive components inject it.

**Orchestration** — `SpSlide` provides a `Set<AnimHandle>`. Each `SpAnim`
registers a handle (exposing `syncToStep` and `refresh`) on mount and
unregisters on unmount. `SpStepManager` watches `stepIndex` (and content
version), then coordinates one batch: it applies its own step visibility,
calls every anim's `syncToStep(step, fast)`, and — when `fast` — walks
`container.getAnimations({ subtree: true })` and finishes each animation that
isn't infinite and isn't marked `.sp-anim-protect`. Fast mode (stepping
backward, multi-step jumps, initial render) also skips the `setTimeout` delays
of anim spec actions.

**Scaling** — the `.sp-viewport` is scaled via CSS `transform: scale(...)` to
fit the browser window based on the design width/height ratio
(`--sp-design-width` / `--sp-design-height`).

**Transitions** — three slides are preloaded (prev at final step, current,
next at step 0). On slide change, the transition class (e.g. `fade`) triggers
CSS transitions on the swapped slides; direction is tracked as `sp-dir-forward`
/ `sp-dir-backward`.

### 20.4 Conventions

- Components are single-file Vue 3 `<script setup lang="ts">`.
- State shared across components uses provide/inject (not a global store).
- `spApi` is the one reactive singleton — used sparsely for truly global state.
- Anim commands and action types are registered via the plugin registry, not
  hardcoded.
- Step processing is compile-time (in `processSlideHtml`), not runtime — all
  `data-*` attributes are set before mounting.

## 21. Development & releasing

```bash
pnpm install           # Install deps
pnpm dev               # sp-dev serving example/demo-slidespurr.html (port 3334)
pnpm dev:typst         # sp-dev serving example/demo-slidespurryst.typ (port 3334)
pnpm dev:bundle        # zero-dep CLI server serving example/demo-purrbundle.html
pnpm build             # Build dist/ (library + bundle)
```

The CLI (`bin/cli.mjs`) is a zero-dependency static server. `lib/typst-dev.mjs`
is the Typst preprocessor (turns `.typ` → `#sp-content` markup), and
`lib/edit-handler.mjs` handles the shared `/__sp_edit` endpoint.

**Releasing**: tags include `dist/` for zero-setup consumption via
`pnpm add github:twitwi/slides-purryst#latest`. The `latest` tag is a moving
reference; version tags are immutable.

```bash
bash scripts/release.sh v0.1.0                # normal release, moves latest
bash scripts/release.sh --no-latest v0.1.0    # backport fix to existing tag
bash scripts/release.sh --only-latest         # update latest from main (no version tag)
```

The script builds `dist/`, commits it along with the version tag, pushes (both
tag and latest), then resets main to its pre-release state.
