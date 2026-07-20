<template>
  <div class="sp-presentation" :class="{ 'sp-presenter-mode': presenter }" :style="rootStyle">
    <span style="display: none" :data-source-file-push="dataSourceFile"></span>
    <div v-if="props.raw?.before" v-html="props.raw.before" style="display: contents" class="sp-raw-before"></div>
    <!-- === MAIN (non-presenter) LAYOUT === -->
    <template v-if="!presenter">
      <div v-if="loading" class="sp-loading">
        <div class="sp-loading-text">Loading…</div>
      </div>
      <div v-show="!loading" class="sp-viewport" :style="containerStyle" ref="viewportEl">
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

      <nav class="sp-nav" :class="{ locked: config.navLocked }">
        <div class="sp-nav-bar">
          <button class="sp-nav-btn sp-nav-lock" :class="{ locked: config.navLocked }" :title="config.navLocked ? 'Unlock nav' : 'Lock nav visible'" @click="config.navLocked = !config.navLocked">
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
          <div class="sp-nav-more" ref="moreMenuEl">
            <button class="sp-nav-btn sp-nav-more-btn" :class="{ active: showMoreMenu }" aria-label="More options" title="More…" @click="showMoreMenu = !showMoreMenu">⋯</button>
            <div v-if="showMoreMenu" class="sp-nav-more-menu">
              <button class="sp-nav-more-item" @click="toggleDarkMode(); showMoreMenu = false">
                <span class="sp-nav-more-icon">{{ darkModeIcon }}</span> {{ darkModeLabel }}
              </button>
              <div class="sp-nav-more-divider"></div>
              <button class="sp-nav-more-item" @click="toggleDevPane(); showMoreMenu = false">
                <span class="sp-nav-more-icon">◇</span> Dev tools
              </button>
              <button class="sp-nav-more-item" @click="showOverview = !showOverview; showMoreMenu = false">
                <span class="sp-nav-more-icon">⊞</span> Overview
              </button>
              <div class="sp-nav-more-divider"></div>
              <button class="sp-nav-more-item" @click="toggleBlackout()">
                <span class="sp-nav-more-icon sp-nav-more-icon-blackout" :class="{ active: blackout }">●</span> Blackout
              </button>
              <div class="sp-nav-more-item sp-nav-more-browse">
                <button class="sp-nav-more-browse-btn" title="End of previous slide (A)" @click="goToEndOfPrev()">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M4 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
                <button class="sp-nav-more-browse-btn" title="End of next slide (Z)" @click="goToNextEnd()">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 13l5-5-5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M12 13V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
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

      <div v-if="blackout" class="sp-main-blackout" @click="blackout = false">
        <span class="sp-main-blackout-hint">click to dismiss</span>
      </div>

    </template>

    <!-- === PRESENTER LAYOUT === -->
    <template v-else>
      <SpPresenterView
        :current="current"
        :currentIndex="currentIndex"
        :total="total"
        :activeHtml="activeHtml"
        :components="props.components"
        :progressPercent="progressPercent"
        :blackout="blackout"
        :exitBlackout="exitBlackout"
        :designWidth="props.designWidth"
        :designHeight="props.designHeight"
        :config="config"
        :slides="slides"
        :computeSlideSteps="computeSlideSteps"
      />
    </template>

    <!-- === SHARED OVERLAYS (both modes) === -->
    <SpOverview
      v-if="showOverview"
      :slides="slides"
      :currentIndex="currentIndex"
      :slideHeadingLevels="slideHeadingLevels"
      :overviewHtmls="overviewHtmls"
      :overviewThumbStyle="overviewThumbStyle"
      :overviewSlideStyle="overviewSlideStyle"
      :components="props.components"
      @close="showOverview = false"
      @select="goToOverviewSlide"
    />

    <SpDevPane :visible="showDevPane" :export-fn="spApi.export" @close="showDevPane = false" />

    <SpGoPrompt
      v-if="showGoPrompt"
      :slides="slides"
      :overviewHtmls="overviewHtmls"
      :designWidth="props.designWidth"
      :designHeight="props.designHeight"
      :components="props.components"
      :total="total"
      @close="closeGoPrompt"
      @select="goToResult"
    />
    <div v-if="props.raw?.after" v-html="props.raw.after" style="display: contents" class="sp-raw-after"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted, provide, onUnmounted, onUpdated, nextTick } from 'vue'
