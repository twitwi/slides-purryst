#let sp-source-state = state("sp-source", (file: none, line: none))

#let source(file, line) = {
  sp-source-state.update((file: file, line: line))
}
