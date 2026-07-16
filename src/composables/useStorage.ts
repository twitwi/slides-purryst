import { reactive, watch } from 'vue'

const KEY = 'sp-config'

export interface SpStorageConfig {
  navLocked: boolean
  overviewScale: number
  proMode: boolean
  logSteps: boolean
  darkMode: 'auto' | 'light' | 'dark'
  [key: string]: unknown
}

const defaults: SpStorageConfig = {
  navLocked: false,
  overviewScale: 0.15,
  proMode: false,
  logSteps: false,
  darkMode: 'light',
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

export function resetConfig() {
  for (const key of Object.keys(config)) {
    if (key in defaults) {
      config[key] = defaults[key as keyof SpStorageConfig]
    } else {
      delete config[key]
    }
  }
}
