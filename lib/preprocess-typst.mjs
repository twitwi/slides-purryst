const DEFAULT_SOURCE_FUNCTIONS = ['slide', 'drag']

function removeComments(source) {
  const chars = [...source]
  const result = new Array(chars.length).fill('')
  let i = 0
  while (i < chars.length) {
    if (chars[i] === '"') {
      let j = i + 1
      while (j < chars.length) {
        if (chars[j] === '"' && chars[j - 1] !== '\\') { j++; break }
        j++
      }
      while (i < j) { result[i] = chars[i]; i++ }
      continue
    }
    if (chars[i] === '/' && i + 1 < chars.length && chars[i + 1] === '/') {
      while (i < chars.length && chars[i] !== '\n') { result[i] = ' '; i++ }
      if (i < chars.length) { result[i] = chars[i]; i++ }
      continue
    }
    if (chars[i] === '/' && i + 1 < chars.length && chars[i + 1] === '*') {
      result[i] = ' '; result[i + 1] = ' '; i += 2
      while (i + 1 < chars.length) {
        if (chars[i] === '*' && chars[i + 1] === '/') { result[i] = ' '; result[i + 1] = ' '; i += 2; break }
        result[i] = chars[i] === '\n' ? '\n' : ' '
        i++
      }
      continue
    }
    result[i] = chars[i]
    i++
  }
  return result.join('')
}

function lineAt(idx, source) {
  return source.slice(0, idx).split('\n').length
}

function extractConfig(clean) {
  const configRe = /#sp-config\s*\(/
  const m = configRe.exec(clean)
  if (!m) return { sourceFunctions: [...DEFAULT_SOURCE_FUNCTIONS], start: -1, end: -1 }
  const start = m.index
  let depth = 0
  let i = start + m[0].length
  while (i < clean.length) {
    if (clean[i] === '(') depth++
    else if (clean[i] === ')') { if (depth === 0) break; depth-- }
    else if (clean[i] === '"') {
      i++
      while (i < clean.length) {
        if (clean[i] === '"' && clean[i - 1] !== '\\') break
        i++
      }
    }
    i++
  }
  const end = i + 1
  const configBody = clean.slice(start + m[0].length, end - 1)
  const sfRe = /source-functions\s*:\s*\(([^)]*)\)/
  const sfMatch = sfRe.exec(configBody)
  const extra = sfMatch
    ? sfMatch[1].split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean)
    : []
  return {
    sourceFunctions: [...DEFAULT_SOURCE_FUNCTIONS, ...extra],
    start,
    end,
  }
}

function findCalls(clean, funcNames) {
  const calls = []
  for (const name of funcNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`#${escaped}(?=[({\\[]|\\s*\\[)`, 'g')
    let m
    while ((m = re.exec(clean)) !== null) {
      calls.push({ index: m.index, name })
    }
  }
  calls.sort((a, b) => a.index - b.index)
  return calls
}

function findSRCMarkers(clean) {
  const markers = []
  const re = /#SRC\b/g
  let m
  while ((m = re.exec(clean)) !== null) {
    markers.push(m.index)
  }
  return markers
}

function escapeTypstString(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
}

// Find `#name(...)` call sites (with balanced parens, string literals and
// backslash escapes handled). Indices are relative to `clean` (same positions
// as `source`, since removing comments preserves length).
function findCallArgs(clean, name) {
  const chunks = []
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(String.raw`#${escaped}(?=\s*\(` + ')', 'g')
  let m
  while ((m = re.exec(clean)) !== null) {
    let i = m.index + name.length + 1
    while (i < clean.length && /\s/.test(clean[i])) i++
    if (clean[i] !== '(') continue
    const argsStart = i + 1
    let depth = 0
    let j = argsStart
    let argsEnd = -1
    while (j < clean.length) {
      const c = clean[j]
      if (c === '"') {
        j++
        while (j < clean.length) {
          if (clean[j] === '"' && clean[j - 1] !== '\\') { j++; break }
          j++
        }
        continue
      }
      if (c === '(') depth++
      else if (c === ')') {
        if (depth === 0) { argsEnd = j; break }
        depth--
      }
      j++
    }
    if (argsEnd === -1) continue
    chunks.push({ callStart: m.index, argsStart, argsEnd })
  }
  return chunks
}

// Like `findCallArgs`, but only for calls that carry a `[...]` body, and
// returns the body span too (for chunklets and cache entries, whose raw body
// text is captured verbatim).
function findCallBodies(clean, name) {
  const chunks = []
  for (const call of findCallArgs(clean, name)) {
    let k = call.argsEnd + 1
    while (k < clean.length && /\s/.test(clean[k])) k++
    if (clean[k] !== '[') continue
    let bodyDepth = 0
    let p = k + 1
    let bodyEnd = -1
    while (p < clean.length) {
      const c = clean[p]
      if (c === '\\') { p += 2; continue }
      if (c === '"') {
        p++
        while (p < clean.length) {
          if (clean[p] === '"' && clean[p - 1] !== '\\') { p++; break }
          p++
        }
        continue
      }
      if (c === '[') bodyDepth++
      else if (c === ']') {
        if (bodyDepth === 0) { bodyEnd = p; break }
        bodyDepth--
      }
      p++
    }
    if (bodyEnd === -1) continue
    chunks.push({ callStart: call.callStart, argsEnd: call.argsEnd, bodyStart: k + 1, bodyEnd })
  }
  return chunks
}

