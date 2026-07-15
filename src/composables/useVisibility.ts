export function scanVisibility(container: HTMLElement, step: number) {
  const all = container.querySelectorAll<HTMLElement>('[data-sp-from]')
  for (const el of all) {
    const from = parseInt(el.getAttribute('data-sp-from') || '0', 10)
    el.classList.toggle('sp-anim-hidden', from > step)
    el.classList.toggle('sp-anim-shown', from <= step)
    //el.classList.toggle('sp-vis-hidden', from > step)
    //el.classList.toggle('sp-vis-shown', from <= step)
  }
}
