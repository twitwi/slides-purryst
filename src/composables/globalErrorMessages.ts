
// a global store for error messages

import { ref } from 'vue'

export const maxGlobalErrorMessages = 10
export const globalErrorMessages = ref<string[]>([])

export function addGlobalErrorMessage(msg: string) {
  if (globalErrorMessages.value.length >= maxGlobalErrorMessages) {
    globalErrorMessages.value.shift()
  }
  globalErrorMessages.value.push(msg)
}

export function clearGlobalErrorMessages() {
  globalErrorMessages.value = []
}

export function removeGlobalErrorMessage(index: number = globalErrorMessages.value.length - 1) {
  if (index >= 0 && index < globalErrorMessages.value.length) {
    globalErrorMessages.value.splice(index, 1)
  }
}

