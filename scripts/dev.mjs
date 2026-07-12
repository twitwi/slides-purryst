import { spawn, execSync } from 'child_process'
import { watchFile } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const useTypst = process.argv.includes('--typst') || process.argv.includes('typst')
const dir = 'example'
const base = `demo-slides${useTypst ? 'purryst' : 'purr'}`
const demoFile = `${dir}/${base}.html`
const demoTypst = `${dir}/${base}.typ`
const tmp = (i) => `${dir}/,,${base}-${i}.html`

let processes = []

if (useTypst) {
  const output = resolve(root, demoFile)
  const tmp1 = resolve(root, tmp(1))
  const tmp2 = resolve(root, tmp(2))
  const typstArgs = [
    'watch', '--no-serve',
    '--root', root,
    '--input', 'slides-purryst-path=../src/index.ts',
    //'--input', 'slides-purryst-css-path=../dist/slides-purryst.css',
    '--input', 'slides-purryst-module=true',
    '--format', 'html', '--features', 'html',
    demoTypst, tmp1,
  ]

  const typst = spawn('typst', typstArgs, { stdio: 'inherit', cwd: root })
  processes.push(typst)

  let lastMtime = 0
  let busy = false
  watchFile(tmp1, { interval: 500 }, (cur) => {
    if (busy) return
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      busy = true
      try {
        const _ = (cmd) => {
          console.log("DO::: "+cmd)
          execSync(cmd, { cwd: root, stdio: 'ignore', timeout: 1000, })
        }
        _('cp "' + tmp1 + '" "' + tmp2 + '"')
        _('pnpm do-prettier-inplace "' + tmp2 + '"')
        _('cp "' + tmp2 + '" "' + output + '"')
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
