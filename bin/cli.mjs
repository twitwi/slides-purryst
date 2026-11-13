#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { handleEdit } from '../lib/edit-handler.mjs'
import { startTypstDev, ensureTypstLink, wrapPage, extractBody } from '../lib/typst-dev.mjs'
import { sseRegisterClient, sseBroadcast, getTypstErrors } from '../lib/sse.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(__dirname, '..')
const distDir = path.resolve(pkgDir, 'dist')

let root = process.cwd()
let watchDir = null
let host = '127.0.0.1'
let port = 9999
let specifiedFiles = []
let toCopy = []
let linkTypst = false
let forceCopy = false
let promptCopy = false
let autoOpen = true
let compileOnly = false

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg === '--port' && i + 1 < process.argv.length) {
    port = parseInt(process.argv[++i], 10)
  } else if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10)
  } else if (arg === '--host' && i + 1 < process.argv.length) {
    host = process.argv[++i]
  } else if (arg.startsWith('--host=')) {
    host = arg.split('=')[1]
  } else if (arg === '--watch' && i + 1 < process.argv.length) {
    watchDir = process.argv[++i]
  } else if (arg.startsWith('--watch=')) {
    watchDir = arg.split('=')[1]
  } else if (arg === '--root' && i + 1 < process.argv.length) {
    root = path.resolve(process.cwd(), process.argv[++i])
  } else if (arg.startsWith('--root=')) {
    root = path.resolve(process.cwd(), arg.split('=')[1])
  } else if (arg === '--copy-bundle') {
    toCopy.push('#bundle')
  } else if (arg === '--copy-agents') {
    toCopy.push('#agents')
  } else if (arg === '--copy-fonts') {
    toCopy.push('#fonts')
  } else if (arg === '--force') {
    forceCopy = true
  } else if (arg === '--copy') {
    promptCopy = true
  } else if (arg === '--no-open') {
    autoOpen = false
  } else if (arg === '--open') {
    autoOpen = true
  } else if (arg === '--link-typst') {
    linkTypst = true
  } else if (arg === '--compile') {
    compileOnly = true
  } else if (!arg.startsWith('-')) {
    specifiedFiles.push(arg)
  }
}

const bundleFile = path.join(distDir, 'slides-purryst.bundle.js')
// Cache-bust the bundle reference with a content hash so a rebuilt bundle is
// always re-fetched by the browser (avoids stale JS after a server restart).
const bundleHash = (() => {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(bundleFile)).digest('hex').slice(0, 8)
  } catch { return Date.now().toString(16) }
})()
const agentsFile = path.join(pkgDir, 'AGENTS.md')
const authoringFile = path.join(pkgDir, 'assets', 'AUTHORING.md')
const typstLibSrc = path.join(pkgDir, 'typst', 'slides-purryst')

let oneShot = false

const assets = 'assets'
const bundles = {
  '#bundle': [[bundleFile, '/slides-purryst.bundle.js']],
  '#agents': [[agentsFile, '/AGENTS.md'], [authoringFile, 'AUTHORING.md']],
  '#fonts': ['nunito.css', 'nunito-latin-wght-italic.woff2', 'nunito-latin-wght-normal.woff2'],
}

function installAsset(src, dest, { srcDir=assets, destDir=assets, force=forceCopy, ignoreFailed=false } = {}) {
  if (dest.startsWith('/')) {
    destDir = ''
    dest = dest.slice(1)
  }
  const srcPath = src.startsWith('/') ? src : path.join(pkgDir, srcDir, src)
  const destPath = path.join(root, destDir, dest)
  if (!force && fs.existsSync(destPath)) {
    console.log(`Skipped ${destPath} (already exists)`)
    return
  }
  // Ensure the destination directory exists
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
  } catch (e) {
    console.error(`Failed to create directory for ${destPath}: ${e.message}`)
    if (!ignoreFailed) {
      process.exit(1)
    }
  }
  try {
    fs.copyFileSync(srcPath, destPath)
    console.log(`Copied ${srcPath} → ${destPath}`)
  } catch (e) {
    console.error(`Failed to copy ${srcPath} → ${destPath}: ${e.message}`)
    if (!ignoreFailed) {
      process.exit(1)
    }
  }
}

if (linkTypst) {
  try {
    const dest = ensureTypstLink(pkgDir, root)
    console.log(`Linked ${dest} → ${typstLibSrc}`)
  } catch (e) {
    console.error(`Failed to link typst library: ${e.message}`)
    process.exit(1)
  }
  oneShot= true
}

function processSpec(spec) {
  if (typeof spec === 'string' && spec.startsWith('#')) {
    const bundleSpec = bundles[spec]
    if (!bundleSpec) {
      console.error(`Unknown copy specifier: ${spec}`)
      process.exit(1)
    }
    processSpecList(bundleSpec)
    return
  }
  if (Array.isArray(spec)) {
    const [src, dest] = spec
    installAsset(src, dest)
  } else {
    installAsset(spec, spec)
  }
}
function processSpecList(specList) {
  for (const spec of specList) {
    processSpec(spec)
  }
}

if (toCopy.length > 0) {
  processSpecList(toCopy)
  oneShot= true
}

