import { ref, computed, type Ref } from 'vue'
import type { SlideData } from '../types'

let defaultClicksAt = 1

export function setDefaultClicksAt(value: number) {
  defaultClicksAt = value
}

function countAnimSpecParts(spec: string, htmlForQuery?: string): number {
  if (!spec.trim()) return 0
  const parts = spec.split('|').map(s => s.trim())
  let count = 0
  for (const part of parts) {
    const childMatch = part.match(/^@children\((.+)\)$/)
    if (childMatch && htmlForQuery) {
      const tmp = document.createElement('div')
      tmp.innerHTML = htmlForQuery
      const parent = tmp.querySelector(childMatch[1])
      count += parent ? Math.max(1, parent.children.length) : 1
    } else {
      count += 1
    }
  }
  return count
}

function computeAnimVisStepChange(spec: string): number {
  const parts = spec.split('|').map(s => s.trim())
  let total = 0
  for (const part of parts) {
    const jumpMatch = part.match(/^@jump\((-?\d+)\)/)
    if (jumpMatch) {
      total += parseInt(jumpMatch[1], 10)
    }
  }
  return total
}

export function buildSteps(slide: SlideData | null) {
  if (!slide) return 0
  const html = slide.html
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  let maxStep = 0

  // Count sp-pause elements
  const pauses = tmp.querySelectorAll('sp-pause').length
  maxStep = Math.max(maxStep, pauses)

  // Count sp-step elements
  tmp.querySelectorAll('sp-step').forEach((s) => {
    const at = parseInt(s.getAttribute('at') || '0', 10)
    maxStep = Math.max(maxStep, at)
    // Account for from/to range
    const to = s.getAttribute('to')
    if (to) {
      maxStep = Math.max(maxStep, parseInt(to, 10) - 1)
    }
    const from = s.getAttribute('from')
    if (from) {
      maxStep = Math.max(maxStep, parseInt(from, 10))
    }
  })

  // Count sp-anim spec parts
  tmp.querySelectorAll('sp-anim').forEach(a => {
    const spec = a.getAttribute('spec') || ''
    maxStep += countAnimSpecParts(spec, html)
  })

  // Count sp-alternatives
  tmp.querySelectorAll('sp-alternatives').forEach(a => {
    const at = parseInt(a.getAttribute('at') || '0', 10)
    const children = a.children.length
    maxStep = Math.max(maxStep, at + children)
  })

  // Count sp-clicks wrapper
  tmp.querySelectorAll('sp-clicks').forEach(c => {
    const at = parseInt(c.getAttribute('at') || String(defaultClicksAt), 10)
    const every = parseInt(c.getAttribute('every') || '1', 10)
    const children = c.children.length
    if (children > 0) {
      const lastStep = at + Math.ceil(children / every) - 1
      maxStep = Math.max(maxStep, lastStep)
    }
  })

  // Count sp-track elements (for sp-meanwhile)
  tmp.querySelectorAll('[sp-track]').forEach(track => {
    const trackSteps = buildSteps({ html: track.innerHTML } as SlideData)
    maxStep = Math.max(maxStep, trackSteps)
  })

  return maxStep + 1
}

function stripAnimHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  let visStep = 0

  function walk(parent: Element) {
    const children = Array.from(parent.children)
    const toRemove: Element[] = []

    for (const el of children) {
      const tag = el.tagName.toLowerCase()

      if (tag === 'sp-pause') {
        visStep += 1
        toRemove.push(el)
        continue
      }

      if (tag === 'sp-step') {
        // Keep sp-step — SpStep.vue handles visibility via CSS classes
        walk(el)
        continue
      }

      if (tag === 'sp-anim') {
        const spec = el.getAttribute('spec') || ''
        visStep += computeAnimVisStepChange(spec)
        continue
      }

      if (tag === 'sp-style') continue

      // Wrap elements after pause in sp-step for unified visibility
      if (visStep > 0 && tag !== 'sp-step') {
        const step = document.createElement('sp-step')
        step.setAttribute('at', String(visStep))
        step.appendChild(el.cloneNode(true))
        toRemove.push(el)
        parent.insertBefore(step, el)
      }

      walk(el)
    }

    for (const el of toRemove) {
      el.remove()
    }
  }

  walk(tmp)
  return tmp.innerHTML
}

