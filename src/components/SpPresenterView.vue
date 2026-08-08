<template>
  <div class="sp-presenter-layout" :style="presenterGridStyle">
    <div class="sp-presenter-main">
      <div class="sp-presenter-preview" ref="previewContainerEl">
        <div :style="previewScaleStyle" class="sp-slide-scaler">
          <SpSlide
            v-if="current"
            :key="currentIndex"
            :slide="current"
            :html="activeHtml"
            :components="components"
          />
        </div>
      </div>
      <div class="sp-presenter-vdivider" @mousedown="startVdividerDrag"></div>
      <div class="sp-presenter-next" :style="{ height: nextHeight + 'px' }">
        <div class="sp-presenter-next-label">Next</div>
        <div class="sp-presenter-next-slide-wrap" ref="nextContainerEl">
          <div :style="nextScaleStyle" class="sp-slide-scaler">
            <SpSlide
              v-if="nextSlideData"
              :key="'next-' + (currentIndex + 1)"
              :slide="nextSlideData"
              :html="nextHtml"
              :fixedStep="nextSlideSteps - 1"
              :components="components"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="sp-presenter-divider"
      @mousedown="startDividerDrag"
    ></div>
    <div class="sp-presenter-sidebar">
      <div class="sp-presenter-info">
        <div class="sp-presenter-num">{{ currentIndex + 1 }} <small>/ {{ total }}</small></div>
        <div class="sp-presenter-progress"><div class="sp-presenter-progress-bar" :style="{ width: progressPercent + '%' }" /></div>
        <div class="sp-presenter-clock" :title="clockTitle">
          <span class="sp-presenter-clock-time">{{ elapsedStr }}</span>
          <span v-if="clockFeedback" class="sp-presenter-clock-feedback">{{ clockFeedback }}</span>
          <span class="sp-presenter-clock-actions">
            <button class="sp-presenter-clock-btn" title="Export log (CSV)" @click="exportClockLog">⬇</button>
            <button class="sp-presenter-clock-btn" title="Reset timer" @click="resetClock">↺</button>
          </span>
        </div>
        <div v-if="blackout" class="sp-presenter-blackout-badge" @click="exitBlackout">BLACKED OUT</div>
      </div>
      <div class="sp-presenter-notes">
        <h3>Speaker Notes</h3>
        <div class="sp-presenter-notes-content" v-html="currentNotes"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { inject } from 'vue'
import type { SlideData } from '../types'
import SpSlide from './SpSlide.vue'
import { useElementScale } from '../composables/useElementScale'
import { maybeProcessed } from '../composables/useSteps'
import type { SpStorageConfig } from '../composables/useStorage'

const props = defineProps<{
  current: SlideData | null
  currentIndex: number
  total: number
  activeHtml: string
  progressPercent: number
  blackout: boolean
  exitBlackout: () => void
  components: Record<string, any>
  designWidth: number
  designHeight: number
  config: SpStorageConfig
  slides: SlideData[]
}>()

const stepIndex = inject<import('vue').Ref<number>>('stepIndex')!

const previewContainerEl = ref<HTMLElement | null>(null)
const nextContainerEl = ref<HTMLElement | null>(null)
const { transformStyle: previewScaleStyle } = useElementScale(previewContainerEl, props.designWidth, props.designHeight)
const { transformStyle: nextScaleStyle } = useElementScale(nextContainerEl, props.designWidth, props.designHeight)

const sidebarWidth = ref(280)
let dividerDragging = false

function startDividerDrag(e: MouseEvent) {
  dividerDragging = true
  document.addEventListener('mousemove', onDividerDrag)
  document.addEventListener('mouseup', stopDividerDrag)
  e.preventDefault()
}

function onDividerDrag(e: MouseEvent) {
  if (!dividerDragging) return
  const w = window.innerWidth - e.clientX
  sidebarWidth.value = Math.max(160, Math.min(600, w))
}

function stopDividerDrag() {
  dividerDragging = false
  document.removeEventListener('mousemove', onDividerDrag)
  document.removeEventListener('mouseup', stopDividerDrag)
}

const presenterGridStyle = computed(() => ({
  gridTemplateColumns: `1fr 6px ${sidebarWidth.value}px`,
}))

const nextHeight = ref(260)
let vdividerDragging = false

function startVdividerDrag(e: MouseEvent) {
  vdividerDragging = true
  document.addEventListener('mousemove', onVdividerDrag)
  document.addEventListener('mouseup', stopVdividerDrag)
  e.preventDefault()
}

