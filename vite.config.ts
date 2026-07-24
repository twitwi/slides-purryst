import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { watch, readFileSync, writeFileSync, existsSync } from 'fs'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    server: {
      watch: {
        ignored: ["**/demo-*.*", "**/,,*"]
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
                const filePath = resolve(__dirname, './' + data.file)
                const editableIndex = data.editableIndex
                const useTypst = filePath.endsWith('.typ')

                console.log(filePath)

                // === Typst mode: edit .typ source via dragId ===
                if (data.dragId != null && useTypst && existsSync(filePath)) {
                  const content = readFileSync(filePath, 'utf-8')
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

                  writeFileSync(filePath, lines.join('\n'), 'utf-8')
                  console.log(`[sp-edit] Updated drag #${dragId}: ${typstNew}`)
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ ok: true }))
                  return
                }

                // === Chunklet insertion ===
                if (data.action === 'insert-chunk' && existsSync(filePath)) {
                  const content = readFileSync(filePath, 'utf-8')
                  const slideIndex = typeof data.slide === 'number' ? data.slide : -1
                  if (slideIndex < 0) {
                    res.writeHead(400)
                    res.end(JSON.stringify({ error: 'slide index required' }))
                    return
                  }

                  const slideRegex = /<sp-slide[\s>]/g
                  let slideCount = 0
                  let slideMatch
                  let slideStart = 0
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

                  const closeTag = '</sp-slide>'
                  const closeIdx = content.indexOf(closeTag, slideStart)
                  if (closeIdx === -1) {
                    res.writeHead(404)
                    res.end(JSON.stringify({ error: 'Could not find closing sp-slide tag' }))
                    return
                  }

                  const newlineBefore = content.lastIndexOf('\n', closeIdx)
                  const leading = content.slice(newlineBefore + 1, closeIdx)
                  const baseIndent = leading.length - leading.trimStart().length

                  const chunkLines = data.html.split('\n')
                  const firstReal = chunkLines.find((l: string) => l.trim().length > 0)
                  const chunkIndent = firstReal ? firstReal.length - firstReal.trimStart().length : 0
                  const allChunkLineOk = chunkLines.every((l: string) => l.slice(0, chunkIndent).trim().length === 0)
                  const dedented = allChunkLineOk ? chunkLines.map((l: string) => l.slice(chunkIndent)) : chunkLines
                  const reindented = dedented.map((l: string) => l.length > 0 ? ' '.repeat(baseIndent + 2) + l : '')
                  const indentedHtml = reindented.join('\n')
                  console.log(firstReal, chunkIndent, allChunkLineOk, baseIndent)

                  const updated = content.slice(0, closeIdx) + '\n' + indentedHtml + '\n' + ' '.repeat(baseIndent) + content.slice(closeIdx)
                  writeFileSync(filePath, updated, 'utf-8')
                  console.log(`[sp-edit] Inserted chunk into slide #${slideIndex}`)
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ ok: true }))
                  return
                }

                // === HTML mode: edit HTML file via oldAttrs + slide ===
                const content = readFileSync(filePath, 'utf-8')

                const oldAt = data.oldAttrs?.trim()
                const newAt = data.newAttrs?.trim()
                const isInsert = oldAt === '__sp_insert__'

                // find the editableIndex+1 th sp-drag element in the file
                let blockStart = -1
                for (let i = 0; i <= editableIndex; i++) {
                  blockStart = content.indexOf('<sp-drag', blockStart + 1)
                  if (blockStart === -1) {
                    res.writeHead(404)
                    res.end(JSON.stringify({ error: `Could not find sp-drag element for editable index ${editableIndex}` }))
                    return
                  }
                }
                const blockEnd = content.indexOf('</sp-drag>', blockStart)
                if (blockEnd === -1) {
                  res.writeHead(404)
                  res.end(JSON.stringify({ error: `Could not find closing sp-drag tag for editable index ${editableIndex}` }))
                  return
                }

                const slice = content.slice(blockStart, blockEnd)

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
                  const before = content.slice(blockStart, blockEnd)
                  const after = before.replace(insertRegex, `<sp-drag${attrs} at="${newVal}"${closer}`)
                  updated = content.slice(0, blockStart) + after + content.slice(blockEnd)
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
                tagRegex.lastIndex = 0
                const sliceMatch = tagRegex.exec(slice)
                if (sliceMatch) {
                  match = sliceMatch
                  match.index = blockStart + sliceMatch.index
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
                updated = content.slice(0, blockStart) +
                  content.slice(blockStart, blockEnd).replace(before, after) +
                  content.slice(blockEnd)

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
          //console.log("WATCHING "+htmlFile)
          watch('example/', () => {
            //console.log("CHANGED "+htmlFile)
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              //console.log("NOTIFY CLIENTS", clients.length)
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