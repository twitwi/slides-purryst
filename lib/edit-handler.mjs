import fs from 'fs'
import path from 'path'

function sendJson(res, status, data) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(status)
  res.end(JSON.stringify(data))
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8') } catch { return null }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function charOffsetOfLine(lines, lineIdx) {
  let off = 0
  for (let i = 0; i < lineIdx; i++) off += lines[i].length + 1
  return off
}

// `at: "..."` belonging to the `#drag(` call whose opening paren sits at
// `openParenIdx`, scoped to the call's own paren span (never a following
// drag's). Returns the raw regex match, or null when the call has no `at`.
function findAtInCall(content, openParenIdx) {
  let depth = 0
  for (let i = openParenIdx; i < content.length; i++) {
    const c = content[i]
    if (c === '"') {
      i++
      while (i < content.length && !(content[i] === '"' && content[i - 1] !== '\\')) i++
      continue
    }
    if (c === '(') depth++
    else if (c === ')') {
      depth--
      if (depth === 0) return content.slice(openParenIdx, i).match(/at:\s*"([^"]+)"/)
    }
  }
  return null
}

// Locate a `#drag(` / `#drag[` call near a source line. Bracket-form calls
// (`#drag[…]`) never carry an `at:` argument, so they always come back for
// insertion; paren-form calls get their own `at:` (paren-scoped) when present.
function findDragCallAtLine(lines, content, lineNum) {
  const start = Math.max(0, lineNum - 1)
  const searchEnd = Math.min(lines.length, lineNum + 3)
  for (let i = start; i < searchEnd; i++) {
    const open = lines[i].match(/#drag(?:\s*\(|\s*\[)/)
    if (open) {
      const isParen = open[0].endsWith('(')
      const openParenIdx = charOffsetOfLine(lines, i) + open.index + open[0].length - 1
      const atMatch = isParen ? findAtInCall(content, openParenIdx) : null
      return { lineIdx: i, atMatch, openMatch: open }
    }
  }
  return null
}

// Same, but picks the drag call by its ordinal (matches the Typst drag-counter,
// counting both paren- and bracket-form calls).
function findDragCallByIndex(lines, content, dragId) {
  let count = -1
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/#drag(?:\s*\(|\s*\[)/)
    if (!open) continue
    count++
    if (count === dragId) {
      const isParen = open[0].endsWith('(')
      const openParenIdx = charOffsetOfLine(lines, i) + open.index + open[0].length - 1
      const atMatch = isParen ? findAtInCall(content, openParenIdx) : null
      return { lineIdx: i, atMatch, openMatch: open }
    }
  }
  return null
}

// Turn a drag call that has no `at:` into one that does, preserving its form:
// `#drag[…` → `#drag(at: "…")[…`, `#drag(…` → `#drag(at: "…"…)`.
function insertAtIntoCall(line, openMatch, typstNew) {
  const before = line.slice(0, openMatch.index)
  const after = line.slice(openMatch.index + openMatch[0].length)
  if (openMatch[0].endsWith('(')) return before + '#drag(' + typstNew + after
  return before + '#drag(' + typstNew + ')[' + after
}

// Apply a resolved drag edit: replace the call's existing `at:` or insert a
// fresh one. Returns true when the source changed.
function applyDragEdit(lines, call, typstNew) {
  if (call.atMatch) {
    lines[call.lineIdx] = lines[call.lineIdx].replace(call.atMatch[0], typstNew)
  } else {
    lines[call.lineIdx] = insertAtIntoCall(lines[call.lineIdx], call.openMatch, typstNew)
  }
  return true
}

