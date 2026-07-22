import { reactive } from 'vue'
import type { AnimCommandHandler, ActionTypeHandler } from './animCommands'

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
  dragging: false,
  config: {} as Record<string, unknown>,
  _animCommands: {} as Record<string, AnimCommandHandler>,
  _animActionTypes: {} as Record<string, ActionTypeHandler>,
})

export const exportInitOptions: Record<string, unknown> = {}
