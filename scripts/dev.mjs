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
const demoTypst = 'example/demo-slidespurryst.typ'

let processes = []

if (useTypst) {
  const output = resolve(root, demoFile)
  const outputIntermediate = resolve(root, demoFile + '2')
  const typstArgs = [
    'watch', '--no-serve',
    '--root', root,
    '--input', 'slides-purryst-path=../src/index.ts',
    //'--input', 'slides-purryst-css-path=../dist/slides-purryst.css',
    '--input', 'slides-purryst-module=true',
    '--format', 'html', '--features', 'html',
    demoTypst, output,
  ]

  const typst = spawn('typst', typstArgs, { stdio: 'inherit', cwd: root })
  processes.push(typst)

  let lastMtime = 0
  watchFile(output, { interval: 500 }, (cur) => {
    const mtime = cur.mtimeMs
    if (mtime !== lastMtime) {
      lastMtime = mtime
      //try {
        //execSync('cp "' + outputIntermediate + '" "' + output + '"', {
        //  cwd: root, stdio: 'ignore', timeout: 10000,
        //})
        //execSync('pnpx prettier --write --parser html "' + output + '"', {
        //  cwd: root, stdio: 'ignore', timeout: 10000,
        //})
      //} catch {}
    }
  })
}

//const vite = spawn('pnpm', ['vite', '--port', '3334', '--open', '/' + demoFile], {
const vite = spawn('pnpm', ['serve-open', '/' + demoFile], {
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
