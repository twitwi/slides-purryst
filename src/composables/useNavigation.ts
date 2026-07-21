import { onMounted, onUnmounted } from 'vue'
import type { Navigation } from '../types'
import { spApi } from '../sp-api'

export function useNavigation(actions: Navigation & { onPresenterToggle?: () => void; onOverviewToggle?: () => void; onOverviewExit?: () => void; onGoPrompt?: () => void; onBlackoutToggle?: () => void; onBlackoutExit?: () => void; onDevPaneToggle?: () => void; onGoPrevBegin?: () => void; onGoNextEnd?: () => void }) {
  let touchStartX = 0
  let touchStartY = 0

  function onKeydown(e: KeyboardEvent) {
    if (spApi.dragging) return
    const t = e.target as HTMLElement
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault()
        actions.next()
        break
      case 'ArrowLeft':
        e.preventDefault()
        actions.prev()
        break
      case 'ArrowUp':
        e.preventDefault()
        actions.goToPrevBegin()
        break
      case 'ArrowDown':
        e.preventDefault()
        actions.goToNextBegin()
        break
      case 'a':
        e.preventDefault()
        actions.goToPrevEnd()
        break
      case 'z':
        e.preventDefault()
        actions.goToNextEnd()
        break
      case 'Home':
        e.preventDefault()
        actions.goTo(0)
        break
      case 'End':
        e.preventDefault()
        actions.goTo(actions.total.value - 1)
        break
      case 'f':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        } else {
          document.exitFullscreen().catch(() => {})
        }
        break
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
        actions.onOverviewExit?.()
        actions.onBlackoutExit?.()
        break
      case 'p':
        e.preventDefault()
        actions.onPresenterToggle?.()
        break
      case 'o':
        e.preventDefault()
        actions.onOverviewToggle?.()
        break
      case 'g':
        e.preventDefault()
        actions.onGoPrompt?.()
        break
      case 'b':
        e.preventDefault()
        actions.onBlackoutToggle?.()
        break
      case 'd':
        e.preventDefault()
        actions.onDevPaneToggle?.()
        break
    }
  }

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
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
  })
}