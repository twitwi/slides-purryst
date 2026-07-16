<template>
  <Teleport to="body">
    <div v-if="visible" class="sp-dev-overlay" @click.self="$emit('close')">
      <div class="sp-dev-pane">
        <div class="sp-dev-header">
          <h2 @click="onTitleClick">
            Dev Tools
            <span v-if="titleClicks > 0" class="sp-dev-title-clicks" :class="titleClickClass">{{ titleClicks }}/9</span>
          </h2>
          <button class="sp-dev-close" @click="$emit('close')" aria-label="Close">&times;</button>
        </div>

        <section class="sp-dev-section">
          <h3>Cache ({{ cacheEntries.length }} entries)</h3>
          <div v-if="cacheEntries.length === 0" class="sp-dev-empty">No cached entries</div>
          <table v-else class="sp-dev-table">
            <thead>
              <tr><th>Path</th><th>Size</th><th>Fetched</th><th>Type</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="e in cacheEntries" :key="e.path + e.type">
                <td class="sp-dev-path" :title="e.path">{{ e.path }}</td>
                <td class="sp-dev-num">{{ formatSize(e.size) }}</td>
                <td class="sp-dev-num">{{ formatTime(e.timestamp) }}</td>
                <td>{{ e.type }}</td>
                <td><button class="sp-dev-del" @click="doRemove(e.path)" title="Remove entry">&times;</button></td>
              </tr>
            </tbody>
          </table>
          <button class="sp-dev-btn" @click="doClearCache" :disabled="cacheEntries.length === 0">
            Clear Cache
          </button>
        </section>

        <section class="sp-dev-section">
          <h3>Actions</h3>
          <button class="sp-dev-btn" @click="doExport">Export Standalone</button>
          <button class="sp-dev-btn" @click="doClearStorage" :title="configContent">Clear localStorage Keys</button>
        </section>

        <details class="sp-dev-section sp-dev-config">
          <summary><h3>Config</h3></summary>
          <div class="sp-dev-config-fields">
            <label v-for="k in configKeys" :key="k.key" class="sp-dev-config-field">
              <span class="sp-dev-config-label">{{ k.key }}</span>
              <template v-if="k.type === 'choice'">
                <span class="sp-dev-choice-group">
                  <button
                    v-for="c in k.choices"
                    :key="c"
                    class="sp-dev-choice-btn"
                    :class="{ active: config[k.key] === c }"
                    @click="config[k.key] = c"
                  >{{ c }}</button>
                </span>
              </template>
              <input v-else-if="k.type === 'boolean'" type="checkbox" :checked="!!config[k.key]" @change="config[k.key] = ($event.target as HTMLInputElement).checked" />
              <input v-else-if="k.type === 'number'" type="range" :min="k.min ?? 0" :max="k.max ?? 1" :step="k.step ?? 0.01" :value="config[k.key]" @input="config[k.key] = parseFloat(($event.target as HTMLInputElement).value)" />
              <input v-else type="text" :value="config[k.key]" @input="config[k.key] = ($event.target as HTMLInputElement).value" />
            </label>
          </div>
        </details>

        <footer class="sp-dev-footer">
          <small>toolbar ◆ to open</small>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { getCacheEntries, clearCache, removeCacheEntry } from '../composables/includeCache'
import { resetConfig, useStorage } from '../composables/useStorage'

const config = useStorage()
const configContent = computed(() => {
  const c: Record<string, unknown> = {}
  for (const k of Object.keys(config)) {
    c[k] = config[k]
  }
  return JSON.stringify(c, null, 1)
})

interface ConfigField {
  key: string
  type: 'boolean' | 'number' | 'string' | 'choice'
  min?: number
  max?: number
  step?: number
  choices?: string[]
}

const configKnownTypes: Record<string, ConfigField> = {
  navLocked: { key: 'navLocked', type: 'boolean' },
  overviewScale: { key: 'overviewScale', type: 'number', min: 0.05, max: 0.5, step: 0.01 },
  proMode: { key: 'proMode', type: 'boolean' },
  logSteps: { key: 'logSteps', type: 'boolean' },
  darkMode: { key: 'darkMode', type: 'choice', choices: ['light', 'auto', 'dark'] },
}

const configKeys = computed(() => {
  return Object.keys(config).filter(k => k !== 'proMode' || config.proMode).map(k => configKnownTypes[k] ?? { key: k, type: 'string' })
})

const titleClicks = ref(0)
let titleClickTimer: ReturnType<typeof setTimeout> | null = null
const titleClickClass = computed(() => {
  const pct = titleClicks.value / 9
  if (pct >= 1) return 'done'
  if (pct > 0.66) return 'warm'
  if (pct > 0.33) return 'mid'
  return 'cool'
})

function onTitleClick() {
  titleClicks.value++
  if (titleClickTimer) clearTimeout(titleClickTimer)
  if (titleClicks.value >= 9) {
    config.proMode = true
    titleClickTimer = setTimeout(() => {
      titleClicks.value = 0
    }, 1200)
    return
  }
  titleClickTimer = setTimeout(() => {
    titleClicks.value = 0
  }, 2000)
}

const props = defineProps<{
  visible: boolean
  exportFn?: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

const cacheEntries = ref(getCacheEntries())
let refreshTimer: ReturnType<typeof setInterval> | null = null

function startRefresh() {
  stopRefresh()
  refreshTimer = setInterval(() => {
    cacheEntries.value = getCacheEntries()
  }, 1000)
}

function stopRefresh() {
  if (refreshTimer !== null) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    cacheEntries.value = getCacheEntries()
    startRefresh()
  } else {
    stopRefresh()
  }
})

onMounted(() => {
  if (props.visible) startRefresh()
})

onUnmounted(stopRefresh)

function doClearCache() {
  clearCache()
  cacheEntries.value = getCacheEntries()
}

function doRemove(path: string) {
  removeCacheEntry(path)
  cacheEntries.value = getCacheEntries()
}

function doExport() {
  props.exportFn?.()
}

function doClearStorage() {
  resetConfig()
}

function shortPath(p: string): string {
  const u = new URL(p, window.location.href)
  let path = u.pathname
  if (path.length > 50) path = '…' + path.slice(-48)
  return path + u.search + u.hash
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatTime(ts: number): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleTimeString() + ' ' + d.toLocaleDateString()
}
</script>
