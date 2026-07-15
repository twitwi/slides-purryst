<template>
  <div class="sp-presentation" :class="{ 'sp-presenter-mode': presenter }" :style="rootStyle">
    <!-- === MAIN (non-presenter) LAYOUT === -->
    <template v-if="!presenter">
      <div class="sp-viewport" :style="containerStyle" ref="viewportEl">
        <div class="sp-scale-wrap" :style="transformStyle">
          <div class="sp-global-top">
            <slot name="global-top" />
          </div>
          <div :class="transitionClass" ref="transitionWrapEl">
            <SpSlide
              v-if="preloadPrevSlideData"
              class="sp-slide-prev"
              :key="currentIndex - 1"
              :slide="preloadPrevSlideData"
              :html="preloadPrevHtml"
              :fixedStep="computeSlideSteps(preloadPrevSlideData) - 1"
              :components="props.components"
            />
            <SpSlide
              v-if="current"
              class="sp-slide-current"
              :key="currentIndex"
              :slide="current"
              :html="activeHtml"
              :components="props.components"
            />
            <SpSlide
              v-if="preloadNextSlideData"
              class="sp-slide-next"
              :key="currentIndex + 1"
              :slide="preloadNextSlideData"
              :html="preloadNextHtml"
              :fixedStep="0"
              :components="props.components"
            />
          </div>

          <div class="sp-global-bottom">
            <slot name="global-bottom">
              <footer class="sp-slide-footer">
                <span>{{ currentIndex + 1 }} / {{ effectiveTotal }}</span>
                <span>{{ author }}</span>
              </footer>
            </slot>
          </div>

        </div>
      </div>

      <nav class="sp-nav" :class="{ locked: navLocked }">
        <div class="sp-nav-bar">
          <button class="sp-nav-btn sp-nav-lock" :class="{ locked: navLocked }" :title="navLocked ? 'Unlock nav' : 'Lock nav visible'" @click="navLocked = !navLocked">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="5" width="8" height="7" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/>
              <path d="M4.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="currentColor" stroke-width="1.2" fill="none"/>
            </svg>
          </button>
          <button class="sp-nav-btn" :disabled="isFirst && isFirstStep" aria-label="Previous" @click="prevSlide">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <span class="sp-nav-counter" @click="onGoPrompt">{{ currentIndex + 1 }} / {{ effectiveTotal }}</span>
          <button class="sp-nav-btn" :disabled="isLast && isLastStep" aria-label="Next" @click="nextSlide">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="sp-nav-btn sp-fullscreen-btn" aria-label="Toggle fullscreen" title="Fullscreen (F)" @click="toggleFullscreen">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3h3M3 13h3M13 3h-3M13 13h-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M3 6v4M13 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="sp-nav-btn" :class="{ active: presenterActive }" aria-label="Toggle presenter" title="Presenter (P)" @click="togglePresenter">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.3" fill="none"/>
            <rect x="5" y="6" width="6" height="4" rx=".5" stroke="currentColor" stroke-width="1" fill="none"/>
            <path d="M6 13v1h4v-1" stroke="currentColor" stroke-width="1.3" fill="none"/>
          </svg>
          </button>
          <button class="sp-nav-btn sp-nav-dev" aria-label="Dev tools" title="Dev Tools" @click="toggleDevPane">◆</button>
        </div>
        <div class="sp-nav-pills">
          <template v-for="pill in visiblePills" :key="pill.type === 'pill' ? 'p' + pill.index : pill.id">
            <span v-if="pill.type === 'ellipsis'" class="sp-nav-pill-ellipsis">…</span>
            <button
              v-else
              class="sp-nav-pill"
              :class="{
                active: pill.index === currentIndex,
                'sp-nav-pill-h1': slideHeadingLevels[pill.index] === 1,
                'sp-nav-pill-h2': slideHeadingLevels[pill.index] === 2,
                'sp-nav-pill-h3': slideHeadingLevels[pill.index] === 3,
              }"
              @click="goTo(pill.index); stepIndex = 0"
              :aria-label="'Go to slide ' + (pill.index + 1)"
            ></button>
          </template>
        </div>
      </nav>

      <div class="sp-progress">
        <div class="sp-progress-bar" :style="{ width: progressPercent + '%' }" />
      </div>

      <div v-if="showOverview" class="sp-overview" @click.self="showOverview = false">
        <div class="sp-overview-grid" ref="overviewGridEl">
          <div
            v-for="(slide, i) in slides"
            :key="i"
            class="sp-overview-thumb"
            :class="{ active: i === currentIndex }"
            @click="goToOverviewSlide(i)"
          >
            <div class="sp-overview-thumb-stage">
              <div :style="overviewScaleStyle">
                <SpSlide
                  :slide="slide"
                  :html="overviewHtmls[i]"
                  :components="props.components"
                />
              </div>
            </div>
            <div class="sp-overview-thumb-num">{{ i + 1 }}</div>
          </div>
        </div>
      </div>

      <SpDevPane :visible="showDevPane" :export-fn="spApi.export" @close="showDevPane = false" />

      <div v-if="showGoPrompt" class="sp-go-prompt" @click.self="closeGoPrompt">
        <div class="sp-go-prompt-box">
          <input
            ref="goPromptInput"
            v-model="goPromptValue"
            class="sp-go-prompt-input"
            placeholder="slide number or search text…"
            @keydown.enter="handleGoSubmit"
            @keydown.escape="closeGoPrompt"
            @keydown.down.prevent="selectNext"
            @keydown.up.prevent="selectPrev"
          />
          <div v-if="goPromptResults.length" class="sp-go-results">
            <div
              v-for="(r, i) in goPromptResults"
              :key="r.index"
              class="sp-go-result"
              :class="{ focused: i === goPromptFocused }"
              @click="goToResult(r.index)"
              @mouseenter="goPromptFocused = i"
            >
              <div class="sp-go-result-thumb">
                <div :style="goResultScaleStyle">
                  <SpSlide
                    :slide="slides[r.index]"
                    :html="overviewHtmls[r.index]"
                    :components="props.components"
                  />
                </div>
              </div>
              <div class="sp-go-result-text">
                <div class="sp-go-result-num">Slide {{ r.index + 1 }}</div>
                <div v-for="(t, ti) in r.matches" :key="ti" class="sp-go-result-heading" v-html="highlight(t)"></div>
              </div>
            </div>
          </div>
          <div v-else-if="goPromptValue && !/^\d*$/.test(goPromptValue)" class="sp-go-no-results">
            No slides match "{{ goPromptValue }}"
          </div>
        </div>
      </div>
    </template>

    <!-- === PRESENTER LAYOUT === -->
    <template v-else>
      <div class="sp-presenter-layout" :style="presenterGridStyle">
        <div class="sp-presenter-main">
          <div class="sp-presenter-preview" ref="previewContainerEl">
            <div :style="previewScaleStyle" class="sp-slide-scaler">
              <SpSlide
                v-if="current"
                :key="currentIndex"
                :slide="current"
                :html="activeHtml"
                :components="props.components"
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
                  :components="props.components"
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
          </div>
          <div class="sp-presenter-notes">
            <h3>Speaker Notes</h3>
            <div class="sp-presenter-notes-content" v-html="currentNotes"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted, provide, onUnmounted, onUpdated, nextTick } from 'vue'
