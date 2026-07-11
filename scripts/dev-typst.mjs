#!/usr/bin/env node
import { spawn, execSync } from 'child_process'
import { createServer } from 'http'
import { readFileSync, writeFileSync, watch, existsSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const EXAMPLE = join(ROOT, 'example')
const INPUT = join(EXAMPLE, 'demo-slidespurryst.typ')
const OUTPUT = join(EXAMPLE, 'demo-slidespurryst.html')
const PORT = 3336

// Check prerequisites
if (!existsSync(INPUT)) {
  console.error(`[typst] Input not found: ${INPUT}`)
  process.exit(1)
}

const bundlePath = join(ROOT, 'dist', 'slides-purryst.umd.cjs')
const bundleBundlePath = join(ROOT, 'dist', 'slides-purryst.bundle.js')
let bundleJsRelPath = '../dist/slides-purryst.umd.cjs'

if (existsSync(bundleBundlePath)) {
  bundleJsRelPath = '../dist/slides-purryst.bundle.js'
} else if (!existsSync(bundlePath)) {
  console.error(`[typst] Bundle not found. Run 'pnpm build' (or 'pnpm build:bundle' for single-file) first.`)
  process.exit(1)
}

function compile() {
  console.log(`[typst] Compiling ${INPUT}`)
  try {
    execSync(
      `typst compile --format html --features html --root ${ROOT} --input "bundle-js-path=${bundleJsRelPath}" "${INPUT}" "${OUTPUT}"`,
      { stdio: 'inherit', cwd: ROOT, timeout: 30000 },
    )
    console.log(`[typst] Compiled to ${OUTPUT}`)
    notifyReload()
  } catch (err) {
    console.error('[typst] Compile failed')
  }
}

// SSE clients
const sseClients = new Set()

function notifyReload() {
  for (const res of sseClients) {
    try { res.write('event: reload\ndata:\n\n') } catch {}
  }
}

// Initial compile
compile()

// Watch for changes in example/ and typst/
let compileTimer = null
function scheduleCompile() {
  if (compileTimer) clearTimeout(compileTimer)
  compileTimer = setTimeout(() => {
    compile()
    compileTimer = null
  }, 200)
}

const watchDirs = [EXAMPLE, join(ROOT, 'typst')]
watchDirs.forEach(dir => {
  if (!existsSync(dir)) return
  watch(dir, { recursive: true }, (event, filename) => {
    if (!filename) return
    if (!filename.endsWith('.typ') && !filename.endsWith('.html')) return
    if (filename.endsWith('demo-slidespurryst.html')) return
    scheduleCompile()
  })
})

// MIME types
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
}

function serveFile(filePath, res) {
  let ext = extname(filePath) || '.html'
  let content = readFileSync(filePath)
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  if (ext === '.html') {
    const script = [
      '<script>(function(){',
      'var es = new EventSource("/__typst_reload__");',
      'es.addEventListener("reload", function(){ window.location.reload() });',
      'es.addEventListener("connected", function(){ console.log("[typst] live reload ready") });',
      '})()</script>',
    ].join('')
    content = content.toString().replace('</body>', script + '</body>')
  }
  res.end(content)
}

createServer((req, res) => {
  // POST /__sp_edit — apply drag position change back to .typ source
  if (req.method === 'POST' && req.url === '/__sp_edit') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        if (data.dragId == null) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Missing dragId' }))
          return
        }

        const content = readFileSync(INPUT, 'utf-8')
        const newMatch = data.newAttrs.match(/at="([^"]+)"/)
        if (!newMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Could not parse at value from newAttrs' }))
          return
        }
        const newValue = newMatch[1]
        const typstNew = `at: "${newValue}"`

        // Find the n-th #drag( call and replace its at value
        const lines = content.split('\n')
        const dragId = parseInt(data.dragId, 10)
        let count = -1
        let found = false

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('#drag(')) {
            count++
            if (count === dragId) {
              // Search this line and next few for at: "old"
              const searchEnd = Math.min(lines.length, i + 4)
              for (let j = i; j < searchEnd; j++) {
                const match = lines[j].match(/at:\s*"([^"]+)"/)
                if (match) {
                  lines[j] = lines[j].replace(match[0], typstNew)
                  found = true
                  break
                }
              }
              break
            }
          }
        }

        if (!found) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: `Could not find drag #${dragId}` }))
          return
        }

        writeFileSync(INPUT, lines.join('\n'), 'utf-8')
        console.log(`[typst] Updated drag #${dragId}: ${typstNew}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: err.message }))
      }
    })
    return
  }

  // SSE endpoint for live reload
  if (req.url === '/__typst_reload__') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    res.write('event: connected\ndata:\n\n')
    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }

  let url = req.url === '/' ? '/demo-slidespurryst.html' : req.url

  // Serve /dist/* from DIST directory
  if (url.startsWith('/dist/')) {
    let filePath = join(DIST, url.replace('/dist/', ''))
    if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end('Forbidden'); return }
    try { return serveFile(filePath, res) } catch {}
  } else {
    // Serve everything else from EXAMPLE directory
    let filePath = join(EXAMPLE, url)
    if (!filePath.startsWith(EXAMPLE)) { res.writeHead(403); res.end('Forbidden'); return }
    try { return serveFile(filePath, res) } catch {}
  }

  res.writeHead(404)
  res.end('Not found')
}).listen(PORT, () => {
  console.log(`[typst] Dev server at http://localhost:${PORT}`)
  console.log(`[typst] Watching ${INPUT}`)
})

// Cleanup
function cleanup() {
  console.log('\n[typst] Stopping...')
  process.exit()
}
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
