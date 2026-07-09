import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

export function useElementScale(
  parentRef: Ref<HTMLElement | null>,
  designWidth: number,
  designHeight: number,
) {
  const pw = ref(0)
  const ph = ref(0)

  let ro: ResizeObserver | null = null

  function update() {
    const el = parentRef.value
    if (el) {
      pw.value = el.clientWidth
      ph.value = el.clientHeight
    }
  }

  const scale = computed(() => {
    if (!pw.value || !ph.value) return 1
    const s = Math.min(pw.value / designWidth, ph.value / designHeight)
    return Math.min(s, 1)
  })

  const transformStyle = computed(() => {
    const s = scale.value
    const ox = (pw.value - designWidth * s) / (2 * s)
    const oy = (ph.value - designHeight * s) / (2 * s)
    return {
      transform: `scale(${s}) translate(${ox}px, ${oy}px)`,
      transformOrigin: 'top left' as const,
      width: designWidth + 'px',
      height: designHeight + 'px',
    }
  })

  onMounted(() => {
    update()
    if (parentRef.value) {
      ro = new ResizeObserver(() => { update() })
      ro.observe(parentRef.value)
    }
  })

  onUnmounted(() => {
    ro?.disconnect()
  })

  return { transformStyle }
}
