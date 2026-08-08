#!/usr/bin/env node

import { createServer, loadConfigFromFile, mergeConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { startTypstDev, wrapPage, extractBody } from '../lib/typst-dev.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgDir = resolve(__dirname, '..')

let watchDir = '.'
let rootDir = '.'
let host = '127.0.0.1'
let port = 9999
let fileArg = ''
let autoOpen = true

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg === '--port' && i + 1 < process.argv.length) port = parseInt(process.argv[++i], 10)
  else if (arg.startsWith('--port=')) port = parseInt(arg.split('=')[1], 10)
  else if (arg === '--host' && i + 1 < process.argv.length) host = process.argv[++i]
  else if (arg.startsWith('--host=')) host = arg.split('=')[1]
  else if (arg === '--watch' && i + 1 < process.argv.length) watchDir = process.argv[++i]
  else if (arg.startsWith('--watch=')) watchDir = arg.split('=')[1]
  else if (arg === '--root' && i + 1 < process.argv.length) rootDir = process.argv[++i]
  else if (arg.startsWith('--root=')) rootDir = arg.split('=')[1]
  else if (arg === '--open') autoOpen = true
  else if (arg === '--no-open') autoOpen = false
  else if (!arg.startsWith('-')) fileArg = arg
}

let viteHtml = fileArg

// --- Typst compilation (shared pipeline) ---
let typstProcess = null
if (fileArg && fileArg.endsWith('.typ')) {
  viteHtml = fileArg.replace(/\.typ$/, '.html')
  const serverRoot = resolve(process.cwd(), rootDir)
  const slidesPurrystPath = serverRoot === pkgDir ? '../src/index.ts' : 'slides-purryst'
  const wrapOpts = { title: 'SlidesPurryst', author: '', jsPath: slidesPurrystPath, useModule: true, designWidth: 1920, designHeight: 1080 }

  const { stop } = startTypstDev({
    pkgDir,
    rootDir: serverRoot,
    fileArg,
    jsPath: slidesPurrystPath,
    useModule: true,
    wrapOutput: (raw) => wrapPage(extractBody(raw), wrapOpts),
  })
  typstProcess = { kill: stop }
}

// --- Vite server ---
process.env.SP_WATCH_DIR = resolve(process.cwd(), watchDir)
process.env.SP_ROOT_DIR = resolve(process.cwd(), rootDir)

const serverRoot = resolve(process.cwd(), rootDir)

const { config: spConfig } = await loadConfigFromFile(
  { command: 'serve', mode: 'development' },
  resolve(pkgDir, 'vite.config.ts'),
)

const overrides = {
  root: serverRoot,
  configFile: false,
  server: {
    port,
    host,
  },
}

const finalConfig = mergeConfig(spConfig, overrides)
console.log(`  Starting server`)
const server = await createServer(finalConfig)
await server.listen()

console.log(`\n  SlidesPurryst dev server running at http://${host}:${port}`)
console.log(`  Serving ${serverRoot}`)
const openUrl = fileArg ? `http://${host}:${port}/${viteHtml}` : `http://${host}:${port}/`
console.log(`  🚀 URL: ${openUrl}`)
if (autoOpen) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    import('child_process').then(({ spawn }) => {
      try { spawn(cmd, [openUrl], { stdio: 'ignore' }) } catch {}
    })
}
console.log()

// --- Cleanup ---
const cleanup = () => {
  if (typstProcess) typstProcess.kill()
  process.exit()
}
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
