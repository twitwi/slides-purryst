const cache = new Map<string, string>()
const binaryCache = new Map<string, string>()
const pending = new Map<string, Promise<void>>()
const pendingBinary = new Map<string, Promise<void>>()
let ignorePatterns: RegExp[] = []

export function setCacheIgnore(patterns: string[]) {
  ignorePatterns = patterns.map(p => new RegExp(p))
}

function shouldIgnore(src: string): boolean {
  return ignorePatterns.some(re => re.test(src))
}

interface CacheMeta {
  size: number
  timestamp: number
}
const metaCache = new Map<string, CacheMeta>()

function setMeta(src: string, text?: string): void {
  metaCache.set(src, { size: text ? text.length : 0, timestamp: Date.now() })
}

export function getCachedInclude(src: string): string | undefined {
  return cache.get(src)
}

export function getCachedBinary(src: string): string | undefined {
  return binaryCache.get(src)
}

export function preloadInclude(src: string): Promise<void> {
  if (shouldIgnore(src)) return Promise.resolve()
  if (cache.has(src)) return Promise.resolve()
  if (pending.has(src)) return pending.get(src)!

  const promise = fetch(src)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.text()
    })
    .then(text => {
      cache.set(src, text)
      setMeta(src, text)
      pending.delete(src)
    })
    .catch(() => {
      cache.set(src, '')
      setMeta(src)
      pending.delete(src)
    })

  pending.set(src, promise)
  return promise
}

export function preloadBinary(src: string): Promise<void> {
  if (shouldIgnore(src)) return Promise.resolve()
  if (binaryCache.has(src)) return Promise.resolve()
  if (pendingBinary.has(src)) return pendingBinary.get(src)!

  const promise = fetch(src)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.blob()
    })
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .then(dataUrl => {
      binaryCache.set(src, dataUrl)
      setMeta(src, dataUrl)
      pendingBinary.delete(src)
    })
    .catch(() => {
      binaryCache.set(src, '')
      setMeta(src)
      pendingBinary.delete(src)
    })

  pendingBinary.set(src, promise)
  return promise
}

export function serializeCache(): string {
  return JSON.stringify({
    text: Object.fromEntries(cache),
    binary: Object.fromEntries(binaryCache),
  })
}

export function loadCache(json: string): void {
  const data = JSON.parse(json)
  const now = Date.now()
  if (data.text) {
    for (const [k, v] of Object.entries(data.text)) {
      cache.set(k, v as string)
      metaCache.set(k, { size: (v as string).length, timestamp: now })
    }
  } else {
    for (const [k, v] of Object.entries(data)) {
      cache.set(k, v as string)
      metaCache.set(k, { size: (v as string).length, timestamp: now })
    }
  }
  if (data.binary) {
    for (const [k, v] of Object.entries(data.binary)) {
      binaryCache.set(k, v as string)
      metaCache.set(k, { size: (v as string).length, timestamp: now })
    }
  }
}

export interface CacheEntry {
  path: string
  size: number
  timestamp: number
  type: 'text' | 'binary'
}

export function getCacheEntries(): CacheEntry[] {
  const entries: CacheEntry[] = []
  for (const [k] of cache) {
    const m = metaCache.get(k)
    entries.push({ path: k, size: m?.size ?? 0, timestamp: m?.timestamp ?? 0, type: 'text' })
  }
  for (const [k] of binaryCache) {
    const m = metaCache.get(k)
    entries.push({ path: k, size: m?.size ?? 0, timestamp: m?.timestamp ?? 0, type: 'binary' })
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

export function clearCache(): void {
  cache.clear()
  binaryCache.clear()
  metaCache.clear()
}

export function removeCacheEntry(path: string): void {
  cache.delete(path)
  binaryCache.delete(path)
  metaCache.delete(path)
}