function onVdividerDrag(e: MouseEvent) {
  if (!vdividerDragging) return
  const h = window.innerHeight - e.clientY
  nextHeight.value = Math.max(120, Math.min(600, h))
}

function stopVdividerDrag() {
  vdividerDragging = false
  document.removeEventListener('mousemove', onVdividerDrag)
  document.removeEventListener('mouseup', stopVdividerDrag)
}

const currentNotes = computed(() => {
  const slide = props.current
  if (!slide?.notes) return 'No notes'
  return slide.notes
})

const nextSlideData = computed(() => {
  if (props.currentIndex >= props.total - 1) return null
  return props.slides[props.currentIndex + 1] ?? null
})
const nextProcessed = computed(() => maybeProcessed(nextSlideData.value))
const nextHtml = computed(() => nextProcessed.value?.html ?? '')
const nextSlideSteps = computed(() => nextProcessed.value?.steps ?? 0)

const CLOCK_KEY = 'sp-presentation-clock'
const LOG_KEY = 'sp-presentation-log'

interface ClockLogEntry {
  slide: number
  elapsed: number
  heading?: string
  step?: number
}

function loadClock(): number {
  try {
    const raw = localStorage.getItem(CLOCK_KEY)
    return raw ? JSON.parse(raw) : Date.now()
  } catch { return Date.now() }
}

function saveClock() {
  try { localStorage.setItem(CLOCK_KEY, JSON.stringify(startTime.value)) } catch {}
}

function loadLog(): ClockLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLog() {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(clockLog.value)) } catch {}
}

const clockLog = ref<ClockLogEntry[]>(loadLog())
const startTime = ref(loadClock())
const nowTime = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | null = null

const elapsedStr = computed(() => {
  const elapsed = Math.floor((nowTime.value - startTime.value) / 1000)
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const clockTitle = computed(() => {
  const n = clockLog.value.length
  return n ? `${n} entries logged` : ''
})

function logSlideChange(index: number) {
  const s = props.slides[index]
  if (!s) return
  let heading: string | undefined
  if (s.html) {
    const d = document.createElement('div')
    d.innerHTML = s.html
    const h = d.querySelector('h1,h2,h3')
    heading = h?.textContent?.trim() || undefined
  }
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
  clockLog.value.push({ slide: index + 1, elapsed, heading })
  saveLog()
}

function logStepChange(index: number, step: number) {
  const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
  clockLog.value.push({ slide: index + 1, elapsed, step: step + 1 })
  saveLog()
}

function resetClock() {
  if (!confirm('Reset timer and clear slide log?')) return
  startTime.value = Date.now()
  nowTime.value = Date.now()
  clockLog.value = []
  saveClock()
  saveLog()
  showClockFeedback('Reset')
}

function exportClockLog() {
  const started = new Date(startTime.value)
  const startedStr = started.toLocaleString()
  const lines: string[] = ['slide,elapsed_sec,heading']
  lines.push(`0,0,"Started: ${startedStr}"`)
  for (const entry of clockLog.value) {
    const h = entry.heading ? `"${entry.heading.replace(/"/g, '""')}"` : ''
    const slideLabel = entry.step !== undefined
      ? `${entry.slide}.${String(entry.step).padStart(2, '0')}`
      : String(entry.slide)
    lines.push(`${slideLabel},${entry.elapsed},${h}`)
  }
  const text = lines.join('\n')
  navigator.clipboard.writeText(text).catch(() => {})

  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `slides-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)

  showClockFeedback('Copied + Downloaded')
}

const clockFeedback = ref('')
let clockFeedbackTimer: ReturnType<typeof setTimeout> | null = null

function showClockFeedback(msg: string) {
  clockFeedback.value = msg
  if (clockFeedbackTimer) clearTimeout(clockFeedbackTimer)
  clockFeedbackTimer = setTimeout(() => { clockFeedback.value = '' }, 1500)
}

watch(() => [stepIndex.value, props.currentIndex], ([nIdx, nStep], [oIdx, oStep]: any[]) => {
  if (nIdx !== oIdx) {
    logSlideChange(nIdx)
  } else if (props.config.logSteps && nStep !== oStep) {
    logStepChange(nIdx, nStep)
  }
})

onMounted(() => {
  startTime.value = loadClock()
  saveClock()
  nowTime.value = Date.now()
  clockTimer = setInterval(() => { nowTime.value = Date.now() }, 1000)
  logSlideChange(props.currentIndex)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  stopDividerDrag()
  stopVdividerDrag()
})
</script>
