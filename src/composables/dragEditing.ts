// Global coordination for <sp-drag> editing.
//
// Draggables are inert outside edit mode: pressing one does nothing, and there
// is no hover chrome, no selection and no overlay. Double-clicking enters an
// explicit *edit mode* on the topmost draggable under the cursor — where you
// can move/resize/rotate/nudge, with a slide-level "quit edit mode" button and
// a dotted hover outline on other draggables (they can be re-targeted). Changes
// are written on **deselect**: selecting or double-clicking another draggable
// commits the previous one, a click on empty slide space commits the selected
// one and leaves edit mode, and the quit button does the same. Double-clicking
// the edited draggable again simply keeps editing.
//
// The edited drag lifts to the top through its own z-index, so its handles
// work even when overlapped; the rest of the slide stays interactive.

import { ref } from 'vue'
import { spApi } from '../sp-api'

// Discrete save-feedback state shared across the deck. Driven by the drag
// write path (`saveBegin`/`saveSettled`) and the dev-server SSE "update" that
// confirms the source file was picked up by the reload pipeline.
export type DragSaveState = 'idle' | 'saving' | 'saved' | 'error'
export const dragSaveState = ref<DragSaveState>('idle')

const SAVED_FLASH_KEY = 'sp-drag-saved-flash'
let savedFlashTimer: ReturnType<typeof setTimeout> | null = null
let saveStallTimer: ReturnType<typeof setTimeout> | null = null

/** Call when a drag write starts (before the POST); shows the "saving" chip. */
export function dragSaveBegin() {
  if (savedFlashTimer) clearTimeout(savedFlashTimer)
  if (saveStallTimer) clearTimeout(saveStallTimer)
  dragSaveState.value = 'saving'
  // Safety net: if the confirming SSE refresh never arrives, settle anyhow.
  saveStallTimer = setTimeout(() => dragSaveSettled(), 4000)
}

/** Call when the write is confirmed and the refreshed DOM reflects it. */
export function dragSaveSettled(persistFlash = false) {
  if (saveStallTimer) clearTimeout(saveStallTimer)
  dragSaveState.value = 'saved'
  // Only needed when a hard reload is about to wipe the in-memory state.
  const wroteFlash = (() => {
    if (!persistFlash) return false
    try { sessionStorage.setItem(SAVED_FLASH_KEY, '1'); return true } catch { return false }
  })()
  if (savedFlashTimer) clearTimeout(savedFlashTimer)
  savedFlashTimer = setTimeout(() => {
    dragSaveState.value = 'idle'
    if (wroteFlash) { try { sessionStorage.removeItem(SAVED_FLASH_KEY) } catch {} }
  }, 2200)
}

/** Call if the write POST fails; surfaces the error on the chip. */
export function dragSaveFailed() {
  if (saveStallTimer) clearTimeout(saveStallTimer)
  if (savedFlashTimer) clearTimeout(savedFlashTimer)
  dragSaveState.value = 'error'
  if (savedFlashTimer) clearTimeout(savedFlashTimer)
  savedFlashTimer = setTimeout(() => { dragSaveState.value = 'idle' }, 4000)
}

// On a hard reload the in-memory chip state is lost; a persisted "just saved"
// flag makes the fresh page briefly show the confirmation instead of a blank.
export function consumeSavedFlash(): boolean {
  try {
    const v = sessionStorage.getItem(SAVED_FLASH_KEY)
    sessionStorage.removeItem(SAVED_FLASH_KEY)
    if (v === '1') {
      dragSaveState.value = 'saved'
      if (savedFlashTimer) clearTimeout(savedFlashTimer)
      savedFlashTimer = setTimeout(() => { dragSaveState.value = 'idle' }, 2200)
      return true
    }
    return false
  } catch {
    return false
  }
}

export interface DragEntry {
  el: HTMLElement
  /** Global editable index (stable across reloads). */
  index: number
  /** Slide position within the deck. */
  slide: number
  /** Enter editing (no save of others — use selectDrag for that). */
  begin: () => void
  /** Save + leave editing. */
  saveAndEnd: () => void
}

const entries = new Map<HTMLElement, DragEntry>()
let current: DragEntry | null = null
let dblInstalled = false
let clickInstalled = false

// Remembers which draggable is being edited so a page refresh triggered by the
// dev server (the SSE "update" → slides remount) doesn't drop edit mode. It is
// cleared whenever editing is deliberately left (deselect / quit), so those
// reloads still come back clean.
const EDIT_TARGET_KEY = 'sp-drag-edit-target'

function persistEditTarget(entry: DragEntry) {
  try {
    sessionStorage.setItem(EDIT_TARGET_KEY, JSON.stringify({ index: entry.index, slide: entry.slide }))
  } catch {}
}

function clearEditTarget() {
  try {
    sessionStorage.removeItem(EDIT_TARGET_KEY)
  } catch {}
}

// Gesture guard: while a drag/resize/rotate gesture is in flight (and on its
// trailing click) the outside-click deselect is suppressed, so releasing a
// handle or drag cannot accidentally commit + exit edit mode.
let gestures = 0

