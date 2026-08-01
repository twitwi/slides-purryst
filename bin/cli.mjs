#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleEdit } from '../lib/edit-handler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgDir = path.resolve(__dirname, '..')
const distDir = path.resolve(pkgDir, 'dist')

let root = process.cwd()
let watchDir = null
let port = 9999
let specifiedFile = ''
let copyBundle = false
let copyAgents = false
let autoOpen = true
let linkTypst = false

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg === '--port' && i + 1 < process.argv.length) {
    port = parseInt(process.argv[++i], 10)
  } else if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10)
  } else if (arg === '--watch' && i + 1 < process.argv.length) {
    watchDir = process.argv[++i]
  } else if (arg.startsWith('--watch=')) {
    watchDir = arg.split('=')[1]
  } else if (arg === '--root' && i + 1 < process.argv.length) {
    root = path.resolve(process.cwd(), process.argv[++i])
  } else if (arg.startsWith('--root=')) {
    root = path.resolve(process.cwd(), arg.split('=')[1])
  } else if (arg === '--copy-bundle') {
    copyBundle = true
  } else if (arg === '--copy-agents') {
    copyAgents = true
  } else if (arg === '--no-open') {
    autoOpen = false
  } else if (arg === '--open') {
    autoOpen = true
  } else if (arg === '--link-typst') {
    linkTypst = true
  } else if (!arg.startsWith('-')) {
    specifiedFile = arg
  }
}

const bundleFile = path.join(distDir, 'slides-purryst.bundle.js')
const agentsFile = path.join(pkgDir, 'AGENTS.md')
const typstLibSrc = path.join(pkgDir, 'typst', 'slides-purryst')

if (linkTypst) {
  const dest = path.join(root, 'slides-purryst')
  try {
    fs.symlinkSync(typstLibSrc, dest)
    console.log(`Linked ${dest} → ${typstLibSrc}`)
  } catch (e) {
    console.error(`Failed to link typst library: ${e.message}`)
    process.exit(1)
  }
  process.exit(0)
}

if (copyAgents) {
  const dest = path.join(root, 'AGENTS.md')
  try {
    fs.copyFileSync(agentsFile, dest)
    console.log(`Copied AGENTS.md to ${dest}`)
  } catch (e) {
    console.error(`Failed to copy AGENTS.md: ${e.message}`)
    process.exit(1)
  }
  process.exit(0)
}

if (copyBundle) {
  const dest = path.join(root, 'slides-purryst.bundle.js')
  try {
    fs.copyFileSync(bundleFile, dest)
    console.log(`Copied slides-purryst.bundle.js to ${dest}`)
  } catch (e) {
    console.error(`Failed to copy bundle: ${e.message}`)
    process.exit(1)
  }
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

const clients = []

function sendSSE(data) {
  clients.forEach(res => {
    try { res.write(`event: update\ndata: ${data}\n\n`) } catch {}
  })
}

const resolvedWatchDir = watchDir ? path.resolve(process.cwd(), watchDir) : root
let watchTimer = null
try {
  fs.watch(resolvedWatchDir, { recursive: true }, (event, filename) => {
    if (!filename || !filename.endsWith('.html')) return
    if (watchTimer) clearTimeout(watchTimer)
    watchTimer = setTimeout(() => sendSSE(filename), 100)
  })
} catch {}

function serveFile(res, filePath) {
  if (!filePath) { res.writeHead(404); res.end('Not found'); return }
  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'
  try {
    const data = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
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

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const pathname = url.pathname

  if (pathname === '/__sp_events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    res.write('event: connected\ndata: \n\n')
    clients.push(res)
    req.on('close', () => {
      const i = clients.indexOf(res)
      if (i !== -1) clients.splice(i, 1)
    })
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

server.listen(port, () => {
  const addr = `http://localhost:${port}`
  console.log(`\n  SlidesPurryst dev server running at ${addr}`)
  console.log(`  Serving ${root}${specifiedFile ? '  (' + specifiedFile + ')' : ''}\n`)
  const openUrl = specifiedFile ? `${addr}/${specifiedFile}` : addr
  console.log(`  🚀 URL: ${openUrl}`)
  if (autoOpen) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    import('child_process').then(({ spawn }) => {
      try { spawn(cmd, [openUrl], { stdio: 'ignore' }) } catch {}
    })
  }
})
