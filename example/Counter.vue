<template>
  <div class="sp-demo-counter">
    <p>Count: <strong>{{ c }}</strong></p>
    <div class="sp-demo-counter-btns">
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
    </div>
  </div>
</template>

<style scoped>
.sp-demo-counter {
  display: inline-block;
}
.sp-demo-counter-btns {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.sp-demo-counter-btns button {
  font-size: 1.5rem;
  padding: 0.5rem 1.2rem;
  border: 2px solid #3b82f6;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  min-width: 3rem;
}
.sp-demo-counter-btns button:hover {
  background: #3b82f6;
  color: #fff;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
}>(), { count: 0 })

const c = ref(props.count)

function increment() { c.value++ }
function decrement() { c.value-- }
</script>