// Whitespace inside a <span class="cb-line"> is significant (rendered with
// white-space: pre), so swap each one for a placeholder and keep it verbatim.
function protectCodeLines(html, tags) {
  let out = ''
  let cursor = 0
  const re = /<span class="cb-line"[^>]*>/g
  let m
  while ((m = re.exec(html))) {
    const start = m.index
    const open = m[0]
    let depth = 1
    let pos = start + open.length
    while (depth > 0) {
      const openAt = html.indexOf('<span', pos)
      const closeAt = html.indexOf('</span>', pos)
      if (closeAt === -1) { pos = html.length; break }
      if (openAt !== -1 && openAt < closeAt) { depth++; pos = openAt + 5 }
      else { depth--; pos = closeAt + 7 }
    }
    const key = `__CB_LINE_${tags.length}__`
    out += html.slice(cursor, start) + key + '\n'
    tags.push(html.slice(start, pos))
    cursor = pos
    re.lastIndex = pos
  }
  return out + html.slice(cursor)
}

export function formatHtml(html) {
  const preTags = []
  let idx = 0
  let stripped = html.replace(/<pre[\s>][\s\S]*?<\/pre>/gi, (match) => {
    const key = `__PRE_${idx}__`
    preTags.push(match)
    idx++
    return key
  })

  const cbTags = []
  stripped = protectCodeLines(stripped, cbTags)

  const parts = stripped.split(/(?=<)/)
  let result = ''
  let depth = 0
  for (let part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const isClosing = /^<\//.test(trimmed)
    const isSelfClosing = /^<[^>]*\/>/.test(trimmed)
    const isMonoline = /^<(\/?)(h1|h2|h3|sp-style|sp-toc|sp-img|sp-svg)([\s>])/i.test(trimmed)
    const isInline = /^<(\/?)(span|code|em|strong|a|kbd|abbr|sub|sup|mark|del|ins|small)([\s>])/i.test(trimmed)

    if (isClosing && !isInline) depth = Math.max(0, depth - 1)
    const indent = '  '.repeat(depth)
    if (!isClosing && !isSelfClosing && !isInline) depth++

    if (/^<sp-slide[\s>]/i.test(trimmed)) {
      result += '\n\n'
    }
    if (isMonoline) {
      if (isClosing) {
        result += part
      } else {
        result += '\n' + indent + part
      }
    } else if (isInline) {
      result += part
    } else {
      result += '\n' + indent + part
    }
  }

  result = result
    .replace(/__CB_LINE_(\d+)__/g, (_, n) => cbTags[parseInt(n)])
    .replace(/__PRE_(\d+)__/g, (_, n) => preTags[parseInt(n)])
  return result.trim() + '\n'
}
