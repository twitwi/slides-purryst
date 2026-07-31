// Shared SSE broadcaster + typst compile error state.
// Imported by both vite.config.ts and bin/sp-dev.mjs.
// vite.config.ts is loaded via loadConfigFromFile which bundles it with esbuild,
// so this module may be instantiated twice (direct import + inlined copy).
// State is backed on globalThis so both instances share it in the same process.

const STATE_KEY = '__sp_sse_state__'

const state = (globalThis[STATE_KEY] ??= {
  clients: new Set(),
  typstErrors: [],
})

const { clients, typstErrors } = state

export function sseRegisterClient(res) {
  clients.add(res)
  res.on('close', () => clients.delete(res))
}

export function sseBroadcast(event, data) {
  const frame = `event: ${event}\ndata: ${data}\n\n`
  clients.forEach((client) => {
    try { client.write(frame) } catch {}
  })
}

export function setTypstErrors(errs) {
  state.typstErrors = errs
  sseBroadcast('typst-error', JSON.stringify(errs))
}

export function getTypstErrors() {
  return state.typstErrors
}
