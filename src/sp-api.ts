import { reactive } from 'vue'

export const spApi = reactive({
  navLocked: false,
  currentIndex: 0,
  stepIndex: 0,
  total: 0,
  toggleNavLock: () => {},
  goTo: (_n: number) => {},
  next: () => {},
  prev: () => {},
  nextSlide: () => {},
  prevSlide: () => {},
})