import type { SlideData } from '../types'
import { useSlides, parseElementToSlides } from '../composables/useSlides'
import { useSteps, buildSteps as computeSlideSteps } from '../composables/useSteps'
import { scanVisibility } from '../composables/useVisibility'
import { useNavigation } from '../composables/useNavigation'
import { usePresenter } from '../composables/usePresenter'
import { useScale } from '../composables/useScale'
import { useElementScale } from '../composables/useElementScale'
import SpSlide from './SpSlide.vue'
import SpDevPane from './SpDevPane.vue'
import { spApi } from '../sp-api'
import { exportStandalone } from '../export'
import { highlightCode } from '../composables/useCodeHighlight'

const props = withDefaults(defineProps<{
  slides: SlideData[]
  transition?: string
  transitionDuration?: number
  presenter?: boolean
  designWidth?: number
  designHeight?: number
  author?: string
  components?: Record<string, any>
  seed?: number
}>(), {
  transition: 'none',
  transitionDuration: 200,
  presenter: false,
  designWidth: 1920,
  designHeight: 1080,
  author: '',
  components: () => ({}),
  seed: 12345678,
})

const {
  slides,
  currentIndex,
  current,
  total,
  goTo,
  next,
  prev,
  setSlides
} = useSlides(props.slides)

const {
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  prevStep,
  buildSteps,
  processHtml
} = useSteps()

