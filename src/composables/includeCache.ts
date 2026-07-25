import { ref, type Ref } from 'vue'

const cache = new Map<string, Ref<string | undefined>>()
const binaryCache = new Map<string, Ref<string | undefined>>()
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

export function getCachedInclude(src: string): Ref<string | undefined> {
  let r = cache.get(src)
  if (!r) {
    r = ref(undefined)
    cache.set(src, r)
  }
  return r
}

export function getCachedBinary(src: string): Ref<string | undefined> {
  let r = binaryCache.get(src)
  if (!r) {
    r = ref(undefined)
    binaryCache.set(src, r)
  }
  return r
}

export function preloadInclude(src: string): Promise<void> {
  if (shouldIgnore(src)) return Promise.resolve()
  const r = getCachedInclude(src)
  if (r.value !== undefined) return Promise.resolve()
  if (pending.has(src)) return pending.get(src)!

  const promise = fetch(src)
    .then(r2 => {
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`)
      return r2.text()
    })
    .then(text => {
      r.value = text
      setMeta(src, text)
      pending.delete(src)
    })
    .catch(() => {
      r.value = ''
      setMeta(src)
      pending.delete(src)
    })

  pending.set(src, promise)
  return promise
}

export function preloadBinary(src: string): Promise<void> {
  if (shouldIgnore(src)) return Promise.resolve()
  const r = getCachedBinary(src)
  if (r.value !== undefined) return Promise.resolve()
  if (pendingBinary.has(src)) return pendingBinary.get(src)!

  const promise = fetch(src)
    .then(r2 => {
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`)
      return r2.blob()
    })
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .then(dataUrl => {
      r.value = dataUrl
      setMeta(src, dataUrl)
      pendingBinary.delete(src)
    })
    .catch(() => {
      r.value = ''
      setMeta(src)
      pendingBinary.delete(src)
    })

  pendingBinary.set(src, promise)
  return promise
}

export function serializeCache(): string {
  const text: Record<string, string> = {}
  for (const [k, r] of cache) {
    if (r.value !== undefined) text[k] = r.value
  }
  const binary: Record<string, string> = {}
  for (const [k, r] of binaryCache) {
    if (r.value !== undefined) binary[k] = r.value
  }
  return JSON.stringify({ text, binary })
}

export function loadCache(json: string): void {
  const data = JSON.parse(json)
  const now = Date.now()
  if (data.text) {
    for (const [k, v] of Object.entries(data.text)) {
      getCachedInclude(k).value = v as string
      metaCache.set(k, { size: (v as string).length, timestamp: now })
    }
  } else {
    for (const [k, v] of Object.entries(data)) {
      getCachedInclude(k).value = v as string
      metaCache.set(k, { size: (v as string).length, timestamp: now })
    }
  }
  if (data.binary) {
    for (const [k, v] of Object.entries(data.binary)) {
      getCachedBinary(k).value = v as string
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

export function invalidateTextCache(): void {
  for (const r of cache.values()) r.value = undefined
  for (const [k] of cache) metaCache.delete(k)
  pending.clear()
}

export function invalidateByFilename(filename: string): void {
  const base = window.location.href
  const changedUrl = new URL(filename, base).href
  for (const [key, ref] of cache) {
    try {
      if (new URL(key, base).href === changedUrl) {
        ref.value = undefined
        metaCache.delete(key)
        pending.delete(key)
        return
      }
    } catch { /* skip unparseable keys */ }
  }
}

export function clearCache(): void {
  for (const r of cache.values()) r.value = undefined
  for (const r of binaryCache.values()) r.value = undefined
  cache.clear()
  binaryCache.clear()
  metaCache.clear()
  pending.clear()
  pendingBinary.clear()
}

export function removeCacheEntry(path: string): void {
  const r = cache.get(path)
  if (r) r.value = undefined
  const b = binaryCache.get(path)
  if (b) b.value = undefined
  metaCache.delete(path)
}
