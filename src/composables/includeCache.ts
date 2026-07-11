const cache = new Map<string, string>()
const binaryCache = new Map<string, string>()
const pending = new Map<string, Promise<void>>()
const pendingBinary = new Map<string, Promise<void>>()

export function getCachedInclude(src: string): string | undefined {
  return cache.get(src)
}

export function getCachedBinary(src: string): string | undefined {
  return binaryCache.get(src)
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

export function preloadBinary(src: string): Promise<void> {
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
      pendingBinary.delete(src)
    })
    .catch(() => {
      binaryCache.set(src, '')
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
  if (data.text) {
    for (const [k, v] of Object.entries(data.text)) {
      cache.set(k, v as string)
    }
  } else {
    for (const [k, v] of Object.entries(data)) {
      cache.set(k, v as string)
    }
  }
  if (data.binary) {
    for (const [k, v] of Object.entries(data.binary)) {
      binaryCache.set(k, v as string)
    }
  }
}
