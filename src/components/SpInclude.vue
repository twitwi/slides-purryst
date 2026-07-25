<script setup lang="ts">
import { shallowRef, ref, watch, inject, nextTick, defineComponent, defineAsyncComponent, onUnmounted } from 'vue'
import type { Ref, Component } from 'vue'
import type { Transformer } from '../types'
import { getCachedInclude, preloadInclude } from '../composables/includeCache'
import { annotateEditableWithIndex, fixVoidElementsHtml } from '../composables/useSteps'
import SpAlternatives from './SpAlternatives.vue'
import SpAnim from './SpAnim.vue'
import SpDrag from './SpDrag.vue'
import SpImg from './SpImg.vue'
import SpStep from './SpStep.vue'
import SpStyle from './SpStyle.vue'
import SpToc from './SpToc.vue'
import SpSvg from './SpSvg.vue'

const contentVersion = inject<Ref<number>>('contentVersion')!
const customComponents = inject<Record<string, Component>>('sp-components', {} as Record<string, Component>)

const SpInclude = defineAsyncComponent(() => import('./SpInclude.vue'))

const props = withDefaults(defineProps<{
  src: string
  path?: string
  transformers?: Transformer[]
  noFixVoid?: boolean
}>(), {
  path: '',
  transformers: () => [],
  noFixVoid: false,
})

const error = ref('')
const comp = shallowRef<Component | null>(null)
const reloadTimer = ref<ReturnType<typeof setTimeout> | null>(null)

onUnmounted(() => {
  if (reloadTimer.value) clearTimeout(reloadTimer.value)
})

function processContent(text: string): string {
  if (!props.noFixVoid) text = fixVoidElementsHtml(text)
  text = annotateEditableWithIndex(text)
  const d = document.createElement('div')
  d.innerHTML = text
  if (props.path) {
    const el = d.querySelector(props.path)
    if (!el) return ''
    d.innerHTML = ''
    d.appendChild(el.cloneNode(true))
  }
  for (const fn of props.transformers) {
    fn(d)
  }
  return d.innerHTML
}

function buildComponent(html: string) {
  if (!html) {
    comp.value = null
    return
  }
  comp.value = defineComponent({
    template: `<div class="sp-include">${html}</div>`,
    components: {
      'sp-alternatives': SpAlternatives,
      'sp-anim': SpAnim,
      'sp-drag': SpDrag,
      'sp-img': SpImg,
      'sp-include': SpInclude,
      'sp-step': SpStep,
      'sp-style': SpStyle,
      'sp-toc': SpToc,
      'sp-svg': SpSvg,
      ...customComponents,
    },
  })
}

function notifyContentLoaded() {
  nextTick(() => {
    contentVersion.value++
  })
}

const srcRef = getCachedInclude(props.src)

watch(srcRef, async (val) => {
  if (val) {
    if (reloadTimer.value) {
      clearTimeout(reloadTimer.value)
      reloadTimer.value = null
    }
    error.value = ''
    buildComponent(processContent(val))
    notifyContentLoaded()
  } else if (val === undefined) {
    if (reloadTimer.value) return
    reloadTimer.value = setTimeout(() => {
      comp.value = null
      reloadTimer.value = null
    }, 500)
    try {
      await preloadInclude(props.src)
    } catch (err: any) {
      error.value = `${err.message} (src: ${props.src})`
      if (reloadTimer.value) {
        clearTimeout(reloadTimer.value)
        reloadTimer.value = null
      }
    }
  }
}, { immediate: true })
</script>

<template>
  <span style="display: none" :data-source-file-push="src"></span>
  <div v-if="error" class="sp-include-error">{{ error }}</div>
  <component :is="comp" v-else />
  <span style="display: none" data-source-file-pop=""></span>
</template>

<style scoped>
.sp-include { display: contents; }
.sp-include-error {
  padding: 0.5em;
  font-size: 0.85em;
  color: #ef4444;
}
</style>