function findChunklets(clean) {
  return findCallBodies(clean, 'chunklet')
}

function inChunkBody(chunklets, idx) {
  return chunklets.some(ch => idx >= ch.bodyStart && idx < ch.bodyEnd)
}

// Whether the source contains a `#name(...)` call (no body required, e.g. for
// bodyless helpers like `#cache-defs()`).
function hasCall(clean, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(String.raw`#${escaped}(?=\s*\(` + ')', 'g')
  return re.test(clean)
}

function inAnyBody(bodies, idx) {
  return bodies.some(b => idx >= b.bodyStart && idx < b.bodyEnd)
}

export function preprocessTypst(source, relPath, prefix = '/') {
  const clean = removeComments(source)
  const config = extractConfig(clean)
  const chunklets = findChunklets(clean)
  const cacheBodies = findCallBodies(clean, 'add-cache-entry')
  // `#sp-bibliography(...)` also creates a cache entry (its body has no `[...]`
  // and is not captured by `findCallBodies`, so detect it separately).
  const cacheEntries = cacheBodies.length > 0 || findCallArgs(clean, 'sp-bibliography').length > 0
  let result = source

  if (config.start >= 0) {
    result = result.slice(0, config.start) + result.slice(config.end)
  }

  const callSites = findCalls(clean, config.sourceFunctions)
  const usedUpTo = new Map()
  const skipNames = new Set(['no-source-slide'])

  const replacements = []

  for (const call of callSites) {
    if (skipNames.has(call.name)) continue
    if (inAnyBody([...chunklets, ...cacheBodies], call.index)) continue
    const key = call.name
    const count = usedUpTo.get(key) || 0
    usedUpTo.set(key, count + 1)
    const line = lineAt(call.index, clean)
    replacements.push({
      start: call.index,
      insert: `#source("${prefix}${relPath}", ${line}) `,
    })
  }

  const markers = findSRCMarkers(clean)
  for (const idx of markers) {
    const line = lineAt(idx, clean)
    const cleanSlice = clean.slice(idx, idx + 4)
    const inConfig = config.start >= 0 && idx >= config.start && idx < config.end
    if (inConfig) continue
    if (inAnyBody([...chunklets, ...cacheBodies], idx)) continue
    replacements.push({
      start: idx,
      insert: `#source("${prefix}${relPath}", ${line})`,
      removeLen: 4,
    })
  }

  for (const ch of chunklets) {
    const hasSrc = /\bsrc\s*:/.test(clean.slice(ch.callStart, ch.argsEnd))
    if (hasSrc) continue
    const bodyRaw = source.slice(ch.bodyStart, ch.bodyEnd)
    const escaped = escapeTypstString(bodyRaw)
    replacements.push({
      start: ch.argsEnd,
      insert: `, src: "${escaped}"`,
    })
  }

  replacements.sort((a, b) => b.start - a.start)
  for (const r of replacements) {
    const removeLen = r.removeLen || 0
    result = result.slice(0, r.start) + r.insert + result.slice(r.start + removeLen)
  }

  if (chunklets.length > 0 && !/\bchunklet-defs\b/.test(clean)) {
    result += '\n#chunklet-defs()\n'
  }

  // Auto-append `#cache-defs()` for the bare/demo path (no explicit call).
  // Skip when `main.typ` is in play (it calls `#cache-defs()` itself) or when
  // cache entries exist without the wrapper import (then `cache-defs` would
  // not be in scope).
  const usesMainTyp = hasCall(clean, 'slides-purryst-presentation')
  if (cacheEntries
      && !hasCall(clean, 'cache-defs')
      && !usesMainTyp) {
    result += '\n#cache-defs()\n'
  }

  // Same for `#sp-init`: `#sp-init-defs()` emits the payload element. Skip when
  // `main.typ` is in play (it calls `#sp-init-defs()` itself) or when the deck
  // already calls it.
  if (hasCall(clean, 'sp-init')
      && !hasCall(clean, 'sp-init-defs')
      && !usesMainTyp) {
    result += '\n#sp-init-defs()\n'
  }

  return result
}

export function preprocessFile(source, filePath) {
  const rootDir = process.cwd()
  const relPath = filePath.startsWith(rootDir + '/')
    ? filePath.slice(rootDir.length + 1)
    : filePath
  return preprocessTypst(source, relPath)
}

export function quickStringHash(s) {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}
