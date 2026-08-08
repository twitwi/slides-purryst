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
#import "source.typ": source
#import "slide-source.typ": slide-source
#import "chunklet.typ": chunklet, chunklet-defs
#import "main.typ": slides-purryst-presentation
#import "common-tags.typ": *

// "no-source-slide" is to make a "source transparent" slide (for #drag, #chunklets, etc),
// typically used in a secondary .typ file that defines a function that creates a slide.
#let no-source-slide = slide


