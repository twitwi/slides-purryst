import { watch, nextTick, type Ref } from 'vue'
import { registry } from '../plugin'

// Refinement driver: runs every registered slide refinement against every
// `.sp-slide` inside `root`, re-scheduled (post-flush, via nextTick) whenever
// the current slide, the current step, or the async content (includes) change.
export function useSlideRefinement(opts: {
  currentIndex: Ref<number>
  stepIndex: Ref<number>
  contentVersion: Ref<number>
  root: () => Element | null
}) {
  function run() {
    const root = opts.root()
    if (root) registry.refineAllSlides(root)
  }

  const schedule = () => nextTick(run)

  watch([opts.currentIndex, opts.stepIndex, opts.contentVersion], schedule, { flush: 'post' })
  schedule()

  return { run, schedule }
}