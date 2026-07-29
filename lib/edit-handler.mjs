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

export function handleEdit(body, rootDir, method, res) {
  cors(res)

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (method !== 'POST') { res.writeHead(405); res.end('Method not allowed'); return }

  try {
    const data = JSON.parse(body)
    const filePath = path.resolve(rootDir, data.file || '')
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
      const dragId = parseInt(data.dragId, 10)
      let count = -1
      let found = false
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('#drag(')) {
          count++
          if (count === dragId) {
            const searchEnd = Math.min(lines.length, i + 4)
            for (let j = i; j < searchEnd; j++) {
              const m = lines[j].match(/at:\s*"([^"]+)"/)
              if (m) { lines[j] = lines[j].replace(m[0], typstNew); found = true; break }
            }
            break
          }
        }
      }
      if (!found) { sendJson(res, 404, { error: `Could not find drag #${dragId}` }); return }
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
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
    const tagRegex = new RegExp(`(<sp-drag\\s[^>]*?at=")${oldVal}(")`)
    let match = null
    tagRegex.lastIndex = 0
    const sm = tagRegex.exec(slice)
    if (sm) { match = sm; match.index = blockStart + sm.index }
    if (!match) { sendJson(res, 404, { error: 'sp-drag tag not found', oldAt }); return }
    const newMatch = newAt?.match(atRegex)
    if (!newMatch) { sendJson(res, 400, { error: 'newAttrs must include at="..." attribute' }); return }
    const newVal = newMatch[1]
    const updated = content.slice(0, blockStart) + slice.replace(match[0], `${match[1]}${newVal}${match[2]}`) + content.slice(blockEnd)
    if (updated === content) { sendJson(res, 404, { error: 'Replacement produced no change' }); return }
    fs.writeFileSync(filePath, updated, 'utf-8')
    sendJson(res, 200, { ok: true })
  } catch (err) {
    sendJson(res, 500, { error: err.message, stack: err.stack })
  }
}
