<template>
  <span class="sp-anim-ghost" ref="animEl"></span>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed } from 'vue'
import type { Ref } from 'vue'
import { getAnimCommand } from '../animCommands'
import type { AnimAction } from '../animCommands'
import type { AnimHandle } from '../types'
import { spApi } from '../sp-api'
import { addGlobalErrorMessage } from '../composables/globalErrorMessages'

const props = withDefaults(defineProps<{
  spec: string
  at?: string
  noJump?: boolean | string
}>(), {
  at: '+0',
  noJump: false,
})

const globalStepIndex = inject<Ref<number>>('stepIndex')!
const animInstances = inject<Set<AnimHandle>>('animInstances')!

const animEl = ref<HTMLElement | null>(null)

function getTargetStep() {
  if (!animEl) return globalStepIndex.value
  const dfs = getContainer().querySelector("[data-fixed-step]")?.getAttribute('data-fixed-step')
  if (dfs === undefined || dfs === null) return globalStepIndex.value
  return parseInt(dfs)
}

function parseActionStr(a: string): AnimAction[] {
  // time delay prefix, e.g. 100ms .stuff, 0.5s @show(#id)
  const mDelay = a.match(/^(\d+(?:\.\d+)?)(ms|s)\s+(.+)$/)
  if (mDelay) {
    const delay = parseFloat(mDelay[1]) * (mDelay[2] === 's' ? 1000 : 1)
    const rest = mDelay[3]
    const actions = parseActionStr(rest)
    for (const act of actions) {
      act.delayedBy = delay
    }
    return actions
  }
  // @stuff, @stuff(args)
  const m = a.match(/^@(\w+)(?:\((.*)\))?$/)
  if (m) {
    const cmd = getAnimCommand(m[1])
    if (cmd) return cmd.parse(m[2] ?? '')
  }
  if (a.startsWith('-')) {
    return [{ type: 'hide', selector: a.slice(1) }]
  }
  return [{ type: 'show', selector: a }]
}

function parsePartActions(part: string): AnimAction[] {
  const actions: AnimAction[] = []
  const actionStrs = part.split('^').map(s => s.trim())
  for (const a of actionStrs) {
    actions.push(...parseActionStr(a))
  }
  return actions
}

const rawParts = computed(() => {
  return (props.spec || '').split('|')
})

function getAtOffset(): number {
  const at = props.at || '+0'
  if (at.startsWith('+') || at.startsWith('-')) {
    throw new Error("Relative at offset not supported in SpAnim, absolute at should be produced by useSteps")
  }
  return parseInt(at, 10)
}

const stepActions = computed<AnimAction[][]>(() => {
  if (!props.spec) return []
  const result: AnimAction[][] = []
  for (const part of rawParts.value) {
    const trimmed = part.trim()
    const m = trimmed.match(/^@(\w+)\((.+)\)$/)
    if (m) {
      const cmd = getAnimCommand(m[1])
      if (cmd?.expand) { // typically @children(...), actually disallow with ^ then
        const expanded = cmd.expand(m[2], getContainer())
        for (const stepActions of expanded) {
          result.push(stepActions)
        }
        continue
      }
    }
    result.push(parsePartActions(trimmed))
  }
  return result
})

function getContainer(): Element {
  let el = animEl.value
  if (!el) throw "not yet"
  while (!el.classList.contains('sp-slide')) {
    el = el.parentElement
    if (el === null) throw "should not happen: .sp-anim-ghost has no .sp-slide ancestor"
  }
  return el
}

let previousStep = -1

// Pending `setTimeout`s scheduled by delayed (`100ms …`) actions, grouped by
// step. Any rebuild / step undo must clear them so a stale delayed apply can't
// fire after we stepped away from the step that scheduled it.
const stepTimeouts = new Map<number, number[]>()

function clearPendingTimeouts() {
  for (const ids of stepTimeouts.values()) {
    for (const id of ids) clearTimeout(id)
  }
  stepTimeouts.clear()
}

function applyStep(step: number, fast = false) {
  const atOffset = getAtOffset()
  const actions = stepActions.value[step - atOffset - 1]
  if (!actions) return
  const container = getContainer()
  const sorted = [...actions].sort((a, b) => (a.delayedBy ?? 0) - (b.delayedBy ?? 0))
  for (const a of sorted) {
    const handler = spApi._animActionTypes[a.type]
    if (!handler) continue
    if (a.delayedBy && !fast) {
      const id = setTimeout(() => {
        try {
          handler.apply(container, a)
        } catch (e) {
          console.error('(Caught) Error applying anim action:', e)
          addGlobalErrorMessage(`Error applying anim action at step ${step}: ${e}`)
        }
      }, a.delayedBy)
      const existing = stepTimeouts.get(step) ?? []
      existing.push(id)
      stepTimeouts.set(step, existing)
    } else {
      try {
        handler.apply(container, a)
      } catch (e) {
        console.error('(Caught) Error applying anim action:', e)
        addGlobalErrorMessage(`Error applying anim action at step ${step}: ${e}`)
      }
    }
  }
}

function initAll(container: Element) {
  // Flat list of every action, in spec order. The init pass runs it in REVERSE:
  // each built-in init is an absolute state setter, so the last one invoked wins
  // — which makes the spec's FIRST action targeting an element/class decide its
  // step-0 baseline (e.g. `@add…@remove` on a class ⇒ baseline "class absent").
  const all: AnimAction[] = []
  for (const actions of stepActions.value) {
    all.push(...actions)
  }
  for (const action of all.reverse()) {
    try {
      const handler = spApi._animActionTypes[action.type]
      handler?.init?.(container, action)
    } catch (e) {
      console.error('(Caught) Error initializing anim action:', e)
      addGlobalErrorMessage(`Error initializing anim action: ${e}`)
    }
  }
}

// Full state rebuild: resets the baseline (init), then re-applies every step up
// to `step`. Guarantees a deterministic "script" state regardless of the
// navigation path taken to reach it.
function rebuildTo(step: number, fast: boolean) {
  const container = getContainer()
  clearPendingTimeouts()
  initAll(container)
  for (let s = 1; s <= step; s++) {
    applyStep(s, fast)
  }
}

function syncToStep(step: number, fast: boolean) {
  if (step === previousStep) return
  if (step > previousStep) {
    for (let s = previousStep + 1; s <= step; s++) {
      applyStep(s, fast) // TODO maybe fast || s < step
    }
  } else {
    rebuildTo(step, true)
  }
  previousStep = step
}

function refresh(fast = true) {
  const curr = getTargetStep()
  rebuildTo(curr, fast)
  previousStep = curr
}

onMounted(() => {
  const handle: AnimHandle = { syncToStep, refresh }
  animInstances.add(handle)
  refresh()
  onUnmounted(() => {
    clearPendingTimeouts()
    animInstances.delete(handle)
  })
})
</script>
