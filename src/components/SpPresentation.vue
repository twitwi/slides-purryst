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