import type { Component } from 'vue'

export interface SlideData {
  html: string
  num: number
  steps: number
  transition: string
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
  designWidth?: number
  designHeight?: number
  author?: string
  components?: Record<string, Component>
}

export interface PresenterState {
  slide: number
  step: number
  totalSlides: number
  notes?: string
}