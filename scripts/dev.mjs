import { spawn, execSync } from 'child_process'
import { watchFile, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function formatHtml(html) {
  const preTags = []
  let idx = 0
  const stripped = html.replace(/<pre[\s>][\s\S]*?<\/pre>/gi, (match) => {
    const key = `__PRE_${idx}__`
    preTags.push(match)
    idx++
    return key
  })

  const parts = stripped.split(/(?=<)/)
  let result = ''
  let depth = 0
  for (let part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const isClosing = /^<\//.test(trimmed)
    const isSelfClosing = /^<[^>]*\/>/.test(trimmed)
    const isOpenBlock = /^<(?!\/)(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|sp-anim|sp-pause|sp-alternatives|sp-toc|sp-include|sp-svg)([\s>])/i.test(trimmed) || isSelfClosing

    if (isClosing) depth = Math.max(0, depth - 1)
    const indent = '  '.repeat(depth)
    if (!isClosing && !isOpenBlock && !isSelfClosing) depth++

    if (/^<sp-slide[\s>]/i.test(trimmed)) {
      result += '\n\n'
    }
    result += indent + trimmed + '\n'
  }

  result = result.replace(/__PRE_(\d+)__/g, (_, n) => {
    return preTags[parseInt(n)]
  })
  return result.trim() + '\n'
}

const source = process.argv[2]
if (!source) {
  console.log('Please provide a html or typ file path.')
  process.exit()
}
const dir = dirname(source)
const useTypst = source.endsWith('.typ')
const base = basename(source, useTypst ? '.typ' : '.html')
const demoFile = `${dir}/${base}.html`
const demoTypst = `${dir}/${base}.typ`
const tmp = (i) => `${dir}/,,${base}-${i}.html`

let processes = []

if (useTypst) {
  const output = resolve(root, demoFile)
  const tmp1 = resolve(root, tmp(1))
  //const tmp2 = resolve(root, tmp(2))

  // Ensure initial output exists before watching
  console.log('Initial typst compile...')
  const typstArgs = [
    'watch', '--no-serve',
    '--root', root,
    '--input', 'slides-purryst-path=../src/index.ts',
    //'--input', 'slides-purryst-css-path=../dist/slides-purryst.css',
    '--input', 'slides-purryst-module=true',
    '--input', 'slides-purryst-filepath=' + demoTypst,
    '--format', 'html', '--features', 'html',
    demoTypst, tmp1,
  ]
  try {
    execSync(`typst compile ${typstArgs.slice(2).join(' ')}`, { cwd: root, stdio: 'inherit', timeout: 60000 })
    const raw = readFileSync(tmp1, 'utf-8')
    const formatted = formatHtml(raw)
    writeFileSync(output, formatted, 'utf-8')
    console.log('Initial compile done.')
  } catch (e) {
    console.error('Initial typst compile failed, will retry via watch:', e.message)
  }


  const typst = spawn('typst', typstArgs, { stdio: 'inherit', cwd: root })
  processes.push(typst)

  let lastMtime = 0
  let busy = false
  watchFile(tmp1, { interval: 300 }, (cur) => {
    if (busy) return
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      busy = true
      try {
        const _ = (cmd) => {
          //console.log("DO::: "+cmd)
          //const st = Date.now()
          //console.log(new Date())
          execSync(cmd, { cwd: root, stdio: 'ignore', timeout: 1000, })
          //console.log(st - Date.now())
        }
        //_(`cp "${tmp1}" "${tmp2}"`)
        //_('pnpm SLOW-do-prettier-inplace "' + tmp2 + '"')
        //_('cp "' + tmp2 + '" "' + output + '"')
        const raw = readFileSync(tmp1, 'utf-8')
        const formatted = formatHtml(raw)
        writeFileSync(output, formatted, 'utf-8')
      } finally {
        busy = false
      }
    }
  })
}

//const vite = spawn('pnpm', ['vite', '--port', '3334', '--open', '/' + demoFile], {
const vite = spawn('pnpm', ['do-serve-open', '/' + demoFile], {
  stdio: 'inherit',
  cwd: root,
  shell: true,
  env: { ...process.env, USETYPST: useTypst }
})
processes.push(vite)

function cleanup() {
  processes.forEach(p => p.kill())
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
