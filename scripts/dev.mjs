import { spawn, execSync } from 'child_process'
import { watchFile } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const useTypst = process.argv.includes('--typst') || process.argv.includes('typst')
const demoFile = useTypst
  ? 'example/demo-slidespurryst.html'
  : 'example/demo-slidespurr.html'
const output = resolve(root, demoFile)

let processes = []

if (useTypst) {
  const typstArgs = [
    'watch', '--no-serve',
    '--root', root,
    '--input', 'slides-purryst-path=../dist/slides-purryst.es.js',
    '--input', 'slides-purryst-css-path=../dist/slides-purryst.css',
    '--input', 'slides-purryst-module=true',
    '--format', 'html', '--features', 'html',
    'example/demo-slidespurryst.typ', output,
  ]

  const typst = spawn('typst', typstArgs, { stdio: 'inherit', cwd: root })
  processes.push(typst)

  let lastMtime = 0
  watchFile(output, { interval: 500 }, (cur) => {
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      try {
        execSync('npx prettier --write --parser html "' + output + '"', {
          cwd: root, stdio: 'ignore', timeout: 10000,
        })
      } catch {}
    }
  })
}

const vite = spawn('npx', ['vite', '--port', '3334', '--open', '/' + demoFile], {
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
