<template>
  <div class="sp-go-prompt" @click.self="$emit('close')">
    <div class="sp-go-prompt-box">
      <input
        ref="goPromptInput"
        v-model="goPromptValue"
        class="sp-go-prompt-input"
        placeholder="slide number or search text…"
        @keydown.enter="handleGoSubmit"
        @keydown.escape="$emit('close')"
        @keydown.down.prevent="selectNext"
        @keydown.up.prevent="selectPrev"
      />
      <div v-if="goPromptResults.length" class="sp-go-results">
        <div
          v-for="(r, i) in goPromptResults"
          :key="r.index"
          class="sp-go-result"
          :class="{ focused: i === goPromptFocused }"
          @click="goToResult(r.index)"
          @mouseenter="goPromptFocused = i"
        >
          <div class="sp-go-result-thumb">
            <div :style="goResultScaleStyle">
              <SpSlide
                :slide="slides[r.index]"
                :html="overviewHtmls[r.index]"
                :components="components"
              />
            </div>
          </div>
          <div class="sp-go-result-text">
            <div class="sp-go-result-num">Slide {{ r.index + 1 }}</div>
            <div v-for="(t, ti) in r.matches" :key="ti" class="sp-go-result-heading" v-html="highlight(t)"></div>
          </div>
        </div>
      </div>
      <div v-else-if="goPromptValue && !/^\d*$/.test(goPromptValue)" class="sp-go-no-results">
        No slides match "{{ goPromptValue }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { SlideData } from '../types'
import SpSlide from './SpSlide.vue'

const props = defineProps<{
  slides: SlideData[]
  overviewHtmls: string[]
  designWidth: number
  designHeight: number
  components: Record<string, any>
  total: number
}>()

const emit = defineEmits<{
  close: []
  select: [index: number]
}>()

const goPromptValue = ref('')
const goPromptFocused = ref(0)
const goPromptInput = ref<HTMLInputElement | null>(null)

interface SlideHeading {
  index: number
  texts: string[]
}

interface GoResult {
  index: number
  matches: string[]
}

const slideSearchIndex = computed<SlideHeading[]>(() => {
  return props.slides.map((s, i) => {
    const d = document.createElement('div')
    d.innerHTML = s.html
    const texts: string[] = []
    d.querySelectorAll('h1,h2,h3').forEach(el => {
      const t = el.textContent?.trim()
      if (t) texts.push(t)
    })
    return { index: i, texts }
  })
})

const goPromptResults = computed<GoResult[]>(() => {
  const val = goPromptValue.value.trim().toLowerCase()
  if (!val || /^\d+$/.test(val)) return []
  const results: GoResult[] = []
  for (const entry of slideSearchIndex.value) {
    const matches: string[] = []
    for (const t of entry.texts) {
      if (t.toLowerCase().includes(val)) {
        matches.push(t)
      }
    }
    if (matches.length) {
      results.push({ index: entry.index, matches })
    }
  }
  return results
})

watch(goPromptResults, () => { goPromptFocused.value = 0 })

const goResultScaleStyle = computed(() => {
  const s = 210 / props.designWidth
  return {
    transform: `scale(${s})`,
    transformOrigin: 'top left',
    width: props.designWidth + 'px',
    height: props.designHeight + 'px',
  }
})

function highlight(text: string): string {
  const q = goPromptValue.value.trim()
  if (!q) return escapeHtml(text)
  const lower = text.toLowerCase()
  const qLower = q.toLowerCase()
  const parts: string[] = []
  let pos = 0
  while (pos < text.length) {
    const idx = lower.indexOf(qLower, pos)
    if (idx === -1) {
      parts.push(escapeHtml(text.slice(pos)))
      break
    }
    parts.push(escapeHtml(text.slice(pos, idx)))
    parts.push('<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>')
    pos = idx + q.length
  }
  return parts.join('')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function selectNext() {
  if (goPromptFocused.value < goPromptResults.value.length - 1) {
    goPromptFocused.value++
  }
}

function selectPrev() {
  if (goPromptFocused.value > 0) {
    goPromptFocused.value--
  }
}

function handleGoSubmit() {
  const val = goPromptValue.value.trim()
  if (!val) return

  if (/^\d+$/.test(val)) {
    const num = parseInt(val, 10)
    if (num >= 1 && num <= props.total) {
      emit('select', num - 1)
    }
    return
  }

  if (goPromptResults.value.length > 0) {
    const idx = goPromptResults.value[goPromptFocused.value]?.index ?? goPromptResults.value[0].index
    emit('select', idx)
  }
}

function goToResult(idx: number) {
  emit('select', idx)
}

onMounted(() => {
  nextTick(() => goPromptInput.value?.focus())
})
</script>
