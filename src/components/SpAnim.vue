<template>
  <span class="sp-anim-ghost"></span>
</template>

<script setup lang="ts">
import { inject, ref, watch, onMounted, computed } from 'vue'
import type { Ref } from 'vue'

const contentVersion = inject<Ref<number>>('contentVersion', ref(0))

interface AnimAction {
  type: 'show' | 'hide' | 'addClass' | 'removeClass'
  selector: string
  className?: string
}

const props = defineProps<{ spec: string }>()
const stepIndex = inject<Ref<number>>('stepIndex')!

function parsePartActions(part: string): AnimAction[] {
  const actions: AnimAction[] = []
  const actionStrs = part.split('^').map(s => s.trim())
  for (const a of actionStrs) {
    if (a.startsWith('@add(')) {
      const comma = a.indexOf(',')
      if (comma !== -1) {
        const cls = a.slice(5, comma).trim()
        const sel = a.slice(comma + 1).replace(/\)\s*$/, '').trim()
        actions.push({ type: 'addClass', className: cls, selector: sel })
      }
    } else if (a.startsWith('@remove(')) {
      const comma = a.indexOf(',')
      if (comma !== -1) {
        const cls = a.slice(8, comma).trim()
        const sel = a.slice(comma + 1).replace(/\)\s*$/, '').trim()
        actions.push({ type: 'removeClass', className: cls, selector: sel })
      }
    } else if (a.startsWith('@+class ')) { // backward-compat
      const m = a.match(/^@\+class\s+(\S+)\s+(.+)$/)
      if (m) actions.push({ type: 'addClass', className: m[1], selector: m[2] })
    } else if (a.startsWith('@-class ')) { // backward-compat
      const m = a.match(/^@-class\s+(\S+)\s+(.+)$/)
      if (m) actions.push({ type: 'removeClass', className: m[1], selector: m[2] })
    } else if (a.startsWith('-')) {
      actions.push({ type: 'hide', selector: a.slice(1) })
    } else if (a.startsWith('@jump(')) {
      // handled by processHtml; no runtime action
    } else if (a.startsWith('@children(')) {
      const m = a.match(/^@children\((.+)\)$/)
      if (m) {
        expandChildren(m[1], actions)
      }
    } else {
      actions.push({ type: 'show', selector: a })
    }
  }
  return actions
}

function expandChildren(selector: string, dest: AnimAction[]) {
  const container = document.querySelector('.sp-slide') || document
  const parent = container.querySelector(selector) || document.querySelector(selector)
  if (parent) {
    for (let i = 0; i < parent.children.length; i++) {
      dest.push({ type: 'show', selector: `${selector} > :nth-child(${i + 1})` })
    }
  }
}

function getAllSelectors(parts: string[]): string[] {
  const result: string[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    const actionStrs = trimmed.split('^').map(s => s.trim())
    for (const a of actionStrs) {
      if (a.startsWith('@+class ') || a.startsWith('@-class ')) {
        const m = a.match(/^(?:@[+-]class\s+\S+\s+)(.+)$/)
        if (m) result.push(m[1])
      } else if (a.startsWith('-')) {
        result.push(a.slice(1))
      } else if (a.startsWith('@jump(')) {
        // noop
      } else if (a.startsWith('@children(')) {
        const m = a.match(/^@children\((.+)\)$/)
        if (m) result.push(m[1] + ' > *')
      } else if (!a.startsWith('@')) {
        result.push(a)
      }
    }
  }
  return result
}

const rawParts = computed(() => {
  return (props.spec || '').split('|')
})

const stepActions = computed<AnimAction[][]>(() => {
  if (!props.spec) return []
  const result: AnimAction[][] = []
  for (const part of rawParts.value) {
    const trimmed = part.trim()
    if (trimmed.startsWith('@children(')) {
      const actions: AnimAction[] = []
      expandChildren(trimmed.match(/^@children\((.+)\)$/)![1], actions)
      for (const a of actions) {
        result.push([a])
      }
    } else {
      result.push(parsePartActions(trimmed))
    }
  }
  return result
})

function applyAction(el: HTMLElement, action: AnimAction) {
  switch (action.type) {
    case 'show':
      el.classList.add('anim-shown')
      el.classList.remove('anim-hidden')
      break
    case 'hide':
      el.classList.add('anim-hidden')
      el.classList.remove('anim-shown')
      break
    case 'addClass':
      if (action.className) el.classList.add(action.className)
      break
    case 'removeClass':
      if (action.className) el.classList.remove(action.className)
      break
  }
}

function getContainer(): Element | Document {
  return document.querySelector('.sp-slide') || document
}

let previousStep = -1

function applyStep(step: number) {
  const actions = stepActions.value[step - 1]
  if (!actions) return
  const container = getContainer()
  for (const a of actions) {
    const targets = container.querySelectorAll<HTMLElement>(a.selector)
    for (const el of targets) {
      applyAction(el, a)
    }
  }
}

function reverseAction(el: HTMLElement, action: AnimAction) {
  switch (action.type) {
    case 'show':
      el.classList.add('anim-hidden')
      el.classList.remove('anim-shown')
      break
    case 'hide':
      el.classList.add('anim-shown')
      el.classList.remove('anim-hidden')
      break
    case 'addClass':
      if (action.className) el.classList.remove(action.className)
      break
    case 'removeClass':
      if (action.className) el.classList.add(action.className)
      break
  }
}

function reverseStep(step: number) {
  const actions = stepActions.value[step - 1]
  if (!actions) return
  const container = getContainer()
  for (const a of actions) {
    const targets = container.querySelectorAll<HTMLElement>(a.selector)
    for (const el of targets) {
      reverseAction(el, a)
    }
  }
}

watch(stepIndex, (curr) => {
  if (curr === previousStep) return
  if (curr > previousStep) {
    for (let s = previousStep + 1; s <= curr; s++) {
      applyStep(s)
    }
  } else {
    // Reverse steps (curr, previousStep] in reverse order, then re-apply 1..curr
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
  const allSelectors = getAllSelectors(rawParts.value)
  for (const sel of allSelectors) {
    const targets = container.querySelectorAll<HTMLElement>(sel)
    for (const el of targets) {
      if (el.hasAttribute('data-sp-from')) continue
      el.classList.add('anim-hidden')
      el.classList.remove('anim-shown')
    }
  }
  previousStep = 0
  for (let s = 1; s <= stepIndex.value; s++) {
    applyStep(s)
  }
  previousStep = stepIndex.value
}

onMounted(refresh)

watch(contentVersion, () => {
  refresh()
})
</script>
