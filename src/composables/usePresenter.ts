import { ref, computed, onUnmounted } from 'vue'

type MessageHandler = (payload: Record<string, unknown>) => void

export function usePresenter() {
  const presenterWindow = ref<Window | null>(null)
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel('sp-presenter')
  } catch {}

  const handlers = new Map<string, Set<MessageHandler>>()

  if (channel) {
    channel.addEventListener('message', (e: MessageEvent) => {
      const data: Record<string, unknown> = e.data ?? {}
      const h = handlers.get(data.type as string)
      if (h) h.forEach(fn => fn(data))
    })
  }

  const presenterActive = computed(() =>
    presenterWindow.value !== null && !presenterWindow.value.closed
  )

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

  function send(type: string, payload?: Record<string, unknown>) {
    channel?.postMessage(payload !== undefined ? { type, ...payload } : { type })
  }

  function onMessage(type: string, handler: MessageHandler) {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type)!.add(handler)
    return () => handlers.get(type)?.delete(handler)
  }

  function syncState(slide: number, step: number) {
    send('sync', { slide, step })
  }

  function syncBlackout(active: boolean) {
    send('blackout', { active })
  }

  onUnmounted(() => {
    channel?.close()
  })

  return { presenterWindow, presenterActive, openPresenterWindow, closePresenter, send, onMessage, syncState, syncBlackout, channel }
}
