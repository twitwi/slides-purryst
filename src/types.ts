import type { Component } from 'vue'

export interface SlideData {
  html: string
  num: number
  steps: number
  transition: string
  noToc?: boolean
  notes?: string
  transitionDuration?: number
  fakeEnd?: boolean
}

export interface Navigation {
  next: () => void
  prev: () => void
  goTo: (i: number) => void
  currentIndex: { value: number }
  current: { value: SlideData | null }
  total: { value: number }
  nextStep: () => void
  prevStep: () => void
  stepIndex: { value: number }
  totalSteps: { value: number }
  isLastStep: { value: boolean }
  isFirstStep: { value: boolean }
}

export interface SPSlidesOptions {
  slides?: SlideData[]
  el?: string | HTMLElement
  transition?: string
  transitionDuration?: number
  designWidth?: number
  designHeight?: number
  author?: string
  presenter?: boolean
  components?: Record<string, Component>
  seed?: number
  cacheIgnore?: string[]
  clicksAt?: number
}

export type Transformer = (root: Element) => void

export interface PresenterState {
  slide: number
  step: number
  totalSlides: number
  notes?: string
}