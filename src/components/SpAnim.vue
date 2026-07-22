<template>
  <span class="sp-anim-ghost" ref="animEl"></span>
</template>

<script setup lang="ts">
import { inject, ref, watch, onMounted, computed } from 'vue'
import type { Ref } from 'vue'
import { getAnimCommand } from '../animCommands'
import type { AnimAction } from '../animCommands'
import { spApi } from '../sp-api'

const contentVersion = inject<Ref<number>>('contentVersion', ref(0))

const props = withDefaults(defineProps<{
  spec: string
  at?: string
  noJump?: boolean | string
}>(), {
  at: '+0',
  noJump: false,
})
const globalStepIndex = inject<Ref<number>>('stepIndex')!

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
    if (el === null) throw "should not happen"
  }
  return el
}

let previousStep = -1

function applyStep(step: number) {
  const atOffset = getAtOffset()
  const actions = stepActions.value[step - atOffset - 1]
  if (!actions) return
  const container = getContainer()
  for (const a of actions) {
    const handler = spApi._animActionTypes[a.type]
    if (handler) {
      //console.log("Applying action", a, "at step", step, "in container", container, "with delayedBy", a.delayedBy)
      if (a.delayedBy) {
        setTimeout(() => {
          handler.apply(container, a)
        }, a.delayedBy)
      } else {
        handler.apply(container, a)
      }
    }
  }
}

function reverseStep(step: number) {
  const atOffset = getAtOffset()
  const actions = stepActions.value[step - atOffset - 1]
  if (!actions) return
  const container = getContainer()
  for (const a of actions) {
    const handler = spApi._animActionTypes[a.type]
    if (handler) {
      handler.reverse(container, a)
    }
  }
}

watch(globalStepIndex, (curr) => {
  curr = getTargetStep()
  if (curr === previousStep) return
  if (curr > previousStep) {
    for (let s = previousStep + 1; s <= curr; s++) {
      applyStep(s)
    }
  } else {
    for (let s = previousStep; s > curr; s--) {
      reverseStep(s)
    }
    for (let s = 1; s <= curr; s++) {
      applyStep(s)
    }
  }
  previousStep = curr
})

function refresh() {
  const container = getContainer()
  for (const actions of stepActions.value) {
    for (const action of actions) {
      const handler = spApi._animActionTypes[action.type]
      handler?.init?.(container, action)
    }
  }
  const curr = getTargetStep()
  previousStep = 0
  for (let s = 1; s <= curr; s++) {
    applyStep(s)
  }
  previousStep = curr
}

onMounted(refresh)

watch(contentVersion, () => {
  refresh()
})
</script>
