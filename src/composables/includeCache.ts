const cache = new Map<string, string>()
const pending = new Map<string, Promise<void>>()

export function getCachedInclude(src: string): string | undefined {
  return cache.get(src)
}

export function preloadInclude(src: string): Promise<void> {
  if (cache.has(src)) return Promise.resolve()
  if (pending.has(src)) return pending.get(src)!

  const promise = fetch(src)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.text()
    })
    .then(text => {
      cache.set(src, text)
      pending.delete(src)
    })
    .catch(() => {
      cache.set(src, '')
      pending.delete(src)
    })

  pending.set(src, promise)
  return promise
}

export function serializeCache(): string {
  return JSON.stringify(Object.fromEntries(cache))
}

export function loadCache(json: string): void {
  const data = JSON.parse(json)
  for (const [k, v] of Object.entries(data)) {
    cache.set(k, v as string)
  }
}
