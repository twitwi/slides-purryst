<template>
  <div
    ref="el"
    class="sp-drag"
    :class="{ 'sp-drag-editing': editing }"
    :style="style"
    @dblclick="toggleEdit"
    @mousedown="startDrag"
  >
    <slot />
    <div v-if="editing" class="sp-drag-edit-overlay">
      <div class="sp-drag-edit-border"></div>
      <div
        v-for="dir in resizeDirs" :key="dir"
        class="sp-drag-handle"
        :class="'sp-handle-' + dir"
        @mousedown.stop="startResize($event, dir)"
      ></div>
      <div class="sp-drag-rotate-line"></div>
      <div class="sp-drag-rotate-handle" @mousedown.stop="startRotate"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

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

const el = ref<HTMLElement | null>(null)
const editing = ref(false)

const resizeDirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const ix = ref(0)
const iy = ref(0)
const iw = ref<number | string>('auto')
const ih = ref<number | string>('auto')
const ir = ref(0)

function parseNumeric(v: string | number): number {
  if (typeof v === 'number') return v
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

function getSlideScale(): number {
  const wrap = document.querySelector('.sp-scale-wrap') as HTMLElement | null
  if (!wrap) return 1
  const style = window.getComputedStyle(wrap)
  const t = style.transform
  if (!t || t === 'none') return 1
  const m = t.match(/matrix\(([^)]+)\)/)
  if (m) return parseFloat(m[1].split(', ')[0]) || 1
  const m3 = t.match(/matrix3d\(([^)]+)\)/)
  if (m3) return parseFloat(m3[1].split(', ')[0]) || 1
  return 1
}

function syncFromProps() {
  ix.value = parseNumeric(props.x)
  iy.value = parseNumeric(props.y)
  iw.value = props.w
  ih.value = props.h
  ir.value = parseNumeric(props.rotate)
}

function enterEditMode() {
  syncFromProps()
  if (el.value) {
    if (iw.value === 'auto') iw.value = el.value.offsetWidth || 200
    if (ih.value === 'auto') ih.value = el.value.offsetHeight || 100
  }
  editing.value = true
}

function exitEditMode() {
  editing.value = false
}

function toggleEdit() {
  if (editing.value) exitEditMode()
  else enterEditMode()
}

const px = (n: number | string) =>
  typeof n === 'number' ? n + 'px' : /^\d+(\.\d+)?$/.test(n) ? n + 'px' : n