function processAfterModifier(tmp: Element) {
  let lastAt = 0
  const walk = (parent: Element) => {
    const children = Array.from(parent.children)
    for (const el of children) {
      const tag = el.tagName.toLowerCase()
      
      if (tag === 'sp-step') {
        const after = el.getAttribute('after')
        if (after !== null) {
          // Replace "after" with the last known at value
          el.setAttribute('at', String(lastAt))
          el.removeAttribute('after')
        } else {
          const at = parseInt(el.getAttribute('at') || '0', 10)
          lastAt = at
        }
      }
      
      walk(el)
    }
  }
  walk(tmp)
}

function processClicksWrapper(tmp: Element) {
  tmp.querySelectorAll('sp-clicks').forEach(clicks => {
    const at = parseInt(clicks.getAttribute('at') || String(defaultClicksAt), 10)
    const every = parseInt(clicks.getAttribute('every') || '1', 10)
    const animation = clicks.getAttribute('animation') || ''
    const tag = clicks.getAttribute('tag') || 'div'
    const children = Array.from(clicks.children)
    
    const handledAttrs = new Set(['at', 'every', 'animation', 'tag'])
    const wrapper = document.createElement(tag)
    wrapper.setAttribute('sp-clicks-wrapper', '')
    
    // Forward all non-handled attributes
    for (const attr of Array.from(clicks.attributes)) {
      if (!handledAttrs.has(attr.name)) {
        wrapper.setAttribute(attr.name, attr.value)
      }
    }
    
    children.forEach((child, i) => {
      const step = document.createElement('sp-step')
      step.setAttribute('at', String(at + Math.floor(i / every)))
      if (animation) step.setAttribute('animation', animation)
      step.appendChild(child.cloneNode(true))
      wrapper.appendChild(step)
    })
    
    clicks.replaceWith(wrapper)
  })
}

function processMeanwhile(tmp: Element) {
  // Find all sp-meanwhile elements and convert to parallel tracks
  const meanwhileEls = tmp.querySelectorAll('sp-meanwhile')
  if (meanwhileEls.length === 0) return
  
  // Group content by tracks
  // Content before first meanwhile = track 1
  // Content after first meanwhile = track 2
  // etc.
  
  const tracks: Element[][] = [[]]
  let currentTrack = 0
  
  const walk = (parent: Element) => {
    const children = Array.from(parent.children)
    for (const el of children) {
      const tag = el.tagName.toLowerCase()
      
      if (tag === 'sp-meanwhile') {
        currentTrack++
        tracks.push([])
        continue
      }
      
      tracks[currentTrack].push(el)
    }
  }
  
  walk(tmp)
  
  // Clear parent and add tracks
  while (tmp.firstChild) {
    tmp.removeChild(tmp.firstChild)
  }
  
  tracks.forEach((trackElements, index) => {
    if (trackElements.length === 0) return
    
    const trackDiv = document.createElement('div')
    trackDiv.setAttribute('sp-track', String(index + 1))
    
    trackElements.forEach(el => {
      trackDiv.appendChild(el.cloneNode(true))
    })
    
    tmp.appendChild(trackDiv)
  })
}

export function processHtml(html: string, stepIndex: number): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  // Process sp-clicks wrapper
  processClicksWrapper(tmp)
  
  // Process "after" modifier in sp-step
  processAfterModifier(tmp)
  
  // Process sp-meanwhile for parallel tracks
  processMeanwhile(tmp)

  // Anim mode: full DOM, no pause splitting
  if (tmp.querySelector('sp-anim')) {
    return stripAnimHtml(tmp.innerHTML)
  }

  // Legacy pause splitting
  const pauses = tmp.querySelectorAll('sp-pause')
  if (pauses.length > 0) {
    pauses.forEach((el) => {
      el.replaceWith(document.createComment('sp-pause'))
    })
    const parts = tmp.innerHTML.split(/<!--\s*sp-pause\s*-->/)
    return parts.slice(0, stepIndex + 1).join('')
  }

  return tmp.innerHTML
}

export function useSteps() {
  const stepIndex: Ref<number> = ref(0)
  const totalSteps: Ref<number> = ref(1)
  const isFirstStep = computed(() => stepIndex.value === 0)
  const isLastStep = computed(() => totalSteps.value <= 1 || stepIndex.value >= totalSteps.value - 1)

  function build(slide: SlideData | null) {
    totalSteps.value = buildSteps(slide)
  }

  function nextStep() {
    if (stepIndex.value < totalSteps.value - 1) {
      stepIndex.value++
    }
  }

  function prevStep() {
    if (stepIndex.value > 0) {
      stepIndex.value--
    }
  }

  return {
    stepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    buildSteps: build,
    processHtml,
  }
}