let skipStepReset = false
const contentVersion = ref(0)

const { openPresenterWindow, closePresenter, presenterActive, syncState, channel } = usePresenter()

const { transformStyle, containerStyle } = useScale(props.designWidth, props.designHeight)

const viewportEl = ref<HTMLElement | null>(null)
const transitionWrapEl = ref<HTMLElement | null>(null)

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

provide('stepIndex', stepIndex)
provide('slideIndex', currentIndex)
provide('contentVersion', contentVersion)
provide('slides', slides)
provide('goTo', goTo)

const direction = ref(1)
const shouldSwap = ref(false)

watch(currentIndex, (n, o) => {
  if (n !== o) {
    direction.value = n > o ? 1 : -1
    shouldSwap.value = true
  }
})

const effectiveTransition = computed(() => {
  const t = current.value?.transition ?? props.transition
  return t === '' ? 'none' : t
})

const transitionClass = computed(() => {
  const base = `sp-${effectiveTransition.value}`
  return effectiveTransition.value === 'none' ? base : `${base} sp-dir-${direction.value === 1 ? 'forward' : 'backward'}`
})

const effectiveTransitionDuration = computed(() =>
  effectiveTransition.value === 'none' ? 0 :
  current.value?.transitionDuration ?? props.transitionDuration
)

const rootStyle = computed(() => ({
  '--sp-design-width': `${props.designWidth}px`,
  '--sp-design-height': `${props.designHeight}px`,
  '--sp-transition-duration': `${effectiveTransitionDuration.value}ms`
}))

onUpdated(() => {
  if (effectiveTransition.value === 'none' || !shouldSwap.value || !transitionWrapEl.value) return
  shouldSwap.value = false
  transitionWrapEl.value.classList.add('sp-swapping')
  transitionWrapEl.value.offsetHeight // force reflow
  transitionWrapEl.value.classList.remove('sp-swapping')
})

const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === total.value - 1)

const progressPercent = computed(() => {
  if (total.value === 0) return 0
  return ((currentIndex.value + 1) / total.value) * 100
})

type PillItem = { type: 'pill'; index: number } | { type: 'ellipsis'; id: string }

const visiblePills = computed<PillItem[]>(() => {
  const n = effectiveTotal.value
  if (n <= 20) {
    return Array.from({ length: n }, (_, i) => ({ type: 'pill' as const, index: i }))
  }
  const items: PillItem[] = []
  const cur = currentIndex.value
  const head = 3
  const tail = 3
  const windowBefore = 2
  const windowAfter = 2
  const windowStart = Math.max(head, cur - windowBefore)
  const windowEnd = Math.min(n - 1 - tail, cur + windowAfter)

  for (let i = 0; i < head; i++) items.push({ type: 'pill', index: i })
  if (windowStart > head) items.push({ type: 'ellipsis', id: 'pre' })
  for (let i = windowStart; i <= windowEnd; i++) items.push({ type: 'pill', index: i })
  if (windowEnd < n - 1 - tail) items.push({ type: 'ellipsis', id: 'post' })
  for (let i = n - tail; i < n; i++) items.push({ type: 'pill', index: i })

  return items
})

const fakeEndIndices = computed(() => {
  const indices = slides.value
    .map((s, i) => s.fakeEnd ? i : -1)
    .filter(i => i >= 0)
  const realLast = total.value - 1
  if (realLast >= 0 && !indices.includes(realLast)) indices.push(realLast)
  return indices.sort((a, b) => a - b)
})

const effectiveLast = computed(() =>
  fakeEndIndices.value.find(i => i >= currentIndex.value) ?? total.value - 1
)

const effectiveTotal = computed(() => effectiveLast.value + 1)

const activeHtml = computed(() => {
  const slide = current.value
  if (!slide) return ''
  return processHtml(slide.html, stepIndex.value)
})

const currentNotes = computed(() => {
  const slide = current.value
  if (!slide?.notes) return 'No notes'
  return slide.notes
})

const nextSlideData = computed(() => {
  if (currentIndex.value >= total.value - 1) return null
  return slides.value[currentIndex.value + 1] ?? null
})

