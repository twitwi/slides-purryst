// Optimistic patch layer for drag edits.
//
// When a drag write POSTs successfully, the source file on disk already holds
// the new `at` value, but the browser only learns about it once the dev-server
// SSE refresh lands. Between those two moments the in-app "source snapshot"
// (rawSlideSources, the template we parse slides from, and every drag baseline
// that reads props) is stale. This module records those committed-but-unseen
// writes and re-applies them on top of any content, so the app stays coherent
// even before the refresh arrives — and self-heals when the payload races
// ahead of a write.

import { ref } from 'vue'
import { extractRawSlideSources } from './useSlides'

// editableIndex -> committed `at="x|y|w|h|r"` string of the latest POSTed
// write that has not yet been confirmed by a refresh payload. The editable
// index is globally unique (annotateEditableWithIndex counts sp-drag|sp-slide
// across the deck) and stable across per-drag `at` edits.
const pending = new Map<number, string>()

// The most recent resolved full-deck template (the form the refresh will
// serve). Snapshot views re-derive from it through applyOptimistic() so they
// stay coherent during the pre-refresh window.
export const lastResolvedTemplate = ref('')

// One-way hook so the snapshot owner (SpPresentation) can re-derive
// rawSlideSources the moment a write confirms, without an import cycle.
let snapshotSyncer: (() => void) | null = null
export function setOptimisticSnapshotSyncer(fn: () => void) {
  snapshotSyncer = fn
}

/** Record a POST-confirmed write and re-sync the snapshot views. */
export function noteOptimisticWrite(index: number, newAt: string) {
  pending.set(index, newAt)
  snapshotSyncer?.()
}

export function resolveOptimisticAt(index: number): string | null {
  return pending.get(index) ?? null
}

export interface OptimisticDragAttrs {
  x: number
  y: number
  w: number | string
  h: number | string
  rotate: number
}

// Normalize a stored `at` value that may be bare (`x|y|w|h|r`) or wrapped in
// `at="..."` (legacy/defensive) into its bare form before parsing/comparing.
function stripAtWrap(s: string): string {
  return s.replace(/^at="|"$/g, '')
}

/** The committed optimistic `at` parsed into fields, or null if not pending. */
export function optimisticParseAt(index: number): OptimisticDragAttrs | null {
  const at = pending.get(index)
  if (!at) return null
  const parts = stripAtWrap(at).split('|')
  if (parts.length < 5) return null
  return {
    x: parseFloat(parts[0]) || 0,
    y: parseFloat(parts[1]) || 0,
    w: parts[2],
    h: parts[3],
    rotate: parseFloat(parts[4]) || 0,
  }
}

// Counts editable elements (sp-drag AND sp-slide) in document order, exactly
// like annotateEditableWithIndex and edit-handler.mjs, and requires the
// `editableIndex`-th one to be an sp-drag.
const EDITABLE_TAG_RE = /<(sp-drag|sp-slide)(\s[^>]*)?(\/?)>/gi

function findDragBlock(source: string, editableIndex: number): { start: number; end: number; slice: string } | null {
  let count = 0
  let match: RegExpExecArray | null
  EDITABLE_TAG_RE.lastIndex = 0
  while ((match = EDITABLE_TAG_RE.exec(source)) !== null) {
    if (count === editableIndex) {
      if (match[1] !== 'sp-drag') return null
      const start = match.index
      const close = source.indexOf('</sp-drag>', start)
      if (close === -1) return null
      return { start, end: close, slice: source.slice(start, close) }
    }
    count++
  }
  return null
}

function currentAtOf(source: string, editableIndex: number): string | null {
  const block = findDragBlock(source, editableIndex)
  if (!block) return null
  const m = block.slice.match(/(?:^|\s)at="([^"]*)"/)
  return m ? m[1] : ''
}

// Set the `at` of the editableIndex-th sp-drag to `newAt`, mirroring the
// string op edit-handler.mjs does server-side. Returns the original source
// unchanged when the block can't be located or is already correct.
function patchAt(source: string, editableIndex: number, newAt: string): string {
  const block = findDragBlock(source, editableIndex)
  if (!block) return source
  const cleanAt = stripAtWrap(newAt)
  let updated: string
  if (/ at=/.test(block.slice)) {
    const atRe = /(<sp-drag\s[^>]*?\bat=)"[^"]*"/i
    const m = atRe.exec(block.slice)
    if (!m) return source
    updated = block.slice.replace(m[0], `${m[1]}"${cleanAt}"`)
  } else {
    const openRe = /<sp-drag\b([^>]*?)(\/?\s*>)/i
    const m = openRe.exec(block.slice)
    if (!m) return source
    updated = block.slice.replace(openRe, `<sp-drag${m[1]} at="${cleanAt}"${m[2]}`)
  }
  if (updated === block.slice) return source
  return source.slice(0, block.start) + updated + source.slice(block.end)
}

/** Apply every pending optimistic write onto a template string. */
export function applyOptimistic(source: string): string {
  let s = source
  for (const [index, newAt] of pending) {
    const after = patchAt(s, index, newAt)
    if (after !== s) s = after
  }
  return s
}

// The incoming refresh payload is authoritative. Entries whose drag block
// already carries the committed `at` are confirmed and dropped; the rest are
// kept and topped back up so the snapshot never regresses below committed
// values when the payload raced ahead of a write.
export function reconcileOptimistic(source: string): string {
  for (const index of Array.from(pending.keys())) {
    const newAt = pending.get(index)
    if (newAt != null && stripAtWrap(currentAtOf(source, index) ?? '') === stripAtWrap(newAt)) {
      pending.delete(index)
    }
  }
  return applyOptimistic(source)
}

/** Re-derive the snapshot views from the last known template. */
export function syncOptimisticSnapshot() {
  if (snapshotSyncer) snapshotSyncer()
}

/** Raw slide sources with pending optimistic writes applied. */
export function optimisticRawSlideSources(): string[] {
  return extractRawSlideSources(applyOptimistic(lastResolvedTemplate.value))
}