const style = computed(() => {
  if (editing.value) {
    return {
      position: 'absolute' as const,
      left: px(ix.value),
      top: px(iy.value),
      width: px(iw.value),
      height: px(ih.value),
      transform: ir.value ? `rotate(${ir.value}deg)` : undefined,
    }
  }
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

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragOrigX = 0
let dragOrigY = 0

function stopDrag() {
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function startDrag(e: MouseEvent) {
  if (!editing.value) return
  cleanup()
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOrigX = ix.value
  dragOrigY = iy.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return
  const scale = getSlideScale()
  const dx = (e.clientX - dragStartX) / scale
  const dy = (e.clientY - dragStartY) / scale
  ix.value = dragOrigX + dx
  iy.value = dragOrigY + dy
}

let resizing = false
let resizeDir = ''
let resizeStartX = 0
let resizeStartY = 0
let resizeOrigX = 0
let resizeOrigY = 0
let resizeOrigW = 0
let resizeOrigH = 0

function stopResize() {
  resizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

function startResize(e: MouseEvent, dir: string) {
  if (!editing.value) return
  cleanup()
  resizing = true
  resizeDir = dir
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeOrigX = ix.value
  resizeOrigY = iy.value
  resizeOrigW = parseNumeric(iw.value)
  resizeOrigH = parseNumeric(ih.value)
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!resizing) return
  const scale = getSlideScale()
  const dx = (e.clientX - resizeStartX) / scale
  const dy = (e.clientY - resizeStartY) / scale

  let x = resizeOrigX
  let y = resizeOrigY
  let w = resizeOrigW
  let h = resizeOrigH

  switch (resizeDir) {
    case 'n':
      y = resizeOrigY + dy
      h = resizeOrigH - dy
      break
    case 's':
      h = resizeOrigH + dy
      break
    case 'e':
      w = resizeOrigW + dx
      break
    case 'w':
      x = resizeOrigX + dx
      w = resizeOrigW - dx
      break
    case 'ne':
      y = resizeOrigY + dy
      h = resizeOrigH - dy
      w = resizeOrigW + dx
      break
    case 'nw':
      x = resizeOrigX + dx
      y = resizeOrigY + dy
      w = resizeOrigW - dx
      h = resizeOrigH - dy
      break
    case 'se':
      w = resizeOrigW + dx
      h = resizeOrigH + dy
      break
    case 'sw':
      x = resizeOrigX + dx
      w = resizeOrigW - dx
      h = resizeOrigH + dy
      break
  }

  if (w < 10) w = 10
  if (h < 10) h = 10

  ix.value = x
  iy.value = y
  iw.value = w
  ih.value = h
}

let rotating = false
let rotateCenterX = 0
let rotateCenterY = 0
let rotateStartAngle = 0
let rotateOrigR = 0

function stopRotate() {
  rotating = false
  document.removeEventListener('mousemove', onRotate)
  document.removeEventListener('mouseup', stopRotate)
}

function startRotate(e: MouseEvent) {
  if (!editing.value) return
  cleanup()
  rotating = true
  const rect = el.value!.getBoundingClientRect()
  rotateCenterX = rect.left + rect.width / 2
  rotateCenterY = rect.top + rect.height / 2
  rotateStartAngle = Math.atan2(e.clientY - rotateCenterY, e.clientX - rotateCenterX)
  rotateOrigR = ir.value
  document.addEventListener('mousemove', onRotate)
  document.addEventListener('mouseup', stopRotate)
}

function onRotate(e: MouseEvent) {
  if (!rotating) return
  const angle = Math.atan2(e.clientY - rotateCenterY, e.clientX - rotateCenterX)
  let delta = angle - rotateStartAngle
  ir.value = rotateOrigR + delta * (180 / Math.PI)
}

function cleanup() {
  stopDrag()
  stopResize()
  stopRotate()
}

onMounted(() => {
  syncFromProps()
})
</script>

<style scoped>
.sp-drag {
  z-index: 10;
}

.sp-drag-editing {
  cursor: move;
  user-select: none;
}

.sp-drag-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.sp-drag-edit-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px dashed #3b82f6;
  pointer-events: none;
}

.sp-drag-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1px solid #3b82f6;
  pointer-events: auto;
  z-index: 2;
}

.sp-handle-nw { top: -5px; left: -5px; cursor: nwse-resize; }
.sp-handle-n  { top: -5px; left: calc(50% - 5px); cursor: ns-resize; }
.sp-handle-ne { top: -5px; right: -5px; cursor: nesw-resize; }
.sp-handle-e  { top: calc(50% - 5px); right: -5px; cursor: ew-resize; }
.sp-handle-se { bottom: -5px; right: -5px; cursor: nwse-resize; }
.sp-handle-s  { bottom: -5px; left: calc(50% - 5px); cursor: ns-resize; }
.sp-handle-sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
.sp-handle-w  { top: calc(50% - 5px); left: -5px; cursor: ew-resize; }

.sp-drag-rotate-line {
  position: absolute;
  top: -22px;
  left: calc(50% - 1px);
  width: 2px;
  height: 20px;
  background: #3b82f6;
  pointer-events: none;
}

.sp-drag-rotate-handle {
  position: absolute;
  top: -28px;
  left: calc(50% - 6px);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #3b82f6;
  cursor: grab;
  pointer-events: auto;
  z-index: 2;
}
</style>
