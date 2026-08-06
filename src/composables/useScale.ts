import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useScale(designWidth = 1920, designHeight = 1080) {
  const vw = ref(window.innerWidth)
  const vh = ref(window.innerHeight)

  function update() {
    vw.value = window.innerWidth
    vh.value = window.innerHeight
  }

  const scale = computed(() => {
    const s = Math.min(vw.value / designWidth, vh.value / designHeight)
    return Math.min(s, 10)
  })

  const transformStyle = computed(() => {
    const s = scale.value
    const ox = (vw.value - designWidth * s) / (2 * s)
    const oy = (vh.value - designHeight * s) / (2 * s)
    return {
      transform: `scale(${s}) translate(${ox}px, ${oy}px)`,
      transformOrigin: 'top left',
      width: designWidth + 'px',
      height: designHeight + 'px',
      '--slide-transform-scale': `${scale.value}`,
    }
  })

  const containerStyle = computed(() => ({
    width: vw.value + 'px',
    height: vh.value + 'px',
  }))

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { transformStyle, containerStyle }
}