if (oneShot) {
  process.exit(0)
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.cjs': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}

const resolvedWatchDir = watchDir ? path.resolve(process.cwd(), watchDir) : root
let watchTimer = null
try {
  fs.watch(resolvedWatchDir, { recursive: true }, (event, filename) => {
    if (!filename || !filename.endsWith('.html')) return
    if (filename.split('/').some(seg => seg.startsWith(',,'))) return
    if (watchTimer) clearTimeout(watchTimer)
    watchTimer = setTimeout(() => sseBroadcast('update', filename), 100)
  })
} catch {}

function serveFile(res, filePath) {
  if (!filePath) { res.writeHead(404); res.end('Not found'); return }
  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'
  try {
    const data = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

function resolveFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath)
  const relative = decoded.replace(/^\//, '') || 'index.html'
  const userPath = path.resolve(root, relative)
  if (userPath.startsWith(root) && fs.existsSync(userPath)) return userPath
  const distPath = path.resolve(distDir, relative)
  if (distPath.startsWith(distDir) && fs.existsSync(distPath)) return distPath
  return null
}

// --- Typst compilation (shared pipeline) ---
// Each .typ entry point gets its own isolated startTypstDev pipeline.
const typFiles = specifiedFiles.filter(f => f.endsWith('.typ'))
const typstStops = []
// Warn (non-fatally) if a local slides-purryst.bundle.js is present but stale:
// the generated HTML loads that local copy, so a mismatch means the browser
// would run an old engine even though the packaged bundle was rebuilt. Printed
// after the URL banner (below) so it stays visible at the bottom.
let staleBundleWarning = null
if (typFiles.length) {
  const localBundle = path.join(root, 'slides-purryst.bundle.js')
  if (fs.existsSync(localBundle)) {
    try {
      const local = fs.readFileSync(localBundle)
      const packaged = fs.readFileSync(bundleFile)
      if (!local.equals(packaged)) {
        staleBundleWarning = `\n  ⚠ Local slides-purryst.bundle.js is out of date (differs from the bundled version).\n` +
          `    The generated HTML will load this stale copy. Re-copy it with:  slides-purryst --force --copy-bundle .`
      }
    } catch {}
  }
}

// --- One-shot compile (--compile): compile each .typ entry once and exit. ---
if (compileOnly) {
  if (staleBundleWarning) console.log(staleBundleWarning)
  let ok = true
  for (const f of typFiles) {
    const htmlRel = f.replace(/\.typ$/, '.html')
    const depth = htmlRel.split('/').length - 1
    const jsPath = (depth ? '../'.repeat(depth) : './') + 'slides-purryst.bundle.js?v=' + bundleHash
    try {
      const { initialOk } = startTypstDev({
        pkgDir,
        rootDir: root,
        fileArg: f,
        errorKey: f,
        jsPath,
        useModule: false,
        watch: false,
        wrapOutput: (raw) => wrapPage(extractBody(raw), { title: 'SlidesPurryst', author: '', jsPath, useModule: false, designWidth: 1920, designHeight: 1080, filepath: f }),
      })
      if (!initialOk) ok = false
    } catch (e) {
      console.error(`\n${e.message}\n`)
      ok = false
    }
  }
  process.exit(ok ? 0 : 1)
}

if (typFiles.length) {
  for (const f of typFiles) {
    const htmlRel = f.replace(/\.typ$/, '.html')
    const depth = htmlRel.split('/').length - 1
    const jsPath = (depth ? '../'.repeat(depth) : './') + 'slides-purryst.bundle.js?v=' + bundleHash
    try {
      const { stop } = startTypstDev({
        pkgDir,
        rootDir: root,
        fileArg: f,
        errorKey: f,
        jsPath,
        useModule: false,
        wrapOutput: (raw) => wrapPage(extractBody(raw), { title: 'SlidesPurryst', author: '', jsPath, useModule: false, designWidth: 1920, designHeight: 1080, filepath: f }),
      })
      typstStops.push(stop)
    } catch (e) {
      console.error(`\n${e.message}\n`)
      process.exit(1)
    }
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`)
  const pathname = url.pathname

  if (pathname === '/__sp_events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    res.write('event: connected\ndata: \n\n')
    sseRegisterClient(res)
    const errs = getTypstErrors()
    if (Object.keys(errs).length) res.write(`event: typst-error\ndata: ${JSON.stringify(errs)}\n\n`)
    return
  }

  if (pathname === '/__sp_edit') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => handleEdit(body, root, req.method, res))
    return
  }

  const filePath = resolveFilePath(pathname)
  serveFile(res, filePath)
})

server.listen(port, host, () => {
  const addr = `http://${host}:${port}`
  console.log(`\n  SlidesPurryst dev server running at ${addr}`)
  console.log(`  Serving ${root}${specifiedFiles.length ? '  (' + specifiedFiles.join(', ') + ')' : ''}\n`)
  // Defer the URL banner a moment so the first typst build's own output (watch
  // emits "compiling..."/"compiled successfully") lands first and the URLs stay
  // visible at the bottom without scrolling.
  setTimeout(() => {
    const urls = specifiedFiles.map(f => `${addr}/${f.replace(/\.typ$/, '.html')}`)
    const openUrl = urls[0] || addr
    urls.forEach(u => console.log(`  🚀 URL: ${u}`))
    if (staleBundleWarning) console.log(staleBundleWarning)
    if (autoOpen) {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
      import('child_process').then(({ spawn }) => {
        try { spawn(cmd, [openUrl], { stdio: 'ignore' }) } catch {}
      })
    }
  }, 1000)
})

const cleanup = () => {
  typstStops.forEach(stop => stop())
  process.exit()
}
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
