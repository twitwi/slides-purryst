// Shared Typst compilation/watch pipeline, used by both bin/sp-dev.mjs
// (Vite-backed dev server) and bin/cli.mjs (zero-dependency static server).
//
// The pipeline is engine-agnostic: it compiles a `.typ` file to HTML via the
// `typst` CLI, post-processes the output, and keeps everything in sync while
// the source changes. The only caller-specific concern is how the final HTML
// is packaged (sp-dev re-wraps the body for module mode; cli uses the page
// emitted natively by typst/slides-purryst/main.typ).

import { existsSync, symlinkSync, watchFile, watch, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, lstatSync, readlinkSync, realpathSync, unlinkSync } from 'fs'
import { resolve, dirname, basename, join } from 'path'
import { spawn, execSync, spawnSync } from 'child_process'
import { formatHtml } from './format-html.mjs'
import { preprocessTypst, quickStringHash } from './preprocess-typst.mjs'
import { injectCetzClasses } from './inject-cetz-classes.mjs'
import { createTypstErrorParser } from './typst-errors.mjs'
import { setTypstErrors } from './sse.mjs'

const PREPROCESS_DIR = ',,sp-preprocess'

// The name every project uses to reach the bundled Typst library
// (`#import "slides-purryst/lib.typ"` resolves relative to the .typ file).
const LIB_LINK = 'slides-purryst'

export function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1].trim() : html
}

// Pull `<template data-sp-cache="...">` blocks out of a body fragment so they
// end up as real (inert) DOM elements next to `#sp-chunklets`, outside
// `#sp-content`. Nested `<template>` tags are handled by depth counting.
function extractCacheTemplates(content) {
  const templates = []
  let result = content
  let cursor = 0
  let stripped = ''
  const re = /<template[^>]*data-sp-cache=[^>]*>/g
  let m
  while ((m = re.exec(result)) !== null) {
    let depth = 0
    let i = m.index
    let end = -1
    while (i < result.length) {
      if (result.startsWith('</template>', i)) {
        depth--
        i += '</template>'.length
        if (depth === 0) { end = i; break }
      } else if (result.startsWith('<template', i) && /[\s>]/.test(result[i + '<template'.length] ?? '')) {
        depth++
        i += '<template'.length
        const gt = result.indexOf('>', i)
        i = gt >= 0 ? gt + 1 : result.length
      } else {
        i++
      }
    }
    if (end === -1) break
    templates.push(result.slice(m.index, end))
    stripped += result.slice(cursor, m.index)
    cursor = end
    re.lastIndex = end
  }
  stripped += result.slice(cursor)
  return { content: stripped, templates: templates.join('\n') }
}

