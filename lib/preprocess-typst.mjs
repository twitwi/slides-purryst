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

export function preprocessTypst(source, relPath, prefix = '/') {
  const clean = removeComments(source)
  const config = extractConfig(clean)
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
    replacements.push({
      start: idx,
      insert: `#source("${prefix}${relPath}", ${line})`,
      removeLen: 4,
    })
  }

  replacements.sort((a, b) => b.start - a.start)
  for (const r of replacements) {
    const removeLen = r.removeLen || 0
    result = result.slice(0, r.start) + r.insert + result.slice(r.start + removeLen)
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