import type { SlideData } from '../types'
import { useSlides, parseElementToSlides } from '../composables/useSlides'
import { useSteps, buildSteps as computeSlideSteps } from '../composables/useSteps'

import { useNavigation } from '../composables/useNavigation'
import { usePresenter } from '../composables/usePresenter'
import { useScale } from '../composables/useScale'
import { useStorage } from '../composables/useStorage'
import SpSlide from './SpSlide.vue'
import SpDevPane from './SpDevPane.vue'
import SpPresenterView from './SpPresenterView.vue'
import SpOverview from './SpOverview.vue'
import SpGoPrompt from './SpGoPrompt.vue'
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
  raw?: Record<'before'|'after', string>
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
let targetStepIndex: number | null = null
const contentVersion = ref(0)

const { openPresenterWindow, closePresenter, presenterActive, syncState, syncBlackout, send, onMessage, channel } = usePresenter()

const { transformStyle, containerStyle } = useScale(props.designWidth, props.designHeight)

const viewportEl = ref<HTMLElement | null>(null)
const transitionWrapEl = ref<HTMLElement | null>(null)

provide('stepIndex', stepIndex)
provide('slideIndex', currentIndex)
provide('contentVersion', contentVersion)
provide('slides', slides)
provide('goTo', goTo)

const direction = ref(1)
const shouldSwap = ref(false)
const dataSourceFile = computed(() => window.location.pathname)

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
  const base = 5
  const head = base
  const tail = base
  const windowBefore = base
  const windowAfter = base
  const nFull = head+tail+1+windowBefore+windowAfter+2

  const n = effectiveTotal.value
  if (n <= nFull) {
    return Array.from({ length: n }, (_, i) => ({ type: 'pill' as const, index: i }))
  }
  const items: PillItem[] = []
  const cur = currentIndex.value
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

const config = useStorage()
spApi.config = config
const showOverview = ref(false)
const showDevPane = ref(false)
const blackout = ref(false)
const loading = ref(true)
const showMoreMenu = ref(false)
const moreMenuEl = ref<HTMLElement | null>(null)

function applyDarkMode(mode: 'auto' | 'light' | 'dark') {
  const el = document.documentElement
  if (mode === 'auto') {
    el.removeAttribute('data-dark-mode')
  } else {
    el.dataset.darkMode = mode
  }
}

function toggleDarkMode() {
  config.darkMode = config.darkMode === 'dark' ? 'light' : 'dark'
}

const darkModeLabel = computed(() =>
  config.darkMode === 'dark' ? 'Dark' : 'Light'
)

const darkModeIcon = computed(() =>
  config.darkMode === 'dark' ? '●' : '○'
)

watch(() => config.darkMode, applyDarkMode, { immediate: true })

watchEffect(() => {
  spApi.navLocked = config.navLocked
  spApi.currentIndex = currentIndex.value
  spApi.stepIndex = stepIndex.value
  spApi.total = total.value
  spApi.effectiveLast = effectiveLast.value
  spApi.effectiveTotal = effectiveTotal.value
  spApi.fakeEndIndices = fakeEndIndices.value
})
spApi.toggleNavLock = () => { config.navLocked = !config.navLocked }
spApi.goTo = goTo
spApi.next = next
spApi.prev = prev
spApi.nextSlide = nextSlide
spApi.prevSlide = prevSlide
spApi.export = exportStandalone

const overviewThumbStyle = computed(() => ({
  width: props.designWidth * config.overviewScale + 'px',
  height: props.designHeight * config.overviewScale + 'px',
}))

