#!/usr/bin/env node

import { createServer, loadConfigFromFile, mergeConfig } from 'vite'
import { existsSync, symlinkSync, watchFile, watch, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs'
import { resolve, dirname, basename, join } from 'path'
import { fileURLToPath } from 'url'
import { spawn, execSync } from 'child_process'
import { formatHtml } from '../lib/format-html.mjs'
import { preprocessTypst, quickStringHash } from '../lib/preprocess-typst.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgDir = resolve(__dirname, '..')

const PREPROCESS_DIR = ',,sp-preprocess'

function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1].trim() : html
}

function wrapPage(content, { title, author, jsPath, useModule, designWidth, designHeight }) {
  const designW = designWidth || 1920
  const designH = designHeight || 1080
  const scriptHtml = useModule
    ? `<script type="module">import { createSlidesPurryst } from "${jsPath}";\nawait createSlidesPurryst()</script>`
    : `<script src="${jsPath}"></script>\n<script>SlidesPurryst.createSlidesPurryst()</script>`
  return `<!DOCTYPE html>
<html lang="en" class="theme-clean">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${title || 'Presentation'}</title>
</head>
<body>
<script type="text/html" id="sp-content">
${content}
</script>
<div id="sp-presentation" data-design-width="${designW}" data-design-height="${designH}" data-author="${author || ''}"></div>
${scriptHtml}
</body>
</html>`
}

function ensureDir(dir) {
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }) }
}

function setupPreprocessDir(serverRoot, hash, relFile) {
  const preDir = resolve(serverRoot, PREPROCESS_DIR + '/' + hash)
  if (existsSync(preDir)) {
    rmSync(preDir, { recursive: true, force: true })
  }

  const fileDir = dirname(relFile)
  const preFileDir = resolve(preDir, fileDir)
  ensureDir(preFileDir)

  const srcDir = resolve(serverRoot, fileDir)
  if (existsSync(srcDir)) {
    for (const entry of readdirSync(srcDir)) {
      if (entry === basename(relFile)) continue
      if (entry.startsWith(',,')) continue
      const srcPath = join(srcDir, entry)
      const dstPath = join(preFileDir, entry)
      try { symlinkSync(srcPath, dstPath) } catch {}
    }
  }

  const preFilePath = resolve(preDir, relFile)
  return { preDir, preFilePath }
}

function setupPreprocessSymlink(preDir, linkDir, linkName, linkTarget) {
  const preLinkDir = resolve(preDir, linkDir)
  ensureDir(preLinkDir)
  const dstPath = join(preLinkDir, linkName)
  if (!existsSync(dstPath)) {
    try { symlinkSync(resolve(linkTarget), dstPath) } catch {}
  }
}

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

let viteHtml = fileArg

// --- Typst compilation ---
let typstProcess = null
if (fileArg && fileArg.endsWith('.typ')) {
  viteHtml = fileArg.replace(/\.typ$/, '.html')
  const serverRoot = resolve(process.cwd(), rootDir)
  const typFile = resolve(serverRoot, fileArg)
  const inputFileHash = quickStringHash(typFile)
  const base = basename(fileArg, '.typ')
  const htmlRel = fileArg.replace(/\.typ$/, '.html')
  const htmlFile = resolve(serverRoot, htmlRel)

  const linkPath = join(dirname(typFile), 'slides-purryst')
  const linkTarget = join(pkgDir, 'typst', 'slides-purryst')
  if (!existsSync(linkPath)) {
    try { symlinkSync(linkTarget, linkPath) } catch {}
  }

  // --- Preprocessor setup ---
  const { preDir, preFilePath } = setupPreprocessDir(serverRoot, inputFileHash, fileArg)
  setupPreprocessSymlink(preDir, dirname(fileArg), 'slides-purryst', linkTarget)

  const tmpFile = resolve(preDir, `,,${inputFileHash}.html`)

  const rawSource = readFileSync(typFile, 'utf-8')
  const preprocessed = preprocessTypst(rawSource, fileArg)
  writeFileSync(preFilePath, preprocessed, 'utf-8')

  const slidesPurrystPath = serverRoot === pkgDir ? '../src/index.ts' : 'slides-purryst'

  const typstArgs = [
    'watch', '--no-serve',
    '--root', serverRoot,
    '--input', `slides-purryst-path=${slidesPurrystPath}`,
    '--input', 'slides-purryst-module=true',
    '--input', `slides-purryst-filepath=${typFile}`,
    '--format', 'html', '--features', 'html',
    preFilePath, tmpFile,
  ]

  const wrapOpts = {
    title: 'SlidesPurryst',
    author: '',
    jsPath: slidesPurrystPath,
    useModule: serverRoot === pkgDir,
    designWidth: 1920,
    designHeight: 1080,
  }

  try {
    const compileArgs = [
      'compile',
      '--root', serverRoot,
      '--input', `slides-purryst-path=${slidesPurrystPath}`,
      '--input', 'slides-purryst-module=true',
      '--input', `slides-purryst-filepath=${typFile}`,
      '--format', 'html', '--features', 'html',
      preFilePath, tmpFile,
    ]
    const argStr = compileArgs.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')
    execSync(`typst ${argStr}`, { cwd: pkgDir, stdio: 'inherit', timeout: 60000 })
    const raw = readFileSync(tmpFile, 'utf-8')
    const body = extractBody(raw)
    writeFileSync(htmlFile, wrapPage(formatHtml(body), wrapOpts), 'utf-8')
    console.log('Initial typst compile done.')
  } catch (e) {
    console.error('Initial typst compile failed, will retry via watch:', e.message)
  }

  let lastMtime = 0
  let busy = false
  watchFile(tmpFile, { interval: 300 }, (cur) => {
    if (busy) return
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      busy = true
      try {
        const raw = readFileSync(tmpFile, 'utf-8')
        const body = extractBody(raw)
        writeFileSync(htmlFile, wrapPage(formatHtml(body), wrapOpts), 'utf-8')
      } finally { busy = false }
    }
  })

  // Watch original .typ file for changes → re-preprocess
  let ppTimer = null
  watch(typFile, () => {
    clearTimeout(ppTimer)
    ppTimer = setTimeout(() => {
      try {
        const src = readFileSync(typFile, 'utf-8')
        const pp = preprocessTypst(src, fileArg)
        writeFileSync(preFilePath, pp, 'utf-8')
      } catch (e) {
        console.error('Preprocessing failed:', e.message)
      }
    }, 100)
  })

  typstProcess = spawn('typst', typstArgs, { stdio: 'inherit', cwd: pkgDir })

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
  },
}

const finalConfig = mergeConfig(spConfig, overrides)
const server = await createServer(finalConfig)
await server.listen()

console.log(`\n  SlidesPurryst dev server running at http://localhost:${port}`)
console.log(`  Serving ${serverRoot}`)
const openUrl = fileArg ? `http://localhost:${port}/${viteHtml}` : `http://localhost:${port}/`
console.log(`  URL: ${openUrl}`)
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