// Pull a `<script type="text/html" id="sp-init">` payload out of a body
// fragment so it becomes a real element next to `#sp-presentation` (outside
// `#sp-content`). The payload is raw text (JSON, `</` sanitized by the `#sp-init`
// helper), so a plain non-greedy match is safe.
function extractInitScript(content) {
  const m = content.match(/<\s*script[^>]*id=["']sp-init["'][^>]*>[\s\S]*?<\/script>/i)
  if (!m) return { content, script: '' }
  return {
    content: content.slice(0, m.index) + content.slice(m.index + m[0].length),
    script: m[0],
  }
}

export function wrapPage(content, { title, author, jsPath, useModule, designWidth, designHeight, theme = 'simple', filepath = '' }) {
  const designW = designWidth || 1920
  const designH = designHeight || 1080
  const { content: contentNoCache, templates: cacheTemplates } = extractCacheTemplates(content)
  const chunkletsMatch = contentNoCache.match(/<script type="text\/html" id="sp-chunklets">[\s\S]*?<\/script>/i)
  const chunklets = chunkletsMatch ? chunkletsMatch[0] : ''
  const contentNoChunklets = chunklets
    ? contentNoCache.slice(0, chunkletsMatch.index) + contentNoCache.slice(chunkletsMatch.index + chunkletsMatch[0].length)
    : contentNoCache
  const { content: slidesContent, script: initScript } = extractInitScript(contentNoChunklets)
  const scriptHtml = useModule
    ? `<script type="module">import { createSlidesPurryst } from "${jsPath}";\nawait createSlidesPurryst()</script>`
    : `<script src="${jsPath}"></script>\n<script>SlidesPurryst.createSlidesPurryst()</script>`
  return `<!DOCTYPE html>
<html lang="en" class="theme-${theme}">
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
${cacheTemplates}
${initScript}
<div id="sp-presentation" data-design-width="${designW}" data-design-height="${designH}" data-author="${author || ''}" data-sp-filepath="${filepath}"></div>
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

function setupPreprocessSymlink(preDir, linkDir, libDir) {
  // Gives the sandboxed .typ a working `slides-purryst`. The sibling-copy loop in
  // setupPreprocessDir may already have linked the project's own one, and that one
  // wins (it can be a local copy of the library): this only steps in when the link
  // is missing, or dangles because the project was moved.
  const preLinkDir = resolve(preDir, linkDir)
  ensureDir(preLinkDir)
  const linkPath = join(preLinkDir, LIB_LINK)
  return { linkPath, ...reconcileLibLink(linkPath, libDir) }
}

function realpathOrNull(p) {
  try { return realpathSync(p) } catch { return null }
}

/**
 * Makes sure `linkPath` is a usable link to the packaged Typst library `libDir`,
 * and reports what it did.
 *
 * Updating the package moves that library: an install dir (typically a versioned
 * `…/node_modules/.pnpm/slides-purryst@x.y.z/…`) or a whole workspace gets deleted
 * or renamed, and the link left behind by an earlier run then dangles. `existsSync`
 * reports a dangling link as absent, so a plain "link it if it is not there" check
 * runs into EEXIST on the link itself — and swallowing that error, as it used to,
 * leaves the link broken forever: typst then fails on `slides-purryst/lib.typ` with
 * nothing pointing at the real cause. So inspect the link itself (lstat) and repair
 * what can only be ours:
 *
 *  - absent       → create it
 *  - dangling     → replace it (an old install path, it cannot be deliberate)
 *  - other target → keep it and report: may be a deliberate fork. `force` re-points.
 *  - real folder  → keep it: that is how one copies the library to customise it
 *
 * @returns {{status: 'ok'|'created'|'relinked'|'kept'|'kept-local'|'broken-local'|'missing-lib'|'error',
 *            to: string, from?: string, broken?: boolean, error?: string}}
 */
function reconcileLibLink(linkPath, libDir, { force = false } = {}) {
  const to = realpathOrNull(libDir)
  if (!to) return { status: 'missing-lib', to: libDir }

  let st = null
  try { st = lstatSync(linkPath) } catch {}
  if (!st) {
    try { symlinkSync(libDir, linkPath) } catch (e) { return { status: 'error', to, error: e.message } }
    return { status: 'created', to }
  }
  if (!st.isSymbolicLink()) {
    if (!st.isDirectory()) return { status: 'broken-local', to, from: 'a plain file', error: 'it is not a folder' }
    if (!existsSync(join(linkPath, 'lib.typ'))) return { status: 'broken-local', to, from: 'a folder without lib.typ', error: 'no lib.typ in it' }
    return { status: 'kept-local', to }
  }
  const dest = realpathOrNull(linkPath)
  if (dest === to) return { status: 'ok', to }
  if (dest && !force) return { status: 'kept', to, from: dest }
  const rawDest = (() => { try { return readlinkSync(linkPath) } catch { return null } })()
  try {
    unlinkSync(linkPath)
    symlinkSync(libDir, linkPath)
  } catch (e) { return { status: 'error', to, error: e.message } }
  // `from` is the target as written in the link, which is what the user recognises.
  return { status: 'relinked', to, from: dest || rawDest || 'a location that is gone', broken: !dest }
}

/**
 * What a reconcileLibLink() result means to the user: null when there is nothing
 * to say, else `{ level, text }` with level 'error' meaning the build cannot work.
 */
export function libLinkMessage({ linkPath, status, to, from, broken, error }) {
  const LIB_IMPORT = '`#import "slides-purryst/lib.typ"`'
  const RELINK = `rm ${linkPath} && slides-purryst --link-typst`
  switch (status) {
    case 'ok':
    case 'kept-local':
      return null
    case 'created':
      return { level: 'log', text: `Linked ${linkPath} → ${to}` }
    case 'relinked':
      return { level: 'warn', text:
          `  ⚠ ${linkPath} ${broken ? 'was a broken link (an old slides-purryst location)' : 'pointed elsewhere'}:\n` +
          `    ${from}\n` +
          `    It now points at the library of the version being run:\n` +
          `    ${to}` }
    case 'kept':
      return { level: 'warn', text:
          `  ⚠ ${linkPath} points at\n    ${from}\n` +
          `    instead of the library being run (${to}), so ${LIB_IMPORT} uses that copy.\n` +
          `    To use the packaged library: ${RELINK}` }
    case 'broken-local':
      return { level: 'warn', text:
          `  ⚠ ${linkPath} is ${from}, so ${LIB_IMPORT} will not resolve.\n` +
          `    That name must link to the Typst library, or be a copy of it (with lib.typ in it).\n` +
          `    To use the packaged library: rm -rf ${linkPath} && slides-purryst --link-typst` }
    case 'missing-lib':
      return { level: 'error', text:
          `The Typst library shipped with slides-purryst was not found:\n    ${to}\n` +
          `Reinstall slides-purryst: the package must contain typst/slides-purryst.` }
    default:
      return { level: 'warn', text: `  ⚠ Could not set up ${linkPath} → ${to}: ${error}` }
  }
}

/**
 * Link the bundled Typst library into the server root so that a `.typ` file can
 * `#import "slides-purryst/lib.typ"`. An existing link from an earlier install is
 * re-pointed when it dangles (see reconcileLibLink); returns the link path plus
 * what was done, so callers can report it.
 */
export function ensureTypstLink(pkgDir, rootDir, { force = false } = {}) {
  const linkPath = join(rootDir, LIB_LINK)
  const libDir = join(pkgDir, 'typst', LIB_LINK)
  return { linkPath, ...reconcileLibLink(linkPath, libDir, { force }) }
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
 * @param {string} [opts.errorKey]  - Key under which this entry's compile errors are stored
 *   (defaults to fileArg). Must match the `data-sp-filepath` embedded by wrapPage.
 * @param {(html: string) => string} [opts.wrapOutput] - Final packaging step, applied
 *   after formatHtml + injectCetzClasses. Defaults to identity (main   .typ already
 *   emits a complete page).
 * @param {boolean} [opts.watch]     - Whether to spawn the typst watch process and watch
 *   for changes. Set false for a one-shot compile (used by --compile).
 * @param {(msg: string) => void} [opts.log]
 * @returns {{ htmlRel: string, htmlFile: string, tmpFile: string, preFilePath: string, initialOk: boolean, stop: () => void }}
 */
export function startTypstDev({
  pkgDir,
  rootDir,
  fileArg,
  jsPath,
  useModule = false,
  errorKey = fileArg,
  wrapOutput,
  watch = true,
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

  // typst resolves `slides-purryst/lib.typ` relative to the .typ file, so a .typ in
  // a subdirectory needs a working link there, not only at the server root: the
  // sandbox gets one either way (setupPreprocessSymlink), but the project's own is
  // what tinymist and a hand-run `typst compile` use. Heal both, same terms.
  const reportLink = (res) => {
    const msg = libLinkMessage(res)
    if (!msg) return
    if (msg.level === 'error') throw new Error(`\n${msg.text}\n`)
    log(msg.text)
  }
  reportLink(ensureTypstLink(pkgDir, rootDir))
  const fileDir = dirname(fileArg)
  if (fileDir && fileDir !== '.') reportLink(ensureTypstLink(pkgDir, resolve(rootDir, fileDir)))

  const { preDir, preFilePath } = setupPreprocessDir(rootDir, inputFileHash, fileArg)
  const preLink = setupPreprocessSymlink(preDir, fileDir, join(pkgDir, 'typst', LIB_LINK))
  // Whatever is odd about the sandbox link came from the project entry it was
  // copied from, which the checks above already reported — so only a failure to
  // create it here is worth a line of its own.
  if (preLink.status === 'error') log(libLinkMessage(preLink).text)
  const tmpFile = resolve(preDir, `,,${inputFileHash}.html`)

  const cook = (raw) => wrapOutput ? wrapOutput(injectCetzClasses(formatHtml(raw))) : injectCetzClasses(formatHtml(raw))

  const compileInputs = [
    `slides-purryst-path=${jsPath}`,
    `slides-purryst-module=${useModule ? 'true' : 'false'}`,
    `slides-purryst-typfile-dir=${dirname(fileArg)}`,
    //`slides-purryst-filepath=${typFile}`,
  ]

  const writePreprocessed = () => {
    const rawSource = readFileSync(typFile, 'utf-8')
    writeFileSync(preFilePath, preprocessTypst(rawSource, fileArg), 'utf-8')
  }
  writePreprocessed()

  const compileArgs = [
    'compile',
    '--root', preDir, // rootDir
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

  let initialOk = false
  try {
    const argStr = compileArgs.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')
    execSync(`typst ${argStr}`, { cwd: pkgDir, stdio: 'pipe', timeout: 60000 })
    writeOutput()
    setTypstErrors(errorKey, [])
    initialOk = true
    log(`Initial typst compile done. (${fileArg})`)
  } catch (e) {
    const stderr = (e.stderr ?? '').toString()
    const parser = createTypstErrorParser({ onErrors: (errs) => setTypstErrors(errorKey, errs), rewritePath })
    parser.push(stderr)
    parser.end()
    log(`Initial typst compile failed${watch ? ', will retry via watch' : ''}: ${stderr.trim()}`)
    if (!existsSync(htmlFile)) {
      writeFileSync(htmlFile, cook(''), 'utf-8')
    }
  }

  let stop = null
  if (watch) {
    const typstErrorParser = createTypstErrorParser({ onErrors: (errs) => setTypstErrors(errorKey, errs), rewritePath })

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
          setTypstErrors(errorKey, [])
        } finally { busy = false }
      }
    })

    let ppTimer = null
    watchFile(typFile, () => {
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

    stop = () => { typstProcess.kill() }
  }

  return {
    htmlRel,
    htmlFile,
    tmpFile,
    preFilePath,
    initialOk,
    stop,
  }
}
