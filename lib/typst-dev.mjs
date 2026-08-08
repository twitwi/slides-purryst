// Shared Typst compilation/watch pipeline, used by both bin/sp-dev.mjs
// (Vite-backed dev server) and bin/cli.mjs (zero-dependency static server).
//
// The pipeline is engine-agnostic: it compiles a `.typ` file to HTML via the
// `typst` CLI, post-processes the output, and keeps everything in sync while
// the source changes. The only caller-specific concern is how the final HTML
// is packaged (sp-dev re-wraps the body for module mode; cli uses the page
// emitted natively by typst/slides-purryst/main.typ).

import { existsSync, symlinkSync, watchFile, watch, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'fs'
import { resolve, dirname, basename, join } from 'path'
import { spawn, execSync, spawnSync } from 'child_process'
import { formatHtml } from './format-html.mjs'
import { preprocessTypst, quickStringHash } from './preprocess-typst.mjs'
import { injectCetzClasses } from '../tools/inject-cetz-classes.mjs'
import { createTypstErrorParser } from './typst-errors.mjs'
import { setTypstErrors } from './sse.mjs'

const PREPROCESS_DIR = ',,sp-preprocess'

export function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1].trim() : html
}

export function wrapPage(content, { title, author, jsPath, useModule, designWidth, designHeight }) {
  const designW = designWidth || 1920
  const designH = designHeight || 1080
  const chunkletsMatch = content.match(/<script type="text\/html" id="sp-chunklets">[\s\S]*?<\/script>/i)
  const chunklets = chunkletsMatch ? chunkletsMatch[0] : ''
  const slidesContent = chunklets
    ? content.slice(0, chunkletsMatch.index) + content.slice(chunkletsMatch.index + chunkletsMatch[0].length)
    : content
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
${slidesContent}
</script>
${chunklets}
<div id="sp-presentation" data-design-width="${designW}" data-design-height="${designH}" data-author="${author || ''}"></div>
${scriptHtml}
</body>
</html>`
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
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

/**
 * Link the bundled Typst library into the server root so that a `.typ` file can
 * `#import "slides-purryst/lib.typ"`.
 */
export function ensureTypstLink(pkgDir, rootDir) {
  const linkPath = join(rootDir, 'slides-purryst')
  const linkTarget = join(pkgDir, 'typst', 'slides-purryst')
  if (!existsSync(linkPath)) {
    try { symlinkSync(linkTarget, linkPath) } catch {}
  }
  return linkPath
}

/**
 * Start the Typst compile/watch pipeline for a single `.typ` file.
 *
 * @param {object} opts
 * @param {string} opts.pkgDir      - Package root (containing typst/ and dist/)
 * @param {string} opts.rootDir     - Resolved server root (where the .typ lives)
 * @param {string} opts.fileArg     - Path to the .typ file, relative to rootDir
 * @param {string} opts.jsPath      - Path/URL the emitted page uses to load the engine
 * @param {boolean} opts.useModule  - Emit a module import instead of a plain script tag
 * @param {(html: string) => string} [opts.wrapOutput] - Final packaging step, applied
 *   after formatHtml + injectCetzClasses. Defaults to identity (main   .typ already
 *   emits a complete page).
 * @param {(msg: string) => void} [opts.log]
 * @returns {{ htmlRel: string, htmlFile: string, tmpFile: string, preFilePath: string, stop: () => void }}
 */
export function startTypstDev({
  pkgDir,
  rootDir,
  fileArg,
  jsPath,
  useModule = false,
  wrapOutput,
  log = console.log,
}) {
  const typFile = resolve(rootDir, fileArg)
  const inputFileHash = quickStringHash(typFile)
  const htmlRel = fileArg.replace(/\.typ$/, '.html')
  const htmlFile = resolve(rootDir, htmlRel)

  const typstCheck = spawnSync('typst', ['--version'], { stdio: 'pipe', timeout: 10000 })
  if (typstCheck.error || typstCheck.status !== 0) {
    throw new Error(`The \`typst\` binary was not found on PATH. Install it (https://typst.app) to compile "${fileArg}".`)
  }

  ensureTypstLink(pkgDir, rootDir)

  const { preDir, preFilePath } = setupPreprocessDir(rootDir, inputFileHash, fileArg)
  setupPreprocessSymlink(preDir, dirname(fileArg), 'slides-purryst', join(pkgDir, 'typst', 'slides-purryst'))
  const tmpFile = resolve(preDir, `,,${inputFileHash}.html`)

  const cook = (raw) => wrapOutput ? wrapOutput(injectCetzClasses(formatHtml(raw))) : injectCetzClasses(formatHtml(raw))

  const compileInputs = [
    `slides-purryst-path=${jsPath}`,
    `slides-purryst-module=${useModule ? 'true' : 'false'}`,
    `slides-purryst-filepath=${typFile}`,
  ]

  const writePreprocessed = () => {
    const rawSource = readFileSync(typFile, 'utf-8')
    writeFileSync(preFilePath, preprocessTypst(rawSource, fileArg), 'utf-8')
  }
  writePreprocessed()

  const compileArgs = [
    'compile',
    '--root', rootDir,
    ...compileInputs.map(i => ['--input', i]).flat(),
    '--format', 'html', '--features', 'html',
    preFilePath, tmpFile,
  ]

  const typstArgs = [
    'watch', '--no-serve',
    ...compileArgs.slice(1),
  ]

  const rewritePath = (loc) => loc.replace(new RegExp(`,,sp-preprocess/${inputFileHash}/`, 'g'), '')

  const writeOutput = () => {
    const raw = readFileSync(tmpFile, 'utf-8')
    writeFileSync(htmlFile, cook(raw), 'utf-8')
  }

  try {
    const argStr = compileArgs.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')
    execSync(`typst ${argStr}`, { cwd: pkgDir, stdio: 'pipe', timeout: 60000 })
    writeOutput()
    setTypstErrors([])
    log('Initial typst compile done.')
  } catch (e) {
    const stderr = (e.stderr ?? '').toString()
    const parser = createTypstErrorParser({ onErrors: setTypstErrors, rewritePath })
    parser.push(stderr)
    parser.end()
    log(`Initial typst compile failed, will retry via watch: ${stderr.trim()}`)
    if (!existsSync(htmlFile)) {
      writeFileSync(htmlFile, cook(''), 'utf-8')
    }
  }

  const typstErrorParser = createTypstErrorParser({ onErrors: setTypstErrors, rewritePath })

  let lastMtime = 0
  let busy = false
  watchFile(tmpFile, { interval: 300 }, (cur) => {
    if (busy) return
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      busy = true
      try {
        writeOutput()
        setTypstErrors([])
      } finally { busy = false }
    }
  })

  let ppTimer = null
  watch(typFile, () => {
    clearTimeout(ppTimer)
    ppTimer = setTimeout(() => {
      try {
        writePreprocessed()
      } catch (e) {
        log(`Preprocessing failed: ${e.message}`)
      }
    }, 100)
  })

  const typstProcess = spawn('typst', typstArgs, { stdio: ['ignore', 'inherit', 'pipe'], cwd: pkgDir })
  typstProcess.stderr.on('data', (chunk) => {
    process.stderr.write(chunk)
    typstErrorParser.push(chunk.toString())
  })

  return {
    htmlRel,
    htmlFile,
    tmpFile,
    preFilePath,
    stop: () => { typstProcess.kill() },
  }
}
