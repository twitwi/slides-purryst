<template>
  <div
    ref="el"
    class="sp-drag"
    :class="{ 'sp-drag-editing': editing }"
    :style="style"
    @dblclick="toggleEdit"
    @mousedown="startDrag"
  >
    <div class="sp-drag-content" :class="{ 'sp-drag-content-blocked': editing }">
      <slot />
    </div>
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
      <button class="sp-drag-save-btn" :title="saveTooltip" @mousedown.stop @click.stop="saveToSource">
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
import { spApi } from '../sp-api'

const slideIndex = inject('slideIndex', ref(0))

const props = withDefaults(defineProps<{
  at?: string
  x?: number | string
  y?: number | string
  w?: number | string
  h?: number | string
  rotate?: number | string
}>(), {
  at: '',
  x: 0,
  y: 0,
  w: 'auto',
  h: 'auto',
  rotate: 0,
})

const parsedAt = computed(() => {
  if (!props.at) return null
  const parts = props.at.split('|')
  if (parts.length < 5) return null
  return {
    x: parseFloat(parts[0]),
    y: parseFloat(parts[1]),
    w: /^\d+\.?\d*$/.test(parts[2]) ? parts[2] : parts[2],
    h: /^\d+\.?\d*$/.test(parts[3]) ? parts[3] : parts[3],
    rotate: parseFloat(parts[4]),
  }
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

function resolveProp(name: 'x' | 'y' | 'w' | 'h' | 'rotate'): number | string {
  const p = parsedAt.value
  if (p) return p[name]
  return props[name]
}

function syncFromProps() {
  ix.value = parseNumeric(resolveProp('x'))
  iy.value = parseNumeric(resolveProp('y'))
  iw.value = resolveProp('w')
  ih.value = resolveProp('h')
  ir.value = parseNumeric(resolveProp('rotate'))
}

function onNudgeKeydown(e: KeyboardEvent) {
  if (!editing.value) return
  const step = e.shiftKey ? 10 : 1
  switch (e.key) {
    case 'ArrowUp': e.preventDefault(); iy.value -= step; break
    case 'ArrowDown': e.preventDefault(); iy.value += step; break
    case 'ArrowLeft': e.preventDefault(); ix.value -= step; break
    case 'ArrowRight': e.preventDefault(); ix.value += step; break
  }
}

function enterEditMode() {
  syncFromProps()
  if (el.value) {
    if (iw.value === 'auto') iw.value = el.value.offsetWidth || 200
    if (ih.value === 'auto') ih.value = el.value.offsetHeight || 100
  }
  editing.value = true
  window.addEventListener('keydown', onNudgeKeydown)
}

function exitEditMode() {
  editing.value = false
  window.removeEventListener('keydown', onNudgeKeydown)
}

function saveToSource() {
  const newAttrs = attrString()
  const oldAttrs = attrString(true)

  if (oldAttrs === newAttrs) {
    exitEditMode()
    return
  }

  const hasAt = !!props.at
  fetch('/__sp_edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      oldAttrs: hasAt ? oldAttrs : '__sp_insert__',
      newAttrs,
      slide: slideIndex.value,
    }),
  })
    .then(async r => {
      const data = await r.json()
      if (!r.ok || !data.ok) {
        console.error('SP edit failed:', r.status, data)
        fallbackCopy(newAttrs)
      }
    })
    .catch((err) => {
      console.error('SP edit error:', err)
      fallbackCopy(newAttrs)
    })
}

function attrString(useProps = false): string {
  const x = useProps ? resolveProp('x') : Math.round(ix.value)
  const y = useProps ? resolveProp('y') : Math.round(iy.value)
  const w = useProps ? resolveProp('w') : iw.value
  const h = useProps ? resolveProp('h') : ih.value
  const r = useProps ? resolveProp('rotate') : Math.round(ir.value * 10) / 10

  return `at="${x}|${y}|${w}|${h}|${r}"`
}

function fallbackCopy(attrs: string) {
  navigator.clipboard?.writeText(attrs).catch(() => {})
  alert(
    `Could not auto-save to source.\n\nCopy this attribute and replace the existing sp-drag at attribute manually:\n\n${attrs}`
  )
}

