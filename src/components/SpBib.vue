<script setup lang="ts">
import SpInclude from './SpInclude.vue'

// A tiny wrapper for step-aware bibliographies. `<sp-bib src="…">` renders
// the include (the cached entry) inside the `.sp-bib` block; inline content
// (`<sp-bib>…</sp-bib>`) is wrapped as-is. The `.sp-bib` class is the marker
// used by the `bib` slide refinement.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src?: string
  path?: string
}>()
</script>

<template>
  <div class="sp-bib">
    <sp-include v-if="src" :src="src" :path="path" v-bind="$attrs" />
    <slot v-else />
  </div>
</template>
