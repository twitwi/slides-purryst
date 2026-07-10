

## TODO easy

- [ ] when I edit a draggable but don't move it, then I get an error when it tries to write the (non-)change
- [ ] add touch/swipe so we can use on mobile easily 
- [ ] fix ts errors in pnpm build

## TODO

- [ ] inline svg, allow rewrap in svg, with automatic re-boxing, maybe <sp-rebox :pad="[10]"><sp-include .... or have a <sp-svg that has options (and reuses <sp-include)
- [ ] typst side
- [ ] build and provide a toc-like data structure so slides can use it (see how done already for goto/search)
- [ ] come back to fixing step and last slide behavior of left button in the nav bar

## Design

- should the TOC handling exist in no-typst? (js is best for linking etc, it has the slide numbers etc, but typst might be best for the rest...)
- should bibliography exist in no-typst?
