#!/usr/bin/env node

import { createServer, loadConfigFromFile, mergeConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgDir = resolve(__dirname, '..')

let watchDir = '.'
let rootDir = '.'
let port = 9999
let fileArg = ''
let autoOpen = true

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg === '--port' && i + 1 < process.argv.length) port = parseInt(process.argv[++i], 10)
  else if (arg.startsWith('--port=')) port = parseInt(arg.split('=')[1], 10)
  else if (arg === '--watch' && i + 1 < process.argv.length) watchDir = process.argv[++i]
  else if (arg.startsWith('--watch=')) watchDir = arg.split('=')[1]
  else if (arg === '--root' && i + 1 < process.argv.length) rootDir = process.argv[++i]
  else if (arg.startsWith('--root=')) rootDir = arg.split('=')[1]
  else if (arg === '--open') autoOpen = true
  else if (arg === '--no-open') autoOpen = false
  else if (!arg.startsWith('-')) fileArg = arg
}

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
    open: autoOpen ? (fileArg || true) : false,
  },
}

const finalConfig = mergeConfig(spConfig, overrides)
const server = await createServer(finalConfig)
await server.listen()

const fileInfo = fileArg ? `  Opening ${fileArg}` : ''
console.log(`\n  SlidesPurryst dev server running at http://localhost:${port}`)
console.log(`  Serving ${serverRoot}${fileInfo ? '\n' + fileInfo : ''}\n`)
