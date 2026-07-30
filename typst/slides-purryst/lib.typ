#import "slide.typ": slide
#import "steps.typ": step, steps
#import "img.typ": img
#import "svg.typ": svg
#import "drag.typ": drag
#import "anim.typ": pause, anim
#import "notes.typ": notes
#import "toc.typ": toc
#import "style.typ": style
#import "component.typ": component
#import "theme.typ": slides-theme
#import "source.typ": source

#let no-source-slide = slide
#let h1(body, attrs: (:)) = component("h1", body, attrs: attrs)