export function gestureStart() {
  gestures++
}

export function gestureEnd() {
  setTimeout(() => {
    gestures = Math.max(0, gestures - 1)
  }, 0)
}

function isActive(entry: DragEntry): boolean {
  return (
    entry.el.isConnected &&
    !!entry.el.closest('.sp-slide-current') &&
    !entry.el.closest('.sp-overview')
  )
}

function zIndex(entry: DragEntry): number {
  const z = parseInt(window.getComputedStyle(entry.el).zIndex, 10)
  return isNaN(z) ? 0 : z
}

// Geometric hit-test over the registry. Unlike `elementsFromPoint`, this sees
// every registered drag regardless of z-order, so the topmost drag under the
// cursor is reachable no matter which one is currently selected.
function stackAt(x: number, y: number): DragEntry[] {
  const stack: DragEntry[] = []
  for (const entry of entries.values()) {
    if (!isActive(entry)) continue
    const r = entry.el.getBoundingClientRect()
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) stack.push(entry)
  }
  return stack.sort((a, b) => {
    const za = zIndex(a)
    const zb = zIndex(b)
    if (za !== zb) return zb - za
    // Equal z-index: later elements paint on top, so keep them first.
    // compareDocumentPosition sets PRECEDING when the *other* node precedes
    // this one.
    return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1
  })
}

function onDblClickDocument(e: MouseEvent) {
  const stack = stackAt(e.clientX, e.clientY)
  if (stack.length === 0) return
  // Double-click enters edit mode on the topmost drag under the cursor.
  // Double-clicking an edited drag again simply keeps it selected; the quit
  // button, an empty-space click, or selecting another drag commits.
  selectDrag(stack[0])
}

// Clicking empty slide space while editing = deselect: commit the selected
// draggable and leave edit mode. Clicks on the edited drag, on another
// draggable (its mousedown re-targets instead), on the slide-level quit
// button, or the trailing click of a drag/resize/rotate gesture are ignored.
function onClickDocument(e: MouseEvent) {
  if (!current) return
  if (gestures > 0) return
  const t = e.target as Node
  if (!(t instanceof Element)) return
  if (t.closest('.sp-edit-quit-btn')) return
  if (current.el.contains(t)) return
  for (const entry of entries.values()) {
    if (entry.el.contains(t)) return
  }
  // Not clicking anything draggable (or the quit button) while in edit mode =
  // explicit deselect: leave edit mode and stop restoring it on refresh.
  clearEditTarget()
  current.saveAndEnd()
}

export function registerDrag(entry: DragEntry) {
  entries.set(entry.el, entry)
  if (!dblInstalled) {
    document.addEventListener('dblclick', onDblClickDocument, true)
    dblInstalled = true
  }
  if (!clickInstalled) {
    document.addEventListener('click', onClickDocument)
    clickInstalled = true
  }
}

export function unregisterDrag(el: HTMLElement) {
  entries.delete(el)
  if (current && current.el === el) {
    current = null
    spApi.dragging = false
    syncEditingClass()
  }
}

// Mark edit mode on <body> so CSS can style drags while editing (e.g. the
// dotted hover outline that signals a draggable is re-targetable).
function syncEditingClass() {
  document.body.classList.toggle('sp-editing-drag', spApi.dragging)
}

/** True while some draggable is in edit mode. */
export function isDragEditing(): boolean {
  return current !== null
}

export function selectDrag(entry: DragEntry) {
  if (!isActive(entry)) return
  const prev = current
  if (prev === entry) return
  current = entry
  spApi.dragging = true
  persistEditTarget(entry)
  syncEditingClass()
  // Save the previous drag *after* claiming `current`, so its synchronous
  // no-change exit can't wipe the state we're mid-way through.
  if (prev) prev.saveAndEnd()
  entry.begin()
}

export function exitDrag(entry: DragEntry) {
  if (current === entry) {
    current = null
    spApi.dragging = false
    syncEditingClass()
  }
}

/** Save + leave edit mode for the drag that is currently being edited. */
export function quitDragEditing() {
  if (!current) return
  // Explicit quit: stop restoring edit mode on any subsequent refresh.
  clearEditTarget()
  current.saveAndEnd()
}

// Navigating to a different slide ends the editing handoff: without this, the
// persisted target would silently re-enter edit mode when the user returns.
export function onDeckIndexChange() {
  clearEditTarget()
}

// Re-enter edit mode on `entry` if a refresh interrupted an editing session on
// it (same global editable index and slide). Returns true when restored.
export function tryRestoreEditing(entry: DragEntry): boolean {
  if (current) return false
  let target: { index?: number; slide?: number } | null = null
  try {
    const raw = sessionStorage.getItem(EDIT_TARGET_KEY)
    if (!raw) return false
    target = JSON.parse(raw)
  } catch {
    return false
  }
  if (!target || typeof target.index !== 'number' || target.index < 0) return false
  if (target.index !== entry.index || target.slide !== entry.slide) return false
  selectDrag(entry)
  return true
}