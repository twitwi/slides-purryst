import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { watch } from 'fs'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const htmlFile = resolve(__dirname, 'example/demo-slidespurr.html')

  return {
    server: {
      watch: {
        ignored: ['**/example/demo-slidespurr.html']
      }
    },
    plugins: [
      vue(),
      {
        name: 'sp-reload',
        configureServer(server) {
          const clients: import('http').ServerResponse[] = []

          server.middlewares.use('/__sp_events', (req, res) => {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
            })
            res.write('event: connected\ndata: \n\n')
            clients.push(res)
            req.on('close', () => {
              const i = clients.indexOf(res)
              if (i !== -1) clients.splice(i, 1)
            })
          })

          let timer: ReturnType<typeof setTimeout> | null = null
          watch(htmlFile, () => {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              clients.forEach((client) => {
                client.write('event: update\ndata: \n\n')
              })
            }, 100)
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'vue': 'vue/dist/vue.esm-bundler.js'
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
          external: ['vue'],
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