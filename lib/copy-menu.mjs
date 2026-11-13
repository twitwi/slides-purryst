// Dependency-free arrow-key "checkbox list" for the CLI: no package, and only
// two terminal features — raw mode plus "move up N lines, erase to end of line"
// — so it works in every terminal that can do raw mode, including the plain
// ones where a full-screen redraw is not available.
//
// It knows nothing about copying: it is given items to tick and returns the
// ones the user kept. See `bundles` in bin/cli.mjs for the caller.
//
// The block is `items + 3` lines tall and re-drawn in place, so it must stay
// shorter than the terminal and its lines shorter than the width: both are
// enforced (one line per item, everything truncated).

import readline from 'node:readline'

const LEGEND = '↑↓ move · space/1-9 toggle · a all · n none · q quit · Enter copies'

/**
 * Shows a navigable, toggleable list and waits for the user.
 *
 * @param {string} question - shown on the first line (usually the destination).
 * @param {Array<{id: string, label: string, hint?: string, detail?: string, checked?: boolean}>} items
 * @returns {Promise<string[] | null>} the checked ids, in the order given, or
 *          null when the user aborts (q, Esc or Ctrl-C). Without a terminal it
 *          does not draw and resolves the `checked` flags as-is, so the caller
 *          stays in control (bin/cli.mjs refuses --copy there anyway).
 */
export function pickItems(question, items) {
  const input = process.stdin
  const output = process.stdout
  const checked = new Set(items.filter((it) => it.checked).map((it) => it.id))
  if (!input.isTTY || !output.isTTY || items.length === 0) {
    return Promise.resolve(items.filter((it) => checked.has(it.id)).map((it) => it.id))
  }

  const width = Math.max(...items.map((it) => it.label.length), 1)
  const indent = ' '.repeat(6 + width)
  let active = 0
  let drawn = 0 // lines the previous render occupied; 0 means "not yet drawn"

  const fit = (line) => {
    const cols = output.columns || 80
    return line.length > cols ? `${line.slice(0, Math.max(cols - 1, 1))}…` : line
  }
  const selected = () => items.filter((it) => checked.has(it.id)).map((it) => it.id)

  const block = () => {
    const lines = [`${question}  (${LEGEND})`]
    items.forEach((it, i) => {
      const nav = i === active ? '>' : ' '
      lines.push(`${nav} ${checked.has(it.id) ? '[x]' : '[ ]'} ${it.label.padEnd(width)}  ${it.hint ?? ''}`)
    })
    // Only the item under the cursor expands, which keeps the height constant.
    lines.push(items[active].detail ? `${indent}→ ${items[active].detail}` : '')
    const names = selected().map((id) => items.find((it) => it.id === id).label)
    lines.push(`  selected: ${names.length ? names.join(', ') : 'nothing'}`)
    return lines.map(fit)
  }

  const draw = () => {
    const lines = block()
    // Up to the first line of the previous render (never above the screen: a
    // block taller than the terminal would scroll, which is why it is compact).
    if (drawn) output.write(`\u001b[${drawn}A`)
    // \x1b[K per line, so a shorter render leaves nothing behind.
    output.write(lines.map((l) => `${l}\u001b[K`).join('\r\n') + '\r\n')
    drawn = lines.length
  }

  return new Promise((resolve) => {
    const finish = (result) => {
      input.removeListener('keypress', onKey)
      output.removeListener('resize', onResize)
      if (input.isTTY) input.setRawMode(false)
      input.pause()
      output.write('\u001b[?25h') // bring the cursor back
      resolve(result)
    }
    // A resize only changes the width we truncate to; the block is always
    // items + 3 lines, so moving up `drawn` lines stays correct.
    const onResize = draw
    const toggle = (i) => {
      if (i < 0 || i >= items.length) return
      active = i
      const id = items[i].id
      if (checked.has(id)) checked.delete(id)
      else checked.add(id)
    }
    const move = (delta) => {
      active = (active + delta + items.length) % items.length
    }

    const onKey = (str, key) => {
      if (!key?.name) return
      if (key.ctrl && key.name === 'c') return finish(null)
      if (key.name === 'escape' || key.name === 'q') return finish(null)
      if (key.name === 'return' || key.name === 'enter') return finish(selected())
      if (key.name === 'up' || key.name === 'k') move(-1)
      else if (key.name === 'down' || key.name === 'j') move(1)
      else if (key.name === 'space') toggle(active)
      else if (key.name === 'a') for (const it of items) checked.add(it.id)
      else if (key.name === 'n') checked.clear()
      else if (/^[1-9]$/.test(key.name)) toggle(Number(key.name) - 1)
      else return // anything else is a no-op, not an error
      draw()
    }

    output.write('\u001b[?25l') // hide the cursor while we own this screen area
    readline.emitKeypressEvents(input)
    input.setRawMode(true)
    output.on('resize', onResize)
    input.on('keypress', onKey)
    draw()
  })
}
