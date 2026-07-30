export function formatHtml(html) {
  const preTags = []
  let idx = 0
  const stripped = html.replace(/<pre[\s>][\s\S]*?<\/pre>/gi, (match) => {
    const key = `__PRE_${idx}__`
    preTags.push(match)
    idx++
    return key
  })

  const parts = stripped.split(/(?=<)/)
  let result = ''
  let depth = 0
  for (let part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const isClosing = /^<\//.test(trimmed)
    const isSelfClosing = /^<[^>]*\/>/.test(trimmed)
    const isOpenBlock = /^<(?!\/)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|sp-anim|sp-pause|sp-alternatives|sp-toc|sp-include|sp-svg)([\s>])/i.test(trimmed) || isSelfClosing

    if (isClosing) depth = Math.max(0, depth - 1)
    const indent = '  '.repeat(depth)
    if (!isClosing && !isOpenBlock && !isSelfClosing) depth++

    if (/^<sp-slide[\s>]/i.test(trimmed)) {
      result += '\n\n'
    }
    result += indent + trimmed + '\n'
  }

  result = result.replace(/__PRE_(\d+)__/g, (_, n) => {
    return preTags[parseInt(n)]
  })
  return result.trim() + '\n'
}
