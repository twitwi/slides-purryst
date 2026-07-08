import { ref, onUnmounted } from 'vue'
import type { PresenterState } from '../types'

export function usePresenter() {
  const presenterWindow = ref<Window | null>(null)
  let channel: BroadcastChannel | null = null

  function initChannel() {
    try {
      channel = new BroadcastChannel('sp-presenter')
      channel.onmessage = (e: MessageEvent) => {
        if (e.data?.type === 'presenter-ping') {
          channel?.postMessage({ type: 'presenter-pong' })
        }
      }
    } catch {}
  }

  function openPresenterWindow() {
    const w = window.open('', 'sp-presenter', 'width=1280,height=720')
    if (!w) return
    w.document.write(presenterHtml())
    w.document.title = 'SP Presenter'
    presenterWindow.value = w
  }

  function syncState(state: PresenterState) {
    channel?.postMessage({ type: 'state-update', state })
    if (presenterWindow.value && !presenterWindow.value.closed) {
      try {
        presenterWindow.value.postMessage({ type: 'sp-state', state }, '*')
      } catch {}
    }
  }

  function closePresenter() {
    if (presenterWindow.value && !presenterWindow.value.closed) {
      presenterWindow.value.close()
    }
    presenterWindow.value = null
  }

  function presenterHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SP Presenter</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;grid-template-rows:1fr auto;height:100vh;padding:2rem}
iframe{border:none;width:100%;height:100%;background:#fff;border-radius:8px}
#notes{padding:1rem;background:#1e293b;border-radius:8px;margin-top:1rem;min-height:60px}
#slide-num{position:fixed;bottom:1rem;right:1rem;font-size:.875rem;color:#64748b}
</style>
</head>
<body>
<iframe id="preview"></iframe>
<div id="notes">No notes</div>
<div id="slide-num">0 / 0</div>
<script>
var state=null
window.addEventListener('message',function(e){
if(e.data&&e.data.type==='sp-state'){
state=e.data.state
document.getElementById('slide-num').textContent=state.slide+' / '+state.totalSlides
document.getElementById('notes').textContent=state.notes||'No notes'
}
})
setInterval(function(){if(window.opener)window.opener.postMessage({type:'presenter-ping'},'*')},2000)
if(window.opener)window.opener.postMessage({type:'presenter-ping'},'*')
<\/script>
</body>
</html>`
  }

  initChannel()

  onUnmounted(() => {
    channel?.close()
  })

  return { presenterWindow, openPresenterWindow, syncState, closePresenter }
}