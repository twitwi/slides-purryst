import type { Keymap, KeymapSetupFn } from './types'
import type { SlideData } from '../types'
import { bind } from './bind'

export interface NavigationActions {
  next: () => void
  prev: () => void
  goTo: (i: number) => void
  goToPrevBegin: () => void
  goToNextBegin: () => void
  goToPrevEnd: () => void
  goToNextEnd: () => void
  currentIndex: { value: number }
  current: { value: SlideData | null }
  total: { value: number }
  nextStep: () => void
  prevStep: () => void
  stepIndex: { value: number }
  totalSteps: { value: number }
  isLastStep: { value: boolean }
  isFirstStep: { value: boolean }
  onPresenterToggle?: () => void
  onOverviewToggle?: () => void
  onOverviewExit?: () => void
  onGoPrompt?: () => void
  onBlackoutToggle?: () => void
  onBlackoutExit?: () => void
  onDevPaneToggle?: () => void
}

export function createDefaultKeymap(a: NavigationActions): KeymapSetupFn {
  return (km: Keymap) => {
    km['ArrowRight'] = km[' '] = () => a.next()
    km['ArrowLeft'] = () => a.prev()
    km['ArrowUp'] = () => a.goToPrevBegin()
    km['ArrowDown'] = () => a.goToNextBegin()
    km['a'] = () => a.goToPrevEnd()
    km['z'] = () => a.goToNextEnd()
    km['Home'] = () => a.goTo(0)
    km['End'] = () => a.goTo(a.total.value - 1)

    km['f'] = bind(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
    }, { preventDefault: false })

    km['Escape'] = bind(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      a.onOverviewExit?.()
      a.onBlackoutExit?.()
    }, { preventDefault: false })

    km['p'] = () => a.onPresenterToggle?.()
    km['o'] = () => a.onOverviewToggle?.()
    km['g'] = () => a.onGoPrompt?.()
    km['b'] = () => a.onBlackoutToggle?.()
    km['d'] = () => a.onDevPaneToggle?.()
  }
}
