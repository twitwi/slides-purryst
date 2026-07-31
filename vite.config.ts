import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { watch } from 'fs'
import { handleEdit } from './lib/edit-handler.mjs'
import { sseRegisterClient, sseBroadcast, getTypstErrors } from './lib/sse.mjs'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const watchDir = process.env.SP_WATCH_DIR || resolve(__dirname, 'example')
  const rootDir = process.env.SP_ROOT_DIR || __dirname

  return {
    server: {
      watch: {
        ignored: ["**/demo-*.*", "**/index.html", "**/,,*", "**/slides-purryst"]
      }
    },
    plugins: [
      vue(),
      dts({ rollupTypes: true }),
      {
        name: 'sp-reload',
        configureServer(server) {

          server.middlewares.use('/__sp_events', (req, res) => {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
            })
            res.write('event: connected\ndata: \n\n')
            sseRegisterClient(res)
            const errs = getTypstErrors()
            if (errs.length) res.write(`event: typst-error\ndata: ${JSON.stringify(errs)}\n\n`)
          })

          server.middlewares.use('/__sp_edit', (req, res) => {
            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', () => handleEdit(body, rootDir, req.method as string, res))
          })

          // Inject SSE client into HTML responses
          server.middlewares.use((req, res, next) => {
            if (!req.url || !req.url.endsWith('.html')) { next(); return }
            const origEnd = res.end.bind(res)
            const origWrite = res.write.bind(res)
            const chunks: Buffer[] = []
            res.write = (chunk: any) => { chunks.push(Buffer.from(chunk)); return true }
            res.end = (chunk?: any) => {
              if (chunk) chunks.push(Buffer.from(chunk))
              let html = Buffer.concat(chunks).toString('utf-8')
              res.setHeader('Content-Length', Buffer.byteLength(html))
              origEnd(html)
            }
            next()
          })

          let timer: ReturnType<typeof setTimeout> | null = null
          //console.log("WATCHING "+htmlFile)
          watch(watchDir, { recursive: true }, (...o) => {
            //console.log("CHANGED ", ...o)
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              sseBroadcast('update', o[1] ?? '')
            }, 100)
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'vue': 'vue/dist/vue.esm-browser.js'
      }
    },
    ...(isProd && {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'SlidesPurryst',
          fileName: (format) =>
            `slides-purryst.${format}.${format === 'umd' ? 'cjs' : 'js'}`
        },
        rollupOptions: {
          external: ['vue', 'shiki'],
          output: {
            globals: { vue: 'Vue' },
            assetFileNames: (chunk) => {
              if (chunk.name === 'style.css') return 'slides-purryst.css'
              return 'slides-purryst.[ext]'
            }
          }
        }
      }
    })
  }
})