
## SlidesPurr(yst): two frameworks in one

SlidesPurryst is composed of two main conceptual parts:
- it can be used by authoring directly augmented HTML slide sources,
- ti can be used by writing using typst, to generate such augmented HTML sources.

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
    - rationale
        - typst doesn't expose line numbers, so to be able to implement the editing features (typically draggable elements), we need to inject the file/line info for relevant calls (`#slide`) and explicit markers (`#SRC`). The tools adds calls to `#source(path, line)` so that typst can later use this information.
        - (maybe) (TODO) there are also elements (chunklets, config,..) that need to be properly escaped and cannot be generated easily by typst...?
    - NB
        - to keep the actual source file intact, the build scripts create a folder (typically `,,sp-preprocess/{hash}`) that contains a links to all necessary files and the preprocessed typst file.
    - extension point
        - currently none
- (typst) Running the typst compiler on your preprocessed file, that uses the framework typst files.
    - rationale
        - the typst compile can produce HTML (experimental), so it is very convenient to write typst and get HTML.
    - NB:
        - Equations are currently exported as MathML (although not perfectly rendered by all browsers, it is a standard and does not require post processing in the browser).
        - One can use cetz, lilaq etc to produce SVG
    - extension point
        - you can define any typst function you like,
        - you can copy the framework file (that are symlinked in `slides-purryst/`) and modify them,
- (typst) Postprocessing typst HTML output
    - rationale
        - typst produces a no-newline HTML as it is closer to the exact semantic, but we want a readable intermediate HTML,
        - some features that integrate typst and slidespurryst concepts might need a postprocessing step, typically adding classes to cetz diagrams
    - NB:
        - TODO what could be in js instead, and also benefit any other generator
        - The final HTML file is copied next to the original input typst file (if your input is `index.typ` it will be `index.html` in your folder)
    - extension point
        - currently none
- Text based HTML source parsing and processing
    - rationale
        - `<sp-include>` at the top level (i.e. including another file containing a slide or a group of slides) acts as a raw unprocessed (c-like) file include
    - NB:
        - at this step, SlidesPurryst also extracts chunks and cache entries from the input file


