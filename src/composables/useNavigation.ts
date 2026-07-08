import { onMounted, onUnmounted, watch } from 'vue'
import type { Navigation } from '../types'

export function useNavigation(actions: Navigation) {
  let touchStartX = 0
  let touchStartY = 0
  let hashTimer: ReturnType<typeof setTimeout> | null = null

  function onKeydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault()
        if (actions.stepIndex.value < actions.totalSteps.value - 1) {
          actions.nextStep()
        } else if (actions.currentIndex.value < actions.total.value - 1) {
          actions.goTo(actions.currentIndex.value + 1)
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (actions.stepIndex.value > 0) {
          actions.prevStep()
        } else if (actions.currentIndex.value > 0) {
          actions.goTo(actions.currentIndex.value - 1)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (actions.stepIndex.value > 0) {
          actions.stepIndex.value = 0
        } else if (actions.currentIndex.value > 0) {
          actions.goTo(actions.currentIndex.value - 1)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (actions.currentIndex.value < actions.total.value - 1) {
          actions.goTo(actions.currentIndex.value + 1)
        }
        break
      case 'a':
        e.preventDefault()
        if (actions.currentIndex.value > 0) {
          actions.goTo(actions.currentIndex.value - 1)
          setTimeout(() => {
            actions.stepIndex.value = actions.totalSteps.value - 1
          })
        }
        break
      case 'z':
        e.preventDefault()
        if (actions.currentIndex.value < actions.total.value - 1) {
          actions.goTo(actions.currentIndex.value + 1)
          setTimeout(() => {
            actions.stepIndex.value = actions.totalSteps.value - 1
          })
        }
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
        break
    }
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }

  function onTouchEnd(e: TouchEvent) {
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

  function updateHash() {
    if (hashTimer) clearTimeout(hashTimer)
    hashTimer = setTimeout(() => {
      const idx = actions.currentIndex.value
      const step = actions.stepIndex.value
      const hash = step > 0 ? `#${idx + 1}/${step}` : `#${idx + 1}`
      history.replaceState(null, '', hash)
    }, 100)
  }

  function onHashChange() {
    const hash = location.hash.slice(1)
    if (!hash) return
    const m = hash.match(/^(\d+)(?:\/(\d+))?$/)
    if (!m) return
    const idx = parseInt(m[1], 10) - 1
    if (idx < 0 || idx >= actions.total.value) return
    actions.goTo(idx)
    if (m[2]) {
      const targetStep = parseInt(m[2], 10)
      while (actions.stepIndex.value < targetStep) {
        if (!actions.nextStep()) break
      }
    }
  }

  watch(() => actions.currentIndex.value, () => {
    updateHash()
    actions.stepIndex.value = 0
  })

  watch(() => actions.stepIndex.value, updateHash)

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('hashchange', onHashChange)
    if (location.hash) onHashChange()
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('hashchange', onHashChange)
    if (hashTimer) clearTimeout(hashTimer)
  })
}