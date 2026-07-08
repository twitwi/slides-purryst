<template>
  <div class="sp-presentation">
    <div class="sp-viewport" :style="containerStyle">
      <div class="sp-scale-wrap" :style="transformStyle">
        <div class="sp-global-top">
          <slot name="global-top" />
        </div>

        <Transition :name="transitionClass" mode="out-in">
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
    </nav>

    <div class="sp-progress">
      <div class="sp-progress-bar" :style="{ width: progressPercent + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, provide } from 'vue'
import type { SlideData } from '../types'
import { useSlides, parseElementToSlides } from '../composables/useSlides'
import { useSteps } from '../composables/useSteps'
import { useNavigation } from '../composables/useNavigation'
import { usePresenter } from '../composables/usePresenter'
import { useScale } from '../composables/useScale'
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

const { openPresenterWindow, syncState } = usePresenter()

const { transformStyle, containerStyle } = useScale(props.designWidth, props.designHeight)

provide('stepIndex', stepIndex)

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

function nextSlide() {
  if (!isLastStep.value) {
    nextStep()
  } else if (currentIndex.value < total.value - 1) {
    next()
  }
  syncIfPresenter()
}

function prevSlide() {
  if (!isFirstStep.value) {
    prevStep()
  } else if (currentIndex.value > 0) {
    prev()
  }
  syncIfPresenter()
}

function goToSlide(index: number) {
  goTo(index)
  syncIfPresenter()
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function syncIfPresenter() {
  if (!props.presenter) return
  syncState({ slide: currentIndex.value, step: stepIndex.value, totalSlides: total.value })
}

watch(current, (slide, old) => {
  buildSteps(slide)
  if (old?.num !== slide?.num) {
    stepIndex.value = 0
  }
})

useNavigation({
  next() { nextSlide() },
  prev() { prevSlide() },
  goTo(i: number) { goToSlide(i) },
  currentIndex,
  current,
  total,
  nextStep,
  prevStep,
  stepIndex,
  totalSteps,
  isLastStep,
  isFirstStep,
})

onMounted(() => {
  if (current.value) {
    buildSteps(current.value)
  }
  if (props.presenter) {
    openPresenterWindow()
  }
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