const overviewSlideStyle = computed(() => ({
  transform: `scale(${config.overviewScale})`,
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

const slideHeadingLevels = computed(() => {
  return slides.value.map(s => {
    const d = document.createElement('div')
    d.innerHTML = s.html
    const h = d.querySelector('h1,h2,h3')
    if (!h) return 0
    return parseInt(h.tagName[1])
  })
})

function goToOverviewSlide(i: number) {
  showOverview.value = false
  goTo(i)
  stepIndex.value = 0
}

const showGoPrompt = ref(false)

function onGoPrompt() {
  showGoPrompt.value = true
}

function closeGoPrompt() {
  showGoPrompt.value = false
}

function goToResult(idx: number) {
  closeGoPrompt()
  goTo(idx)
}

watch(current, (slide, old) => {
  buildSteps(slide)
  if (old?.num !== slide?.num) {
    if (targetStepIndex !== null) {
      stepIndex.value = Math.min(Math.max(targetStepIndex, 0), Math.max(0, totalSteps.value - 1))
      targetStepIndex = null
    } else if (skipStepReset) {
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



watch(() => [stepIndex.value, currentIndex.value], () => {
  nextTick(() => {
    // Visibility now handled by SpStep.vue and SpAnim.vue
  })
})

watch(contentVersion, () => {
  nextTick(() => {
    // Visibility now handled by SpStep.vue and SpAnim.vue
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

onMessage('sync', (data) => {
  isBroadcasting.value = true
  if (data.slide !== currentIndex.value) {
    skipStepReset = true
  }
  goTo(data.slide as number)
  stepIndex.value = data.step as number
  nextTick(() => { isBroadcasting.value = false })
})

onMessage('presenter-ready', () => {
  syncState(currentIndex.value, stepIndex.value)
})

onMessage('presenter-close', () => {
  closePresenter()
})

onMessage('blackout', (data) => {
  blackout.value = data.active as boolean
})

if (props.presenter) {
  send('presenter-ready')
  window.addEventListener('beforeunload', () => {
    send('presenter-close')
  })
}

function toggleBlackout() {
  blackout.value = !blackout.value
  syncBlackout(blackout.value)
}

function exitBlackout() {
  if (blackout.value) {
    blackout.value = false
    syncBlackout(false)
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
  onOverviewExit: () => { showOverview.value = false },
  onGoPrompt,
  onBlackoutToggle: toggleBlackout,
  onBlackoutExit: exitBlackout,
  onDevPaneToggle: () => { config.proMode ? toggleDevPane() : toggleDarkMode() },
  onGoPrevBegin: goToPrevBegin,
  onGoNextEnd: goToNextEnd,
})

onMounted(() => {
  if (current.value) {
    buildSteps(current.value)
  }
  // Visibility now handled by SpStep.vue and SpAnim.vue
  if (!props.presenter) {
    parseHash()
    nextTick(() => {
      syncUrl()
      loading.value = false
    })
    window.addEventListener('hashchange', onHashChange)
  } else {
    loading.value = false
  }
  document.addEventListener('click', onDocumentClick, true)
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
  document.removeEventListener('click', onDocumentClick, true)
  window.removeEventListener('hashchange', onHashChange)
})

function goToEndOfPrev() {
  if (currentIndex.value > 0) {
    goTo(currentIndex.value - 1)
    nextTick(() => { stepIndex.value = Math.max(0, totalSteps.value - 1) })
  }
}

function goToPrevBegin() {
  if (currentIndex.value > 0) {
    targetStepIndex = 0
    goTo(currentIndex.value - 1)
  }
}

function goToNextEnd() {
  const stayOnSlide = stepIndex.value < totalSteps.value - 1 
  if (stayOnSlide) {
    stepIndex.value = computeSlideSteps(slides.value[currentIndex.value]) - 1
  } else {
    if (currentIndex.value < total.value - 1) {
      targetStepIndex = Math.max(0, computeSlideSteps(slides.value[currentIndex.value + 1]) - 1)
      goTo(currentIndex.value + 1)
    }
  }
}

function toggleDevPane() {
  showDevPane.value = !showDevPane.value
}

function onDocumentClick(e: MouseEvent) {
  if (showMoreMenu.value && moreMenuEl.value && !moreMenuEl.value.contains(e.target as Node)) {
    showMoreMenu.value = false
  }
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