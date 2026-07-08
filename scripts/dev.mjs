import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const vite = spawn('npx', ['vite', '--port', '3334', '--open', '/example/dev.html'], {
  stdio: 'inherit',
  cwd: root,
  shell: true,
})

function cleanup() {
  vite.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)