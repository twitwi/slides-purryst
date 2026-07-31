// Streaming parser for `typst` human diagnostics (stderr).
// Extracts `error: <msg>` + `┌─ <path>:<line>:<col>` pairs, emits `onErrors(list)`.

export function createTypstErrorParser({ onErrors, rewritePath }) {
  let buffer = ''
  let errors = []
  let pending = null

  function finalize(message, loc) {
    let text = message
    if (loc) text = `${message} (${rewritePath ? rewritePath(loc) : loc})`
    errors.push(text)
    pending = null
    onErrors([...errors])
  }

  function emitLine(line) {
    if (/compiling \.\.\./.test(line)) {
      errors = []
      pending = null
      return
    }
    if (/compiled successfully/.test(line)) {
      errors = []
      pending = null
      onErrors([])
      return
    }
    if (/compiled with errors/.test(line)) {
      return
    }
    const em = line.match(/^error: (.*)$/)
    if (em) {
      pending = em[1]
      return
    }
    const locm = line.match(/^\s+┌─ (.*)$/)
    if (pending && locm) {
      finalize(pending, locm[1])
    }
  }

  return {
    push(chunk) {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) emitLine(line)
    },
    end() {
      if (buffer.trim()) emitLine(buffer)
      buffer = ''
      pending = null
    },
  }
}