// Locate a `#slide(...)[` / `#slide[` call near a source line and the char
// offset of its closing `]` in the raw source.
function findSlideBodyEnd(content, fromIdx) {
  let i = fromIdx
  while (i < content.length && content[i] !== '(' && content[i] !== '[') i++
  if (i >= content.length) return -1
  if (content[i] === '(') {
    let depth = 0
    for (; i < content.length; i++) {
      const c = content[i]
      if (c === '"') {
        i++
        while (i < content.length && !(content[i] === '"' && content[i - 1] !== '\\')) i++
        continue
      }
      if (c === '(') depth++
      else if (c === ')') { if (depth === 0) break; depth-- }
    }
    if (i >= content.length) return -1
    i++
    while (i < content.length && /\s/.test(content[i])) i++
  }
  if (content[i] !== '[') return -1
  let depth = 1
  for (i = i + 1; i < content.length; i++) {
    const c = content[i]
    if (c === '\\') { i++; continue }
    if (c === '"') {
      i++
      while (i < content.length && !(content[i] === '"' && content[i - 1] !== '\\')) i++
      continue
    }
    if (c === '[') depth++
    else if (c === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

export function handleEdit(body, rootDir, method, res) {
  cors(res)

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return }

  try {
    const data = JSON.parse(body)
    const relPath = (data.file || '').replace(/^\//, './')
    const filePath = path.resolve(rootDir, relPath)
    if (!filePath.startsWith(rootDir)) { sendJson(res, 403, { error: 'Forbidden' }); return }

    const editableIndex = data.editableIndex
    const useTypst = filePath.endsWith('.typ')
    let content = readFileSafe(filePath)
    if (!content) { sendJson(res, 404, { error: 'File not found' }); return }

    // Typst drag edit
    if (data.dragId != null && useTypst) {
      const newMatch = data.newAttrs?.match(/at="([^"]+)"/)
      if (!newMatch) { sendJson(res, 400, { error: 'Could not parse at value from newAttrs' }); return }
      const newValue = newMatch[1]
      const typstNew = `at: "${newValue}"`
      const lines = content.split('\n')
      let found = false

      if (data.sourceLine != null) {
        const result = findDragCallAtLine(lines, content, parseInt(data.sourceLine, 10))
        if (result) {
          applyDragEdit(lines, result, typstNew)
          found = true
        }
      }

      if (!found) {
        const result = findDragCallByIndex(lines, content, parseInt(data.dragId, 10))
        if (result) {
          applyDragEdit(lines, result, typstNew)
          found = true
        }
      }

      if (!found) { sendJson(res, 404, { error: `Could not find drag` }); return }
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
      sendJson(res, 200, { ok: true })
      return
    }

    // Typst chunklet insertion
    if (data.action === 'insert-chunk' && data.kind === 'typst') {
      const src = data.src
      if (typeof src !== 'string' || src.trim() === '') { sendJson(res, 400, { error: 'Missing src' }); return }
      const sourceLine = parseInt(data.sourceLine, 10)
      if (!Number.isFinite(sourceLine)) { sendJson(res, 400, { error: 'Missing sourceLine' }); return }
      const lines = content.split('\n')
      const start = Math.max(0, sourceLine - 1)
      const searchEnd = Math.min(lines.length, sourceLine + 3)
      let lineIdx = -1
      let offset = -1
      for (let i = start; i < searchEnd; i++) {
        const m = lines[i].match(/#slide(?=\s*[(\[])/)
        if (m) { lineIdx = i; offset = m.index; break }
      }
      if (lineIdx === -1) { sendJson(res, 404, { error: 'Could not find slide near source line' }); return }
      let charIdx = 0
      for (let i = 0; i < lineIdx; i++) charIdx += lines[i].length + 1
      const closeIdx = findSlideBodyEnd(content, charIdx + offset)
      if (closeIdx === -1) { sendJson(res, 404, { error: 'Could not find end of slide body' }); return }
      const newlineBefore = content.lastIndexOf('\n', closeIdx)
      const leading = content.slice(newlineBefore + 1, closeIdx)
      const baseIndent = leading.length - leading.trimStart().length
      const srcLines = src.split('\n')
      const firstReal = srcLines.find(l => l.trim().length > 0)
      const chunkIndent = firstReal ? firstReal.length - firstReal.trimStart().length : 0
      const allOk = srcLines.every(l => l.slice(0, chunkIndent).trim().length === 0)
      const dedented = allOk ? srcLines.map(l => l.slice(chunkIndent)) : srcLines
      const reindented = dedented.map(l => l.length > 0 ? ' '.repeat(baseIndent + 2) + l : '')
      const updated = content.slice(0, closeIdx) + '\n' + reindented.join('\n') + '\n' + ' '.repeat(baseIndent) + content.slice(closeIdx)
      fs.writeFileSync(filePath, updated, 'utf-8')
      sendJson(res, 200, { ok: true })
      return
    }

    // Chunklet insertion
    if (data.action === 'insert-chunk') {
      const EDITABLE_RE = /<(sp-drag|sp-slide)(\s[^>]*)?(\/?)>/gi
      let editCount = 0
      let editMatch
      let slideStart = 0
      while ((editMatch = EDITABLE_RE.exec(content)) !== null) {
        if (editCount === editableIndex) {
          if (editMatch[1] !== 'sp-slide') { sendJson(res, 400, { error: `Editable index ${editableIndex} is not a slide` }); return }
          slideStart = editMatch.index
          break
        }
        editCount++
      }
      if (!editMatch) { sendJson(res, 404, { error: `Editable index ${editableIndex} not found` }); return }
      const closeTag = '</sp-slide>'
      const closeIdx = content.indexOf(closeTag, slideStart)
      if (closeIdx === -1) { sendJson(res, 404, { error: 'Could not find closing sp-slide tag' }); return }
      const newlineBefore = content.lastIndexOf('\n', closeIdx)
      const leading = content.slice(newlineBefore + 1, closeIdx)
      const baseIndent = leading.length - leading.trimStart().length
      const chunkLines = data.html.split('\n')
      const firstReal = chunkLines.find(l => l.trim().length > 0)
      const chunkIndent = firstReal ? firstReal.length - firstReal.trimStart().length : 0
      const allOk = chunkLines.every(l => l.slice(0, chunkIndent).trim().length === 0)
      const dedented = allOk ? chunkLines.map(l => l.slice(chunkIndent)) : chunkLines
      const reindented = dedented.map(l => l.length > 0 ? ' '.repeat(baseIndent + 2) + l : '')
      const updated = content.slice(0, closeIdx) + '\n' + reindented.join('\n') + '\n' + ' '.repeat(baseIndent) + content.slice(closeIdx)
      fs.writeFileSync(filePath, updated, 'utf-8')
      sendJson(res, 200, { ok: true })
      return
    }

    // HTML drag edit
    const oldAt = (data.oldAttrs || '').trim()
    const newAt = (data.newAttrs || '').trim()
    const isInsert = oldAt === '__sp_insert__'
    const TAG_RE = /<(sp-drag|sp-slide)(\s[^>]*)?(\/?)>/gi
    let editMatch
    let editCount = 0
    let blockStart = -1
    while ((editMatch = TAG_RE.exec(content)) !== null) {
      if (editCount === editableIndex) {
        if (editMatch[1] !== 'sp-drag') { sendJson(res, 400, { error: `Editable index ${editableIndex} is not a drag element` }); return }
        blockStart = editMatch.index
        break
      }
      editCount++
    }
    if (blockStart === -1) { sendJson(res, 404, { error: `Could not find editable element for index ${editableIndex}` }); return }
    const blockEnd = content.indexOf('</sp-drag>', blockStart)
    if (blockEnd === -1) { sendJson(res, 404, { error: 'Could not find closing sp-drag tag' }); return }
    const slice = content.slice(blockStart, blockEnd)

    if (isInsert) {
      const newMatch = newAt?.match(/at="([^"]*)"/)
      if (!newMatch) { sendJson(res, 400, { error: 'newAttrs must include at="..." attribute' }); return }
      const newVal = newMatch[1]
      const insertRegex = /<sp-drag\b([^>]*?)(\/?\s*>)/i
      const im = insertRegex.exec(slice)
      if (!im) { sendJson(res, 404, { error: 'sp-drag tag not found for insert' }); return }
      const after = content.slice(0, blockStart) + slice.replace(insertRegex, `<sp-drag${im[1]} at="${newVal}"${im[2]}`) + content.slice(blockEnd)
      if (after === content) { sendJson(res, 404, { error: 'Insertion produced no change' }); return }
      fs.writeFileSync(filePath, after, 'utf-8')
      sendJson(res, 200, { ok: true })
      return
    }

    const atRegex = /at="([^"]*)"/
    const oldMatch = oldAt?.match(atRegex)
    if (!oldMatch) { sendJson(res, 400, { error: 'oldAttrs must include at="..." attribute' }); return }
    const oldVal = oldMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const newMatch = newAt?.match(atRegex)
    if (!newMatch) { sendJson(res, 400, { error: 'newAttrs must include at="..." attribute' }); return }
    const newVal = newMatch[1]
    const tagRegex = new RegExp(`(<sp-drag\\s[^>]*?at=")${oldVal}(")`)
    let match = null
    tagRegex.lastIndex = 0
    const sm = tagRegex.exec(slice)
    if (sm) { match = sm; match.index = blockStart + sm.index }
    let updated
    if (match) {
      updated = content.slice(0, blockStart) + slice.replace(match[0], `${match[1]}${newVal}${match[2]}`) + content.slice(blockEnd)
    } else {
      // The on-disk value raced ahead of this POST's `oldAt` baseline (an
      // earlier write already landed). The drag is still identified by
      // editableIndex, so overwrite whatever `at=` it currently carries
      // (last-write-wins) instead of failing the save.
      const anyAt = /(<sp-drag\s[^>]*?at=")[^"]*(")/i.exec(slice)
      if (!anyAt) { sendJson(res, 404, { error: 'sp-drag tag not found', oldAt }); return }
      updated = content.slice(0, blockStart) + slice.replace(anyAt[0], `${anyAt[1]}${newVal}${anyAt[2]}`) + content.slice(blockEnd)
    }
    if (updated === content) { sendJson(res, 404, { error: 'Replacement produced no change' }); return }
    fs.writeFileSync(filePath, updated, 'utf-8')
    sendJson(res, 200, { ok: true })
  } catch (err) {
    sendJson(res, 500, { error: err.message, stack: err.stack })
  }
}
