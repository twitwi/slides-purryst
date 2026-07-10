import { reactive } from 'vue'

export const spApi = reactive({
  navLocked: false,
  currentIndex: 0,
  stepIndex: 0,
  total: 0,
  effectiveLast: 0,
  effectiveTotal: 0,
  fakeEndIndices: [] as number[],
  toggleNavLock: () => {},
  goTo: (_n: number) => {},
  next: () => {},
  prev: () => {},
  nextSlide: () => {},
  prevSlide: () => {},
  export: () => {},
})

export const exportInitOptions: Record<string, unknown> = {}
