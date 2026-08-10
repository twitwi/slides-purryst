/**
 * Parse a <path ...> tag's attributes into an object.
 */
function parseAttrs(tag) {
  const attrs = {}
  const re = /(\w[\w-]*)\s*=\s*"([^"]*)"/g
  let m
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

/**
 * Inject class attributes into SVG <path> elements of the Cetz cat,
 * based on the marker system described in example/demo-slidespurryst.typ.
 *
 * Markers are invisible <path> elements whose `fill` encodes the class:
 *   fill="#42XXXX01"  class(name)  — applies to the next real <path>
 *   fill="#43XXXX01"  class-begin(name) — applies to all following paths until class-end()
 *   fill="#44000101"  class-end() — closes the last class-begin
 * The sentinel (42/43/44) is the first byte, XXXX the class id, 01 the alpha.
 *
 * @param {string} html — Raw HTML from `typst compile --format html`
 * @returns {string} — Modified HTML with class attrs injected and markers removed
 */
export function injectCetzClasses(html) {
  // 1. Extract class map from <script type="application/json" id="cetz-classes">…</script>
  const mapMatch = html.match(/<script[^>]*type="application\/json"[^>]*id="cetz-classes"[^>]*>([\s\S]*?)<\/script>/)
  if (!mapMatch) return html

  const map = JSON.parse(mapMatch[1])
  const rev = {}; for (const [k, v] of Object.entries(map)) rev[v] = k

  // 2. Collect all <path> segments (self-closing or paired) in document order.
  const segments = []
  const pathRe = /<path\s/g
  let pathMatch

  while ((pathMatch = pathRe.exec(html)) !== null) {
    const start = pathMatch.index
    const tagContentStart = start + 5

    const closeAngle = html.indexOf('>', tagContentStart)
    if (closeAngle === -1) break

    const isSelfClosing = html[closeAngle - 1] === '/'
    const tagEnd = closeAngle + 1

    let end = tagEnd
    if (!isSelfClosing) {
      const closePath = html.indexOf('</path>', tagEnd)
      if (closePath === -1) break
      end = closePath + '</path>'.length
    }

    const tagContent = html.slice(start, tagEnd)
    const rawAttrs = tagContent.slice(5, isSelfClosing ? -2 : -1).trim()
    const attrs = parseAttrs(rawAttrs)

    segments.push({ start, end, tagContent, rawAttrs, attrs, isSelfClosing })
    pathRe.lastIndex = end
  }

  // 3. Process segments: markers are removed, real paths get class injected.
  const pendingNextClass = []
  const spanStack = []
  const mapStart = mapMatch.index
  const mapEnd = mapMatch.index + mapMatch[0].length

  let result = ''
  let cursor = 0

  for (const seg of segments) {
    result += html.slice(cursor, seg.start)
    cursor = seg.end

    const fill = seg.attrs['fill'] || ''
    const sentinelMatch = fill.match(/^#(4[2-4])(\w\w\w\w)01$/)

    if (sentinelMatch) {
      const sentinel = parseInt(sentinelMatch[1], 16)
      const id = parseInt(sentinelMatch[2], 16)

      if (sentinel === 0x42) {
        const name = rev[id]
        if (name) pendingNextClass.push(name)
      } else if (sentinel === 0x43) {
        const name = rev[id]
        if (name) spanStack.push(name)
      } else if (sentinel === 0x44) {
        spanStack.pop()
      }
      continue // drop the marker
    }

    // Real path — gather classes
    const classNames = spanStack.concat(pendingNextClass)
    pendingNextClass.length = 0

    if (classNames.length > 0) {
      const existingClass = seg.attrs['class'] || ''
      const allClasses = existingClass
        ? existingClass.split(/\s+/).concat(classNames).join(' ')
        : classNames.join(' ')

      if (seg.isSelfClosing) {
        const inner = seg.tagContent.slice(5, -2).trim()
        result += `<path ${inner} class="${allClasses}" />`
      } else {
        const inner = seg.tagContent.slice(5, -1).trim()
        const innerContent = html.slice(seg.tagContent.length, seg.end - '</path>'.length)
        result += `<path ${inner} class="${allClasses}">${innerContent}</path>`
      }
    } else {
      result += html.slice(seg.start, seg.end)
    }
  }

  result += html.slice(cursor, mapStart)
  result += html.slice(mapEnd)
  return result
}
