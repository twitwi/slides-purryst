import { reactive, watch } from 'vue'

const KEY = 'sp-config'

export interface SpStorageConfig {
  navLocked: boolean
  overviewScale: number
  [key: string]: unknown
}

const defaults: SpStorageConfig = {
  navLocked: false,
  overviewScale: 0.15,
}

function load(): SpStorageConfig {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

const config = reactive<SpStorageConfig>(load())

watch(config, () => {
  try { localStorage.setItem(KEY, JSON.stringify(config)) } catch {}
}, { deep: true })

export function useStorage() {
  return config
}
