<template>
  <div class="sp-presentation" :class="{ 'sp-presenter-mode': presenter }" :style="rootStyle">
    <span style="display: none" :data-source-file-push="dataSourceFile"></span>
    <component :is="beforeComp" v-if="props.raw?.before" />
    <div v-if="globalErrorMessages.length > 0" class="sp-global-error-overlay" @click.self="clearGlobalErrorMessages()">
      <div class="sp-global-error">
        <h3>Global Errors</h3>
        <ul>
          <li v-for="(msg, idx) in globalErrorMessages" :key="idx">{{ msg }}</li>
        </ul>
      </div>
    </div>
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
              :fixedStep="preloadPrevSteps - 1"
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

          <div v-if="spApi.chunkletMode" class="sp-chunklet-overlay"
               :class="{ 'sp-chunklet-drag': placementMode === 'drag' }"
               @pointerdown="onChunkletPointerDown"
               @pointermove="onChunkletPointerMove"
               @pointerup="onChunkletPointerUp">
            <div class="sp-chunklet-hint">
              {{ placementMode === 'drag'
                ? 'Click + drag to draw ' + spApi.selectedChunklet?.name
                : placementMode === 'click'
                  ? 'Click to place ' + spApi.selectedChunklet?.name
                  : 'Click to insert ' + spApi.selectedChunklet?.name }}
              <span class="sp-chunklet-hint-esc">ESC to cancel</span>
            </div>
            <div v-if="dragging" class="sp-chunklet-preview" :style="previewStyle"></div>
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
          <button class="sp-nav-btn" :disabled="isFirst && isFirstStep" aria-label="Previous" @click="prev">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <span class="sp-nav-counter" @click="onGoPrompt">{{ currentIndex + 1 }} / {{ effectiveTotal }}</span>
          <button class="sp-nav-btn" :disabled="isLast && isLastStep" aria-label="Next" @click="next">
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
              <button class="sp-nav-more-item" :class="{ active: spApi.showChunkletsBar }" @click="toggleChunkBar(); showMoreMenu = false">
                <span class="sp-nav-more-icon">▤</span> Chunks
              </button>
              <div class="sp-nav-more-divider"></div>
              <button class="sp-nav-more-item" @click="toggleBlackout()">
                <span class="sp-nav-more-icon sp-nav-more-icon-blackout" :class="{ active: blackout }">●</span> Blackout
              </button>
              <div class="sp-nav-more-item sp-nav-more-browse">
                <button class="sp-nav-more-browse-btn" title="End of previous slide (A)" @click="goToPrevEnd()">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M4 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
                |
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

      <div v-if="spApi.showChunkletsBar && spApi.chunkletDefs.length" class="sp-chunklets-bar">
        <button
          v-for="chunk in spApi.chunkletDefs"
          :key="chunk.name"
          class="sp-chunklets-bar-btn"
          :class="{ active: spApi.selectedChunklet === chunk }"
          @click="selectChunk(chunk)"
        >
          {{ chunk.name }}
          <span class="sp-chunklets-bar-badge">{{ chunkPlacementMode(chunk) }}</span>
        </button>
        <button class="sp-chunklets-bar-btn" @click="spApi.showChunkletsBar = !spApi.showChunkletsBar">×</button>
      </div>

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
        :progressPercent="progressPercent"
        :blackout="blackout"
        :exitBlackout="exitBlackout"
        :components="props.components"
        :designWidth="props.designWidth"
        :designHeight="props.designHeight"
        :config="config"
        :slides="slides"
      />
    </template>

    <!-- === SHARED OVERLAYS (both modes) === -->
    <SpOverview
      v-if="showOverview"
      :slides="slides"
      :currentIndex="currentIndex"
      :slideHeadingLevels="slideHeadingLevels"
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
      :designWidth="props.designWidth"
      :designHeight="props.designHeight"
      :components="props.components"
      :total="total"
      @close="closeGoPrompt"
      @select="goToResult"
    />
    <component :is="afterComp" v-if="props.raw?.after" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted, provide, onUnmounted, onUpdated, nextTick, shallowRef, defineComponent } from 'vue'