const nextHtml = computed(() => {
  if (!nextSlideData.value) return ''
  const steps = computeSlideSteps(nextSlideData.value)
  return processHtml(nextSlideData.value.html, Math.max(0, steps - 1))
})

function nextSlide() {
  if (!isLastStep.value) {
    nextStep()
  } else if (currentIndex.value < total.value - 1) {
    next()
  }
}

function prevSlide() {
  if (!isFirstStep.value) {
    prevStep()
  } else if (currentIndex.value > 0) {
    prev()
  }
}


const preloadPrevSlideData = computed(() => {
  if (currentIndex.value === 0) return null
  return slides.value[currentIndex.value - 1] ?? null
})

const preloadPrevHtml = computed(() => {
  if (!preloadPrevSlideData.value) return ''
  const steps = computeSlideSteps(preloadPrevSlideData.value)
  return processHtml(preloadPrevSlideData.value.html, Math.max(0, steps - 1))
})

const preloadNextSlideData = computed(() => {
  if (currentIndex.value >= total.value - 1) return null
  return slides.value[currentIndex.value + 1] ?? null
})

const preloadNextHtml = computed(() => {
  if (!preloadNextSlideData.value) return ''
  return processHtml(preloadNextSlideData.value.html, 0)
})


function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function togglePresenter() {
  if (presenterActive.value) {
    closePresenter()
  } else {
    openPresenterWindow()
  }
}

const showOverview = ref(false)
const showDevPane = ref(false)
const navLocked = ref(false)
try { navLocked.value = localStorage.getItem('sp-nav-locked') === 'true' } catch {}

watch(navLocked, v => {
  try { localStorage.setItem('sp-nav-locked', v ? 'true' : 'false') } catch {}
})

watchEffect(() => {
  spApi.navLocked = navLocked.value
  spApi.currentIndex = currentIndex.value
  spApi.stepIndex = stepIndex.value
  spApi.total = total.value
  spApi.effectiveLast = effectiveLast.value
  spApi.effectiveTotal = effectiveTotal.value
  spApi.fakeEndIndices = fakeEndIndices.value
})
spApi.toggleNavLock = () => { navLocked.value = !navLocked.value }
spApi.goTo = goTo
spApi.next = next
spApi.prev = prev
spApi.nextSlide = nextSlide
spApi.prevSlide = prevSlide
spApi.export = exportStandalone

const overviewScale = ref(0.15)
const overviewGridEl = ref<HTMLElement | null>(null)
let overviewObserver: ResizeObserver | null = null

const overviewScaleStyle = computed(() => ({
  transform: `scale(${overviewScale.value})`,
  transformOrigin: 'top left',
  width: props.designWidth + 'px',
  height: props.designHeight + 'px',
}))

const overviewHtmls = computed(() => {
  return slides.value.map(s => {
    const steps = computeSlideSteps(s)
    return processHtml(s.html, Math.max(0, steps - 1))
  })
})

function setupOverviewObserver() {
  overviewObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const grid = entry.target as HTMLElement
      const first = grid.firstElementChild as HTMLElement | null
      if (first) {
        overviewScale.value = first.clientWidth / props.designWidth
      }
    }
  })
  if (overviewGridEl.value) {
    overviewObserver.observe(overviewGridEl.value)
  }
}

function teardownOverviewObserver() {
  overviewObserver?.disconnect()
  overviewObserver = null
}

watch(showOverview, (v) => {
  if (v) {
    requestAnimationFrame(() => setupOverviewObserver())
  } else {
    teardownOverviewObserver()
  }
})

function goToOverviewSlide(i: number) {
  showOverview.value = false
  goTo(i)
  stepIndex.value = 0
}

const showGoPrompt = ref(false)
const goPromptValue = ref('')
const goPromptFocused = ref(0)
const goPromptInput = ref<HTMLInputElement | null>(null)

interface SlideHeading {
  index: number
  texts: string[]
}

interface GoResult {
  index: number
  matches: string[]
}

const slideSearchIndex = computed<SlideHeading[]>(() => {
  return slides.value.map((s, i) => {
    const d = document.createElement('div')
    d.innerHTML = s.html
    const texts: string[] = []
    d.querySelectorAll('h1,h2,h3').forEach(el => {
      const t = el.textContent?.trim()
      if (t) texts.push(t)
    })
    return { index: i, texts }
  })
})

