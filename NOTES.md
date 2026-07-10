

## TODO easy

- [ ] when I edit a draggable but don't move it, then I get an error when it tries to write the (non-)change
- [ ] allow speaker notes, they should be also html content
- [ ] integrate shiki, report on increase in bundle size
- [ ] make a target for the lib that is single file (include dependencies like vue), even the css, for use as a single js script src="..."
- [ ] save some small info to local storage, including the toolbar lock
- [ ] total slide count (access/provide and show by default) + have a boolean on a slide to say it is a "fake end" (so the maximum displayed is this one as long is it is not passed)... so there are actually 2 concepts of "last slide number" (the current last to display) and "last slide numbers" (list with the numbers of all "fake end" slides + the last slide unconditionally)
- [ ] allow controlling the duration of transition (+ default)

## TODO

- [ ] export as standalone single file, by serializing the cache inside the main file (to not have dependency on the includes)
- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] typst side
- [ ] build and provide a toc-like data structure so slides can use it (see how done already for goto/search)
- [ ] come back to fixing step and last slide behavior of left button in the nav bar
- [ ] ensure scalable styles e.g. TOC, so that if I wrap it changing the font size, it adapts
- [ ] explore if we can rationalize that:     <h3>Explicit <code>&amp;lt;sp-step at="..."></code></h3>

## Design

- should the TOC handling exist in no-typst? (js is best for linking etc, it has the slide numbers etc, but typst might be best for the rest...)
- should bibliography exist in no-typst?
