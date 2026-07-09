<template>
  <div class="sp-presentation" :class="{ 'sp-presenter-mode': presenter }">
    <!-- === MAIN (non-presenter) LAYOUT === -->
    <template v-if="!presenter">
      <div class="sp-viewport" :style="containerStyle">
        <div class="sp-scale-wrap" :style="transformStyle">
          <div class="sp-global-top">
            <slot name="global-top" />
          </div>

          <Transition :name="transitionClass" mode="out-in" :duration="0.2">
            <SpSlide
              v-if="current"
              :key="currentIndex"
              :slide="current"
              :html="activeHtml"
              :components="props.components"
            />
          </Transition>

          <div class="sp-global-bottom">
            <slot name="global-bottom">
              <footer class="sp-slide-footer">
                <span>{{ currentIndex + 1 }}</span>
                <span>{{ author }}</span>
              </footer>
            </slot>
          </div>
        </div>
      </div>

      <nav class="sp-nav">
        <button class="sp-nav-btn" :disabled="isFirst && isFirstStep" aria-label="Previous" @click="prevSlide">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="sp-nav-counter">{{ currentIndex + 1 }} / {{ total }}</span>
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
            <div id="sp-presenter-notes-content">No notes</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, provide, onUnmounted } from 'vue'
import type { SlideData } from '../types'
import { useSlides, parseElementToSlides } from '../composables/useSlides'
import { useSteps, buildSteps as computeSlideSteps } from '../composables/useSteps'
import { useNavigation } from '../composables/useNavigation'
import { usePresenter } from '../composables/usePresenter'
import { useScale } from '../composables/useScale'
import { useElementScale } from '../composables/useElementScale'
import SpSlide from './SpSlide.vue'

const props = withDefaults(defineProps<{
  slides: SlideData[]
  transition?: string
  presenter?: boolean
  designWidth?: number
  designHeight?: number
  author?: string
  components?: Record<string, any>
}>(), {
  transition: 'fade',
  presenter: false,
  designWidth: 1920,
  designHeight: 1080,
  author: '',
  components: () => ({})
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

const { openPresenterWindow, closePresenter, presenterActive, syncState, channel } = usePresenter()

const { transformStyle, containerStyle } = useScale(props.designWidth, props.designHeight)

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

const transitionClass = computed(() => {
  const t = current.value?.transition ?? props.transition
  return `sp-${t}`
})

const isFirst = computed(() => currentIndex.value === 0)
const isLast = computed(() => currentIndex.value === total.value - 1)

const progressPercent = computed(() => {
  if (total.value === 0) return 0
  return ((currentIndex.value + 1) / total.value) * 100
})

const activeHtml = computed(() => {
  const slide = current.value
  if (!slide) return ''
  return processHtml(slide.html, stepIndex.value)
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
    stepIndex.value = 0
  }
})

watch([currentIndex, stepIndex], () => {
  if (!props.presenter) {
    syncState(currentIndex.value, stepIndex.value)
  }
})

if (channel) {
  if (props.presenter) {
    channel.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'sync') {
        goTo(e.data.slide)
        stepIndex.value = e.data.step
      }
    })
    channel.postMessage({ type: 'presenter-ready' })
  } else {
    channel.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'presenter-ready') {
        syncState(currentIndex.value, stepIndex.value)
      }
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
})

onUnmounted(() => {
  channel?.close()
  stopDividerDrag()
  stopVdividerDrag()
})

function updateSlides(templateHtml: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = templateHtml
  const newSlides = parseElementToSlides(tmp)
  if (newSlides.length === 0) return
  const oldIdx = currentIndex.value
  const oldStep = stepIndex.value
  const idx = Math.min(oldIdx, newSlides.length - 1)
  setSlides(newSlides)
  currentIndex.value = idx
  buildSteps(current.value)
  if (idx === oldIdx) {
    stepIndex.value = Math.min(oldStep, totalSteps.value - 1)
  } else {
    stepIndex.value = 0
  }
}

defineExpose({ updateSlides })
</script>