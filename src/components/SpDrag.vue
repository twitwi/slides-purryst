<template>
  <div class="sp-drag" :style="style">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x?: number | string
  y?: number | string
  w?: number | string
  h?: number | string
  rotate?: number | string
}>(), {
  x: 0,
  y: 0,
  w: 'auto',
  h: 'auto',
  rotate: 0,
})

const style = computed(() => {
  const px = (n: number | string) =>
    typeof n === 'number' ? n + 'px' : /^\d+(\.\d+)?$/.test(n) ? n + 'px' : n

  return {
    position: 'absolute' as const,
    left: px(props.x),
    top: px(props.y),
    width: px(props.w),
    height: px(props.h),
    transform: props.rotate && props.rotate !== 0 && props.rotate !== '0'
      ? `rotate(${props.rotate}deg)` : undefined,
  }
})
</script>

<style scoped>
.sp-drag {
  z-index: 10;
}
</style>