const saveTooltip = computed(() => {
  return `Save: x=${Math.round(ix.value)} y=${Math.round(iy.value)} w=${iw.value} h=${ih.value} rotate=${Math.round(ir.value * 10) / 10}`
})

function toggleEdit() {
  if (editing.value) saveToSource()
  else enterEditMode()
}

const px = (n: number | string) =>
  typeof n === 'number' ? n + 'px' : /^\d+(\.\d+)?$/.test(n) ? n + 'px' : n

const style = computed(() => {
  const left = resolveProp('x')
  const top = resolveProp('y')
  const width = resolveProp('w')
  const height = resolveProp('h')
  const rotate = resolveProp('rotate')

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
    left: px(left),
    top: px(top),
    width: px(width),
    height: px(height),
    transform: rotate && rotate !== 0 && rotate !== '0'
      ? `rotate(${rotate}deg)` : undefined,
  }
})

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragOrigX = 0
let dragOrigY = 0
let interacting = 0

function stopDrag() {
  if (!isDragging) return
  isDragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  setTimeout(() => {
    interacting--
    if (!interacting) spApi.dragging = false
  }, 0)
}

function startDrag(e: MouseEvent) {
  if (!editing.value) return
  cleanup()
  isDragging = true
  interacting++
  spApi.dragging = true
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
  if (!resizing) return
  resizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  setTimeout(() => {
    interacting--
    if (!interacting) spApi.dragging = false
  }, 0)
}

function startResize(e: MouseEvent, dir: string) {
  if (!editing.value) return
  cleanup()
  resizing = true
  interacting++
  spApi.dragging = true
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
  if (!rotating) return
  rotating = false
  document.removeEventListener('mousemove', onRotate)
  document.removeEventListener('mouseup', stopRotate)
  setTimeout(() => {
    interacting--
    if (!interacting) spApi.dragging = false
  }, 0)
}

function startRotate(e: MouseEvent) {
  if (!editing.value) return
  cleanup()
  rotating = true
  interacting++
  spApi.dragging = true
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
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function handleOutsideClick(e: MouseEvent) {
  if (!editing.value) return
  if (interacting > 0) return
  if (!el.value) return
  if (el.value.contains(e.target as Node)) return
  saveToSource()
}
</script>

<style scoped>
.sp-drag {
  z-index: 10;
}

.sp-drag-editing {
  cursor: move;
  user-select: none;
  opacity: 0.85;
}

.sp-drag-content-blocked {
  pointer-events: none;
}

.sp-drag-edit-overlay {
  position: absolute;
  top: -8px;
  left: -8px;
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.sp-drag-edit-border {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px dashed #3b82f6;
  pointer-events: none;
}

.sp-drag-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 2px solid #3b82f6;
  pointer-events: auto;
  z-index: 2;
}

.sp-handle-nw { top: 1px; left: 1px; cursor: nwse-resize; }
.sp-handle-n  { top: 1px; left: 50%; margin-left: -7px; cursor: ns-resize; }
.sp-handle-ne { top: 1px; right: 1px; cursor: nesw-resize; }
.sp-handle-e  { top: 50%; margin-top: -7px; right: 1px; cursor: ew-resize; }
.sp-handle-se { bottom: 1px; right: 1px; cursor: nwse-resize; }
.sp-handle-s  { bottom: 1px; left: 50%; margin-left: -7px; cursor: ns-resize; }
.sp-handle-sw { bottom: 1px; left: 1px; cursor: nesw-resize; }
.sp-handle-w  { top: 50%; margin-top: -7px; left: 1px; cursor: ew-resize; }

.sp-drag-rotate-line {
  position: absolute;
  top: -24px;
  left: calc(50% - 1px);
  width: 2px;
  height: 28px;
  background: #3b82f6;
  pointer-events: none;
}

.sp-drag-rotate-handle {
  position: absolute;
  top: -30px;
  left: calc(50% - 8px);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #3b82f6;
  cursor: grab;
  pointer-events: auto;
  z-index: 2;
}

.sp-drag-save-btn {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  font-size: 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 3;
  white-space: nowrap;
  line-height: 1.4;
}

.sp-drag-save-btn:hover {
  background: #2563eb;
}
</style>
