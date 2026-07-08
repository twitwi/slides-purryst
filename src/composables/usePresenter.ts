import { ref, computed, onUnmounted } from 'vue'

export function usePresenter() {
  const presenterWindow = ref<Window | null>(null)
  let channel: BroadcastChannel | null = null

  const presenterActive = computed(() =>
    presenterWindow.value !== null && !presenterWindow.value.closed
  )

  function initChannel() {
    try {
      channel = new BroadcastChannel('sp-presenter')
    } catch {}
  }

  function openPresenterWindow() {
    const url = new URL(window.location.href)
    url.searchParams.set('presenter', '1')
    const w = window.open(url.toString(), 'sp-presenter', 'width=1280,height=720')
    if (!w) return
    presenterWindow.value = w
  }

  function closePresenter() {
    if (presenterWindow.value && !presenterWindow.value.closed) {
      presenterWindow.value.close()
    }
    presenterWindow.value = null
  }

  function syncState(slide: number, step: number) {
    channel?.postMessage({ type: 'sync', slide, step })
  }

  initChannel()

  onUnmounted(() => {
    channel?.close()
  })

  return { presenterWindow, presenterActive, openPresenterWindow, closePresenter, syncState, channel }
}