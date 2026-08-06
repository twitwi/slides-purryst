#import "slide.typ": slide
#import "steps.typ": step, steps
#import "jump.typ": jump, meanwhile, pause
#import "alternatives.typ": alternatives
#import "include.typ": include-fragment
#import "img.typ": img
#import "svg.typ": svg
#import "drag.typ": drag
#import "anim.typ": anim
#import "notes.typ": notes
#import "toc.typ": toc
#import "style.typ": style
#import "component.typ": component
#import "codeblock.typ": codeblock
#import "theme.typ": slides-theme
#import "source.typ": source
#import "slide-source.typ": slide-source
#import "chunklet.typ": chunklet, chunklet-defs

#let no-source-slide = slide
#let h1(body, attrs: (:)) = component("h1", body, attrs: attrs)
