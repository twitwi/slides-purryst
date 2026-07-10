let highlighter: Awaited<ReturnType<typeof import('shiki')['createHighlighter']>> | null = null

let initPromise: Promise<void> | null = null

async function ensureHighlighter() {
  if (highlighter) return
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      const { createHighlighter } = await import('shiki')
      highlighter = await createHighlighter({
        langs: ['ts', 'js', 'tsx', 'jsx', 'html', 'css', 'json', 'bash', 'sh', 'python', 'rust', 'go', 'vue'],
        themes: ['dark-plus', 'material-theme'],
      })
    } catch {
      highlighter = null as never
    }
  })()
  return initPromise
}

function getLang(codeEl: HTMLElement): string | null {
  for (const cls of codeEl.classList) {
    if (cls.startsWith('language-')) return cls.slice('language-'.length)
    if (cls.startsWith('lang-')) return cls.slice('lang-'.length)
  }
  const parent = codeEl.closest('[class*="language-"]')
  if (parent) {
    for (const cls of parent.classList) {
      if (cls.startsWith('language-')) return cls.slice('language-'.length)
    }
  }
  return null
}

export async function highlightCode(html: string): Promise<string> {
  await ensureHighlighter()
  if (!highlighter) return html
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const pres = tmp.querySelectorAll('pre')
  for (const pre of pres) {
    const code = pre.querySelector('code')
    if (!code) continue
    const lang = getLang(code)
    if (!lang) continue
    const codeText = code.textContent || ''
    try {
      const result = highlighter.codeToHtml(codeText, {
        lang,
        theme: 'dark-plus',
      })
      pre.outerHTML = result
    } catch {}
  }
  return tmp.innerHTML
}

export function getHighlighterBundleSize(): string {
  return 'shiki (bundle-web) adds ~800KB to the bundle (see dist/ size comparison)'
}
