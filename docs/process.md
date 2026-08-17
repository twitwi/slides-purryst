
## SlidesPurr(yst): two frameworks in one

SlidesPurryst is composed of two main conceptual parts:
- it can be used by authoring directly augmented HTML slide sources,
- it can be used by writing using typst, to generate such augmented HTML sources.

Terminology:

- SlidesPurr stands for the no-typst part of the project.
- SlidesPurryst stands for the complete project, with or without typst.
- When the terms SlidesPurr and SlidesPurryst are both used, it usually means SlidesPurryst refers to the typst specific parts.

This double design goal (without and with typst) aims at having a powerful intermediate presentation representation (augmented HTML):
- you can author as HTML directly,
- you can generate the HTML from any tool/format you have,
- even if written in typst, you can last-minute patch the HTML of a presentation with just a text editor (no build step needed, no install).


### Going from source files to the interactive presentation

SlidesPurryst encompasses a multi-step process.
The first steps are only for typst, the rest for all cases.
Here are the steps and the rationale of having them:

- (typst) Preprocessing main typst file
    - Rationale
        - typst doesn't expose line numbers, so to be able to implement the editing features (typically draggable elements), we need to inject the file/line info for relevant calls (`#slide`) and explicit markers (`#SRC`). The tools adds calls to `#source(path, line)` so that typst can later use this information.
        - (maybe) (TODO) there are also elements (chunklets, config,..) that need to be properly escaped and cannot be generated easily by typst...?
    - NB
        - to keep the actual source file intact, the build scripts create a folder (typically `,,sp-preprocess/{hash}`) that contains a links to all necessary files and the preprocessed typst file.
    - Extension point
        - currently none

- (typst) Running the typst compiler on your preprocessed file, that uses the framework typst files.
    - Rationale
        - the typst compile can produce HTML (experimental), so it is very convenient to write typst and get HTML.
    - NB
        - caution, `= head` produces `<h2>`, `== head` produces `<h3>`, this is actually convenient for themes but one need to use `#h1[head]` to produce a `<h1>` (typically for a title slide).
        - Equations are currently exported as MathML (although not perfectly rendered by all browsers, it is a standard and does not require post processing in the browser).
        - One can use cetz, lilaq etc to produce SVG
    - Extension point
        - you can define any typst function you like,
        - you can copy the framework file (that are symlinked in `slides-purryst/`) and modify them,

- (typst) Postprocessing typst HTML output
    - Rationale
        - typst produces a no-newline HTML as it is closer to the exact semantic, but we want a readable intermediate HTML,
        - some features that integrate typst and slidespurryst concepts might need a postprocessing step, typically adding classes to cetz diagrams
    - NB
        - TODO what could be in js instead, and also benefit any other generator
        - The final HTML file is copied next to the original input typst file (if your input is `index.typ` it will be `index.html` in your folder)
    - Extension point
        - currently none

- Text based HTML source parsing and processing (happens on call to `createSlidesPurryst` in the browser)
    - Rationale
        - `<sp-include>` at the top level (i.e. including another file containing a slide or a group of slides) acts as a raw unprocessed (c-like) file include.
        - HTML parser might be "wrong" with custom tags (it does not accept self closing tags like `<sp-anim />`).
        - (TODO check it is actually useful and cannot be done at next step) Edit features need to know the original source location, this is the last time we have this information.
    - NB
        - Includes (at top level) are handled recursively, producing a "resolved HTML".
        - At this step, the resolved HTML is also parsed a list of "raw slide source". These raw sources are used for slides that want to display their source (like in the demo).
        - At this step, SlidesPurryst also extracts chunks and cache entries from the input file.
        - It adds information for edit features (typically for non-typst, it annotates every editable with a unique number)
    - Extension point
        - currently none, but maybe to be exposed to plugins (a typical case is the current built-in that wraps emojis in svg, that we might want to disable etc), the actual extension is quite advanced (kind of preparser)

- DOM based processing of the content
    - Rationale
        - the goal is to produce a list of SlideData objects, using a parsed DOM representation for that is much simpler than using the raw HTML source. This also allows "normalizing" the things (e.g. notes are allowed as an attribute or a child, ...)
        - some other transformations are also easier to express on the DOM (that on raw source code) and at this point the source is supposed "correct" (converted self-closing tags).
    - NB
        - preload includes / images etc
        - transform img to sp-img to enable caching
    - Extension point
        - currently none, but probably to be exposed to plugins

- Creating a Vue slide from the SlideData
    - Rationale
        - Not all slides are rendered at a given time (typically the previous, current and next) and a same slide can even be rendered twice (print view), hence a pivotal SlideData that is used for rendering on demand.
        - We want to allow templating and dynamic content (within a slide) so we use the vue framework.
    - NB
        - This is done by the `SpSlide.vue` component which is not handling directly the `<sp-slide>` from source but rather working with SlideData.
        - The vue components are handling most of the implementation beyond this point. Typically, `<sp-include>` within a slide (not top level) is handled by the `SpInclude` which does a cache query / fetch request.
        - While it is possible to create a reactive slide with vue based on the current state of the slide, note that the animation framework uses pure DOM-based construct, the vue part is just seen as a content generator.
    - Extension point
        - Custom user components (or from plugins) can also be used within a slide.

- Handling slide stepping (pause, anim, etc)
    - Rationale
        - Animations that work with a fully populated DOM are more flexible (e.g., can count children to know how many animations steps to do) and efficient (e.g., only showing/hiding elements).
    - NB
        - Most animations only play with classes or attributes on the DOM (but they are basically js code that can manipulate the DOM).
        - In practice each rendered slide contains an SpStepManager component that handles this process.
        - One could rely on a virtual DOM implementation e.g. to count the children to animate but this blurs the boundary between content generation and animation (e.g. what happens if you want to show bullet points one by one but their number is actually changing while animating). While the current implementation does not remove such questions, the guideline of having vue generate the DOM (to be animated) suggests some principle to use.
    - Extension point
        - Custom anim commands (like `@children`) can be defined, they produce arbitrary "anim types" (e.g., adding a class to ).
        - Custom anim types can be defined, with what should happen when the anim is played, ended and reversed.

- DOM refinement after each step
    - Rationale
        - Some behavior that depend on the exact displayed state are better expressed as (idempotent) DOM transforms. The motivating case is the bibliographic plugin that automatically shows only the references that are current visible in the slide.
        - This can be seen as a helper postStepManager hook.
    - Extension point
        - one can addSlideRefinement to add a refinement that is applied after each step change (or content change) of a slide. 



### Other extension points

- keymaps
- style
- chunklets
