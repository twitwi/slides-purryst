import { onMounted, onUnmounted } from 'vue'
import type { Navigation } from '../types'
import { spApi } from '../sp-api'
import { useKeymap } from '../keymap/useKeymap'
import { createDefaultKeymap } from '../keymap/defaults'
import type { KeyContext, KeymapSetupFn } from '../keymap/types'

export type NavigationActions = Navigation & {
  onPresenterToggle?: () => void
  onOverviewToggle?: () => void
  onOverviewExit?: () => void
  onGoPrompt?: () => void
  onBlackoutToggle?: () => void
  onBlackoutExit?: () => void
  onDevPaneToggle?: () => void
  onChunkBarToggle?: () => void
}

export function useNavigation(
  actions: NavigationActions,
  options?: {
    getContext?: () => KeyContext
    extraSetups?: KeymapSetupFn[]
  },
) {
  const defaultSetup = createDefaultKeymap(actions)
  const allSetups = [defaultSetup, ...(options?.extraSetups ?? [])]

  const { rebuild } = useKeymap({
    getContext: options?.getContext ?? (() => ({
      overview: false,
      presenter: false,
      blackout: false,
      devPane: false,
      dragging: spApi.dragging,
      goPrompt: false,
    })),
    setupFns: allSetups,
  })

  let touchStartX = 0
  let touchStartY = 0

  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }

  function onTouchEnd(e: TouchEvent) {
    if (spApi.dragging) return
    const dx = e.changedTouches[0].clientX - touchStartX
    const dy = e.changedTouches[0].clientY - touchStartY
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return
    if (Math.abs(dx) < Math.abs(dy)) return

    if (dx < 0) {
      if (!actions.isLastStep.value) {
        actions.nextStep()
      } else if (actions.currentIndex.value < actions.total.value - 1) {
        actions.next()
      }
    } else {
      if (!actions.isFirstStep.value) {
        actions.prevStep()
      } else if (actions.currentIndex.value > 0) {
        actions.prev()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
  })

  return { rebuildKeymap: rebuild }
}
