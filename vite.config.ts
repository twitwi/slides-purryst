import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { watch, readFileSync, writeFileSync, existsSync } from 'fs'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isTypst = process.env.USETYPST === "true"
  console.log("VITE:", isTypst, process.env) 
  const typstFile = resolve(__dirname, 'example/demo-slidespurryst.typ')
  const htmlFile = isTypst
    ? resolve(__dirname, 'example/demo-slidespurryst.html')
    : resolve(__dirname, 'example/demo-slidespurr.html')

  return {
    server: {
      watch: {
        ignored: [htmlFile]
      }
    },
    plugins: [
      vue(),
      dts({ rollupTypes: true }),
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

          server.middlewares.use('/__sp_edit', (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            if (req.method === 'OPTIONS') {
              res.writeHead(204)
              res.end()
              return
            }
            if (req.method !== 'POST') {
              res.writeHead(405)
              res.end('Method not allowed')
              return
            }

            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', () => {
              try {
                const data = JSON.parse(body)

                // === Typst mode: edit .typ source via dragId ===
                if (data.dragId != null && existsSync(typstFile)) {
                  const content = readFileSync(typstFile, 'utf-8')
                  const newMatch = data.newAttrs?.match(/at="([^"]+)"/)
                  if (!newMatch) {
                    res.writeHead(400, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ ok: false, error: 'Could not parse at value from newAttrs' }))
                    return
                  }
                  const newValue = newMatch[1]
                  const typstNew = `at: "${newValue}"`

                  const lines = content.split('\n')
                  const dragId = parseInt(data.dragId, 10)
                  let count = -1
                  let found = false

                  for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('#drag(')) {
                      count++
                      if (count === dragId) {
                        const searchEnd = Math.min(lines.length, i + 4)
                        for (let j = i; j < searchEnd; j++) {
                          const match = lines[j].match(/at:\s*"([^"]+)"/)
                          if (match) {
                            lines[j] = lines[j].replace(match[0], typstNew)
                            found = true
                            break
                          }
                        }
                        break
                      }
                    }
                  }

                  if (!found) {
                    res.writeHead(404, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({ ok: false, error: `Could not find drag #${dragId}` }))
                    return
                  }

                  writeFileSync(typstFile, lines.join('\n'), 'utf-8')
                  console.log(`[sp-edit] Updated drag #${dragId}: ${typstNew}`)
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ ok: true }))
                  return
                }

                // === HTML mode: edit HTML file via oldAttrs + slide ===
                const filePath = data.file
                  ? resolve(__dirname, data.file)
                  : htmlFile

                const content = readFileSync(filePath, 'utf-8')

                const oldAt = data.oldAttrs?.trim()
                const newAt = data.newAttrs?.trim()
                const isInsert = oldAt === '__sp_insert__'
                const slideIndex = typeof data.slide === 'number' ? data.slide : -1

                let slideStart = 0
                let sliceEnd = content.length
                if (slideIndex >= 0) {
                  const slideRegex = /<sp-slide[\s>]/g
                  let slideCount = 0
                  let slideMatch
                  while ((slideMatch = slideRegex.exec(content)) !== null) {
                    if (slideCount === slideIndex) {
                      slideStart = slideMatch.index
                      break
                    }
                    slideCount++
                  }
                  if (slideCount !== slideIndex) {
                    res.writeHead(404)
                    res.end(JSON.stringify({ error: `Slide index ${slideIndex} not found` }))
                    return
                  }
                  const nextSlideRegex = /<sp-slide[\s>]/g
                  nextSlideRegex.lastIndex = slideStart + 1
                  const nextMatch = nextSlideRegex.exec(content)
                  sliceEnd = nextMatch ? nextMatch.index : content.length
                }

                const slice = content.slice(slideStart, sliceEnd)

                if (isInsert) {
                  const newMatch = newAt?.match(/at="([^"]*)"/)
                  if (!newMatch) {
                    res.writeHead(400)
                    res.end(JSON.stringify({ error: 'newAttrs must include at="..." attribute' }))
                    return
                  }
                  const newVal = newMatch[1]
                  const insertRegex = /<sp-drag\b([^>]*?)(\/?\s*>)/i
                  const insertMatch = insertRegex.exec(slice)
                  if (!insertMatch) {
                    res.writeHead(404)
                    res.end(JSON.stringify({ error: 'sp-drag tag not found for insert' }))
                    return
                  }
                  const attrs = insertMatch[1]
                  const closer = insertMatch[2]
                  let updated: string
                  if (slideIndex >= 0) {
                    const before = content.slice(slideStart, sliceEnd)
                    const after = before.replace(insertRegex, `<sp-drag${attrs} at="${newVal}"${closer}`)
                    updated = content.slice(0, slideStart) + after + content.slice(sliceEnd)
                  } else {
                    updated = content.replace(insertRegex, `<sp-drag$1 at="${newVal}"$2`)
                  }
                  if (updated === content) {
                    res.writeHead(404)
                    res.end(JSON.stringify({ error: 'Insertion produced no change' }))
                    return
                  }
                  writeFileSync(filePath, updated, 'utf-8')
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ ok: true }))
                  return
                }

                const atRegex = /at="([^"]*)"/
                const oldMatch = oldAt?.match(atRegex)
                if (!oldMatch) {
                  res.writeHead(400)
                  res.end(JSON.stringify({ error: 'oldAttrs must include at="..." attribute' }))
                  return
                }

                const oldVal = oldMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const tagRegex = new RegExp(`(<sp-drag\\s[^>]*?at=")${oldVal}(")`)

                let match: RegExpExecArray | null = null
                if (slideIndex >= 0) {
                  tagRegex.lastIndex = 0
                  const sliceMatch = tagRegex.exec(slice)
                  if (sliceMatch) {
                    match = sliceMatch
                    match.index = slideStart + sliceMatch.index
                  }
                } else {
                  match = tagRegex.exec(content)
                }

                if (!match) {
                  res.writeHead(404)
                  res.end(JSON.stringify({ error: 'sp-drag tag not found', oldAt }))
                  return
                }

                const newMatch = newAt?.match(atRegex)
                if (!newMatch) {
                  res.writeHead(400)
                  res.end(JSON.stringify({ error: 'newAttrs must include at="..." attribute' }))
                  return
                }

                const newVal = newMatch[1]
                const before = match[0]
                const after = `${match[1]}${newVal}${match[2]}`

                let updated: string
                if (slideIndex >= 0) {
                  updated = content.slice(0, slideStart) +
                    content.slice(slideStart, sliceEnd).replace(before, after) +
                    content.slice(sliceEnd)
                } else {
                  updated = content.replace(before, after)
                }

                if (updated === content) {
                  res.writeHead(404)
                  res.end(JSON.stringify({ error: 'Replacement produced no change' }))
                  return
                }

                writeFileSync(filePath, updated, 'utf-8')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ ok: true }))
              } catch (err: any) {
                res.writeHead(500)
                res.end(JSON.stringify({ error: err.message, stack: err.stack }))
              }
            })
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