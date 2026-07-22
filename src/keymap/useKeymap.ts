import { onMounted, onUnmounted } from 'vue'
import { KeymapManager } from './manager'
import type { KeyContext, KeymapSetupFn } from './types'

export function useKeymap(options: {
  getContext: () => KeyContext
  setupFns?: KeymapSetupFn[]
}) {
  const manager = new KeymapManager(options.getContext)

  for (const fn of options.setupFns ?? []) {
    manager.addSetup(fn)
  }

  function addSetup(fn: KeymapSetupFn) {
    manager.addSetup(fn)
    manager.rebuild()
  }

  function removeSetup(fn: KeymapSetupFn) {
    manager.removeSetup(fn)
    manager.rebuild()
  }

  onMounted(() => manager.mount())
  onUnmounted(() => manager.unmount())

  return { addSetup, removeSetup, rebuild: () => manager.rebuild() }
}