const slideHeadingLevels = computed(() => {
  return slides.value.map(s => {
    const d = document.createElement('div')
    d.innerHTML = s.html
    const h = d.querySelector('h1,h2,h3')
    if (!h) return 0
    return parseInt(h.tagName[1])
  })
})

const goPromptResults = computed<GoResult[]>(() => {
  const val = goPromptValue.value.trim().toLowerCase()
  if (!val || /^\d+$/.test(val)) return []
  const results: GoResult[] = []
  for (const entry of slideSearchIndex.value) {
    const matches: string[] = []
    for (const t of entry.texts) {
      if (t.toLowerCase().includes(val)) {
        matches.push(t)
      }
    }
    if (matches.length) {
      results.push({ index: entry.index, matches })
    }
  }
  return results
})

watch(goPromptResults, () => { goPromptFocused.value = 0 })

const goResultScaleStyle = computed(() => {
  const s = 210 / props.designWidth
  return {
    transform: `scale(${s})`,
    transformOrigin: 'top left',
    width: props.designWidth + 'px',
    height: props.designHeight + 'px',
  }
})

function highlight(text: string): string {
  const q = goPromptValue.value.trim()
  if (!q) return escapeHtml(text)
  const lower = text.toLowerCase()
  const qLower = q.toLowerCase()
  const parts: string[] = []
  let pos = 0
  while (pos < text.length) {
    const idx = lower.indexOf(qLower, pos)
    if (idx === -1) {
      parts.push(escapeHtml(text.slice(pos)))
      break
    }
    parts.push(escapeHtml(text.slice(pos, idx)))
    parts.push('<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>')
    pos = idx + q.length
  }
  return parts.join('')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function selectNext() {
  if (goPromptFocused.value < goPromptResults.value.length - 1) {
    goPromptFocused.value++
  }
}

function selectPrev() {
  if (goPromptFocused.value > 0) {
    goPromptFocused.value--
  }
}

function onGoPrompt() {
  showGoPrompt.value = true
  goPromptValue.value = ''
  goPromptFocused.value = 0
  requestAnimationFrame(() => goPromptInput.value?.focus())
}

function handleGoSubmit() {
  const val = goPromptValue.value.trim()
  if (!val) return

  if (/^\d+$/.test(val)) {
    const num = parseInt(val, 10)
    if (num >= 1 && num <= total.value) {
      showGoPrompt.value = false
      goTo(num - 1)
      stepIndex.value = 0
    }
    return
  }

  if (goPromptResults.value.length > 0) {
    const idx = goPromptResults.value[goPromptFocused.value]?.index ?? goPromptResults.value[0].index
    showGoPrompt.value = false
    goTo(idx)
    stepIndex.value = 0
  }
}

function goToResult(idx: number) {
  showGoPrompt.value = false
  goTo(idx)
  stepIndex.value = 0
}

function closeGoPrompt() {
  showGoPrompt.value = false
  goPromptValue.value = ''
  goPromptFocused.value = 0
}

watch(current, (slide, old) => {
  buildSteps(slide)
  if (old?.num !== slide?.num) {
    if (skipStepReset) {
      stepIndex.value = Math.min(Math.max(stepIndex.value, 0), Math.max(0, totalSteps.value - 1))
      skipStepReset = false
    } else if (direction.value === -1) {
      stepIndex.value = Math.max(0, totalSteps.value - 1)
    } else {
      stepIndex.value = 0
    }
  }
})

const isBroadcasting = ref(false)

watch([currentIndex, stepIndex], () => {
  if (isBroadcasting.value) return
  syncState(currentIndex.value, stepIndex.value)
}, { flush: 'post' })


function doScanVisibility() {
  if (viewportEl.value === null) return
  function maybe(sel: string, index: number) {
    const el = viewportEl.value?.querySelector('.sp-slide-'+sel)
    if (el) scanVisibility(el as HTMLElement, index)
  }
  maybe('current', stepIndex.value)
  maybe('next', 0)
  maybe('prev', 999999)
}

watch(() => [stepIndex.value, currentIndex.value], () => {
  nextTick(() => {
    doScanVisibility()
  })
})

watch(contentVersion, () => {
  nextTick(() => {
    doScanVisibility()
  })
})

watch([currentIndex, stepIndex], () => {
  if (!props.presenter) {
    syncUrl()
  }
}, { flush: 'post' })



function syncUrl() {
  const hash = `#${currentIndex.value}/${stepIndex.value}`
  history.replaceState(null, '', hash)
}

function parseHash() {
  const m = location.hash.match(/^#(\d+)(?:\/(\d+))?$/)
  if (!m) return
  const slideIdx = parseInt(m[1], 10)
  const step = m[2] !== undefined ? parseInt(m[2], 10) : 0
  if (slideIdx >= 0 && slideIdx < total.value) {
    if (slideIdx !== currentIndex.value) {
      skipStepReset = true
    }
    goTo(slideIdx)
    stepIndex.value = step
  }
}

function onHashChange() {
  parseHash()
}

if (channel) {
  channel.addEventListener('message', (e: MessageEvent) => {
    if (e.data?.type === 'sync') {
      isBroadcasting.value = true
      if (e.data.slide !== currentIndex.value) {
        skipStepReset = true
      }
      goTo(e.data.slide)
      stepIndex.value = e.data.step
      nextTick(() => { isBroadcasting.value = false })
    }
    if (e.data?.type === 'presenter-ready') {
      syncState(currentIndex.value, stepIndex.value)
    }
    if (e.data?.type === 'presenter-close') {
      closePresenter()
    }
  })
  if (props.presenter) {
    channel.postMessage({ type: 'presenter-ready' })
    window.addEventListener('beforeunload', () => {
      channel?.postMessage({ type: 'presenter-close' })
    })
  }
}

useNavigation({
  next: nextSlide,
  prev: prevSlide,
  goTo: goTo,
  currentIndex,
  current,
  total,
  nextStep,
  prevStep,
  stepIndex,
  totalSteps,
  isLastStep,
  isFirstStep,
  onPresenterToggle: togglePresenter,
  onOverviewToggle: () => showOverview.value = !showOverview.value,
  onGoPrompt,
})

onMounted(() => {
  if (current.value) {
    buildSteps(current.value)
  }
  doScanVisibility()
  if (!props.presenter) {
    parseHash()
    nextTick(() => syncUrl())
    window.addEventListener('hashchange', onHashChange)
  }
  setupIconIfNone(props.seed)
  highlightAllSlides()
})

function setupIconIfNone(seed: number) {
  if (document.head.querySelectorAll('link[rel=icon]').length == 0) {
    const [ch, dx, dy, xScale, yScale] = ['🐯', -20, 14, -0.85, 1]
    const hue = (180 + (seed - 12345678)) % 360
    const l = document.createElement('link')
    l.setAttribute('rel', 'icon')
    l.setAttribute('type', 'image/svg+xml')
    l.setAttribute('href', `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:hue-rotate(${hue}deg)'%20viewBox='0%200%2016%2016'%3E%3Ctext%20transform='scale(${xScale},${yScale})'%20x='${dx}'%20y='${dy}'%3E${ch}%3C/text%3E%3C/svg%3E`)
    document.head.append(l)
  }
}

async function highlightAllSlides() {
  for (let i = 0; i < slides.value.length; i++) {
    const s = slides.value[i]
    const highlighted = await highlightCode(s.html)
    if (highlighted !== s.html) {
      slides.value[i] = { ...s, html: highlighted }
    }
  }
}

onUnmounted(() => {
  channel?.close()
  stopDividerDrag()
  stopVdividerDrag()
  window.removeEventListener('hashchange', onHashChange)
})

function toggleDevPane() {
  showDevPane.value = !showDevPane.value
}

function updateSlides(templateHtml: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = templateHtml
  const newSlides = parseElementToSlides(tmp)
  if (newSlides.length === 0) return
  const oldIdx = currentIndex.value
  const oldStep = stepIndex.value
  const idx = Math.min(oldIdx, newSlides.length - 1)
  skipStepReset = true
  setSlides(newSlides)
  currentIndex.value = idx
  buildSteps(current.value)
  if (idx === oldIdx) {
    stepIndex.value = Math.min(oldStep, totalSteps.value - 1)
  } else {
    stepIndex.value = 0
  }
  //parseHash()
}

defineExpose({ updateSlides })
</script>