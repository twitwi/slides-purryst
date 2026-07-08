<template>
  <div>
    <p>Count: <strong>{{ count }}</strong></p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
}>(), { count: 0 })

const c = ref(props.count)

function increment() { c.value++ }
function decrement() { c.value-- }
</script>