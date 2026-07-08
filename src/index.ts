export type { SPSlidesOptions, SlideData, Navigation, PresenterState } from './types'

export { createSlidesPurryst } from './core'

export { useScale } from './composables/useScale'
export { useSteps, buildSteps, processHtml } from './composables/useSteps'
export { useNavigation } from './composables/useNavigation'
export { useSlides, parseElementToSlides } from './composables/useSlides'
export { usePresenter } from './composables/usePresenter'

export { default as SpPresentation } from './components/SpPresentation.vue'
export { default as SpSlide } from './components/SpSlide.vue'
export { default as SpAlternatives } from './components/SpAlternatives.vue'