import type { Component } from 'vue'
import type { SlideData, ChunkDef } from '../types'
import { useSlides, parseElementToSlides, extractRawSlideSources } from '../composables/useSlides'
import { useSteps, processSlideHtml, maybeProcessed, fixVoidElementsHtml, annotateEditableWithIndex, wrapEmojisInSvg } from '../composables/useSteps'
import { getSourceFileFromDOMLocation } from '../composables/resolveIncludes'
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
import { registry } from '../plugin'
import { chunkPlacementMode, substituteParams, getSlideScale } from '../composables/useChunklets'
import { clearGlobalErrorMessages, globalErrorMessages } from '../composables/globalErrorMessages'

const props = withDefaults(defineProps<{
  slides: SlideData[]
  rawSlideSources?: string[]
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
  nextSlide,
  prevSlide,
  setSlides
} = useSlides(props.slides)

const {
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  prevStep,
} = useSteps()

let skipStepReset = false
let targetStepIndex: number | null = null
const contentVersion = ref(0)

const beforeComp = shallowRef<Component | null>(null)
const afterComp = shallowRef<Component | null>(null)

watch(() => props.raw?.before, (html) => {
  if (!html) { beforeComp.value = null; return }
  beforeComp.value = defineComponent({
    template: `<div style="display:contents" class="sp-raw-before">${html}</div>`,
    components: props.components,
  })
}, { immediate: true })

watch(() => props.raw?.after, (html) => {
  if (!html) { afterComp.value = null; return }
  afterComp.value = defineComponent({
    template: `<div style="display:contents" class="sp-raw-after">${html}</div>`,
    components: props.components,
  })
}, { immediate: true })

const { openPresenterWindow, closePresenter, presenterActive, syncState, syncBlackout, send, onMessage, channel } = usePresenter()

const { transformStyle, containerStyle } = useScale(props.designWidth, props.designHeight)

const viewportEl = ref<HTMLElement | null>(null)
const transitionWrapEl = ref<HTMLElement | null>(null)

provide('stepIndex', stepIndex)
provide('slideIndex', currentIndex)
provide('contentVersion', contentVersion)
provide('slides', slides)
provide('goTo', goTo)
provide('sp-components', props.components)
const rawSlideSources = ref<string[]>(props.rawSlideSources ?? slides.value.map(s => s.html))
provide('rawSlideSources', rawSlideSources)

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

const currentProcessed = computed(() => maybeProcessed(current.value))

const activeHtml = computed(() => currentProcessed.value?.html ?? '')

function next() {
  if (!isLastStep.value) {
    nextStep()
  } else if (currentIndex.value < total.value - 1) {
    nextSlide()
  }
}

function prev() {
  if (!isFirstStep.value) {
    prevStep()
  } else if (currentIndex.value > 0) {
    prevSlide()
  }
}


const preloadPrevSlideData = computed(() => {
  if (currentIndex.value === 0) return null
  return slides.value[currentIndex.value - 1] ?? null
})
const preloadPrevProcessed = computed(() => maybeProcessed(preloadPrevSlideData.value))
const preloadPrevHtml = computed(() => preloadPrevProcessed?.value?.html ?? '')
const preloadPrevSteps = computed(() => preloadPrevProcessed?.value?.steps ?? '')

const preloadNextSlideData = computed(() => {
  if (currentIndex.value >= total.value - 1) return null
  return slides.value[currentIndex.value + 1] ?? null
})
const preloadNextProcessed = computed(() => maybeProcessed(preloadNextSlideData.value))
const preloadNextHtml = computed(() => preloadNextProcessed?.value?.html ?? '')
const preloadNextSteps = computed(() => preloadNextProcessed?.value?.steps ?? '')

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
  targetStepIndex = 0
  goTo(i)
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
  totalSteps.value = processSlideHtml(slide.html).steps
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


/*
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
*/

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

const extraSetups = [...registry._keymapSetups]
registry.applyAnimRegistrations()

const { rebuildKeymap } = useNavigation({
  next,
  prev,
  goTo,
  goToPrevBegin,
  goToNextBegin,
  goToPrevEnd,
  goToNextEnd,
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
  onChunkBarToggle: toggleChunkBar,
}, {
  getContext: () => ({
    overview: showOverview.value,
    presenter: presenterActive.value,
    blackout: blackout.value,
    devPane: showDevPane.value,
    dragging: spApi.dragging,
    goPrompt: showGoPrompt.value,
  }),
  extraSetups,
})

onMounted(() => {
  if (current.value) {
    totalSteps.value = processSlideHtml(current.value.html).steps
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
  window.removeEventListener('keydown', onChunkletKeydown)
})

function goToPrevBegin() {
  if (stepIndex.value > 0) { // stay
    stepIndex.value = 0
  } else if (currentIndex.value > 0) {
    targetStepIndex = 0
    goTo(currentIndex.value - 1)
  }
}

function goToPrevEnd() {
  if (currentIndex.value > 0) {
    // setting to last step is handled by direction.value
    //targetStepIndex = computeSlideSteps(slides.value[currentIndex.value - 1]) - 1
    goTo(currentIndex.value - 1)
    //nextTick(() => { stepIndex.value = Math.max(0, totalSteps.value - 1) })
  }
}

function goToNextBegin() {
  if (currentIndex.value < total.value - 1) {
    targetStepIndex = 0
    goTo(currentIndex.value + 1)
  }
}

function goToNextEnd() {
  const stayOnSlide = stepIndex.value < totalSteps.value - 1 
  if (stayOnSlide) {
    stepIndex.value = processSlideHtml(slides.value[currentIndex.value].html).steps - 1
  } else {
    if (currentIndex.value < total.value - 1) {
      targetStepIndex = Math.max(0, processSlideHtml(slides.value[currentIndex.value + 1].html).steps - 1)
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

// --- Chunklet placement ---

const placementMode = computed(() => {
  const chunk = spApi.selectedChunklet
  if (!chunk) return 'click'
  return chunkPlacementMode(chunk)
})

function slideCoords(e: PointerEvent): { x: number; y: number } {
  const el = e.currentTarget as HTMLElement | null
  if (!el) return { x: 0, y: 0 }
  const rect = el.getBoundingClientRect()
  const scale = getSlideScale()
  return {
    x: Math.round((e.clientX - rect.left) / scale),
    y: Math.round((e.clientY - rect.top) / scale),
  }
}

function insertChunk(chunk: typeof spApi.selectedChunklet, params: Record<string, number | string>) {
  if (!chunk) return
  const idx = currentIndex.value
  const slide = slides.value[idx]
  if (chunk.kind === 'typst') {
    const src = substituteParams(chunk.html, params)
    const placeholder = `<div class="sp-chunklet-placeholder">chunklet: ${chunk.name}</div>`
    slides.value = slides.value.map((s, i) =>
      i === idx ? { ...s, html: s.html + '\n' + placeholder } : s
    )
    if (rawSlideSources.value[idx]) {
      rawSlideSources.value = rawSlideSources.value.map((src, i) =>
        i === idx ? src + '\n' + placeholder : src
      )
    }
    totalSteps.value = processSlideHtml(current.value.html).steps
    contentVersion.value++
    spApi.chunkletMode = false
    spApi.selectedChunklet = null
    saveChunkletToSource(src, slide.editableIndex, chunk, { file: slide.sourceFile, sourceLine: slide.sourceLine })
    return
  }
  const html = substituteParams(chunk.html, params)
  const oldHtml = slide.html
  slides.value = slides.value.map((s, i) =>
    i === idx ? { ...s, html: oldHtml + '\n' + html } : s
  )
  if (rawSlideSources.value[idx]) {
    rawSlideSources.value = rawSlideSources.value.map((src, i) =>
      i === idx ? src + '\n' + html : src
    )
  }
  totalSteps.value = processSlideHtml(current.value.html).steps
  contentVersion.value++
  spApi.chunkletMode = false
  spApi.selectedChunklet = null
  saveChunkletToSource(html, slide.editableIndex)
}

function selectChunk(chunk: ChunkDef) {
  if (spApi.selectedChunklet === chunk && spApi.chunkletMode) {
    cancelChunkletPlacement()
    return
  }
  spApi.selectedChunklet = chunk
  spApi.chunkletMode = true
}

function toggleChunkBar() {
  spApi.showChunkletsBar = !spApi.showChunkletsBar
}

function saveChunkletToSource(html: string | null, editableIndex: number, chunk?: typeof spApi.selectedChunklet, source?: { file?: string; sourceLine?: number }) {
  const slideEl = transitionWrapEl.value?.querySelector('.sp-slide-current') as HTMLElement | null
  if (chunk?.kind === 'typst') {
    const file = source?.file ?? null
    const sourceLine = source?.sourceLine != null ? String(source.sourceLine) : null
    if (file && sourceLine) {
      fetch('/__sp_edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'insert-chunk', kind: 'typst', src: html, file, sourceLine, editableIndex }),
      }).catch(() => {})
    }
    return
  }
  const targetEl = transitionWrapEl.value?.querySelector('.sp-slide-current [data-source-file-push] + *') ?? slideEl as HTMLElement | null
  const file = (slideEl ? getSourceFileFromDOMLocation(targetEl as HTMLElement) : null)
  fetch('/__sp_edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'insert-chunk', html, file, editableIndex }),
  }).catch(() => {})
}

const dragStart = ref({ x: 0, y: 0 })
const dragCurrent = ref({ x: 0, y: 0 })
const dragging = ref(false)

const previewStyle = computed(() => {
  const x = Math.min(dragStart.value.x, dragCurrent.value.x)
  const y = Math.min(dragStart.value.y, dragCurrent.value.y)
  const w = Math.abs(dragCurrent.value.x - dragStart.value.x)
  const h = Math.abs(dragCurrent.value.y - dragStart.value.y)
  return { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }
})

function onChunkletPointerDown(e: PointerEvent) {
  e.preventDefault()
  dragStart.value = slideCoords(e)
  dragCurrent.value = { ...dragStart.value }
  dragging.value = true
}

function onChunkletPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  dragCurrent.value = slideCoords(e)
}

function onChunkletPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  const chunk = spApi.selectedChunklet
  if (!chunk) return
  const mode = chunkPlacementMode(chunk)
  const start = dragStart.value
  const end = dragCurrent.value
  const dx = Math.abs(end.x - start.x)
  const dy = Math.abs(end.y - start.y)
  const isClick = dx < 5 && dy < 5

  if (mode === 'drag' && !isClick) {
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const w = Math.abs(end.x - start.x)
    const h = Math.abs(end.y - start.y)
    insertChunk(chunk, { x, y, w, h })
  } else {
    insertChunk(chunk, { x: start.x, y: start.y })
  }
}

function cancelChunkletPlacement() {
  spApi.chunkletMode = false
  spApi.selectedChunklet = null
  dragging.value = false
}

watch(() => spApi.chunkletMode, (on) => {
  if (on) {
    window.addEventListener('keydown', onChunkletKeydown)
  } else {
    window.removeEventListener('keydown', onChunkletKeydown)
  }
})

function onChunkletKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cancelChunkletPlacement()
}

function updateSlides(templateHtml: string) {
  rawSlideSources.value = extractRawSlideSources(templateHtml)
  const fixedHtml = wrapEmojisInSvg(annotateEditableWithIndex(fixVoidElementsHtml(templateHtml)))
  const tmp = document.createElement('div')
  tmp.innerHTML = fixedHtml
  const newSlides = parseElementToSlides(tmp)
  if (newSlides.length === 0) return
  const oldIdx = currentIndex.value
  const oldStep = stepIndex.value
  const idx = Math.min(oldIdx, newSlides.length - 1)
  skipStepReset = true
  setSlides(newSlides)
  currentIndex.value = idx
  totalSteps.value = processSlideHtml(current.value.html).steps
  if (idx === oldIdx) {
    stepIndex.value = Math.min(oldStep, totalSteps.value - 1)
    skipStepReset = false
  } else {
    stepIndex.value = 0
  }
  highlightAllSlides().then(() => { contentVersion.value++ })
}

defineExpose({ updateSlides })
</script>