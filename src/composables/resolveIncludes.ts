import { getCachedInclude } from './includeCache'
import { annotateEditableWithIndex, fixVoidElementsHtml } from './useSteps'

async function fetchCached(src: string): Promise<string> {
  const ref = getCachedInclude(src)
  if (ref.value !== undefined) return ref.value
  try {
    const res = await fetch(src)
    if (!res.ok) return ''
    const text = await res.text()
    ref.value = text
    return text
  } catch {
    return ''
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function resolveTopIncludes(
  html: string,
  visited: Set<string> = new Set(),
  path: string = window.location.pathname
): Promise<string> {
  const SP_INCLUDE_RE = /<sp-include\s[^>]*?src="([^"]*)"[^>]*?\/>/g

  const candidates: { src: string; index: number }[] = []
  let match: RegExpExecArray | null
  while ((match = SP_INCLUDE_RE.exec(html)) !== null) {
    candidates.push({ src: match[1], index: match.index })
  }

  if (candidates.length === 0) return html

  const topLevel = candidates.filter(({ index }) => {
    const before = html.slice(0, index)
    const opens = (before.match(/<sp-slide[\s>]/g) || []).length
    const closes = (before.match(/<\/sp-slide>/g) || []).length
    return opens === closes
  })

  const toFetch = topLevel.filter(({ src }) => !visited.has(src))
  if (toFetch.length === 0) return html

  const results = await Promise.all(
    toFetch.map(async ({ src }) => {
      visited.add(src)
      try {
        let content = await fetchCached(src)
        content = fixVoidElementsHtml(content)
        content = annotateEditableWithIndex(content)
        return { src, content: await resolveTopIncludes(content, visited, src) }
      } catch {
        return { src, content: '' }
      }
    })
  )

  let result = html
  for (const { src, content } of results) {
    if (!content) continue
    const re = new RegExp(`<sp-include[^>]*?src="${escapeRegex(src)}"[^>]*?\\/>`, 'g')
    const pushPath = `<span style="display:none" data-source-file-push="${src}"></span>`
    const popPath = `<span style="display:none" data-source-file-pop></span>`
    // add pushPath just after every <sp-slide> and popPath just before every </sp-slide> in the content
    const contentWithPushPop = content.replace(/<sp-slide[^>]*>/g, match => match + pushPath)
      .replace(/<\/sp-slide>/g, match => popPath + match)
    result = result.replace(re, contentWithPushPop)
  }
  return result
}

export function getSourceFileFromDOMLocation(e: HTMLElement | null): string | null {
  if (!e) return null

  const sourceStack = [] as string[]
  function buildSourceStack(e: HTMLElement) {
    function process(e: Element) {
        const push = e.getAttribute('data-source-file-push')
        if (push) {
          sourceStack.push(push)
        }
        if (e.hasAttribute('data-source-file-pop')) {
          sourceStack.pop()
        }
    }
    const ofInterest = '[data-source-file-push],[data-source-file-pop]'
    if (e.parentElement === null) return
    buildSourceStack(e.parentElement)
    let s = e.parentElement?.children[0]!
    while (s !== e && s !== null) {
      if (s.matches(ofInterest)) {
        process(s)
      }
      s.querySelectorAll(ofInterest).forEach(process)
      s = s?.nextElementSibling!
    }
  }
  buildSourceStack(e as HTMLElement)
  if (sourceStack.length === 0) return null

  let file = sourceStack[0]
  for (let i = 1; i < sourceStack.length; i++) {
    const part = sourceStack[i]
    if (part.startsWith('/')) {
      file = part
    } else {
      const lastSlash = file.lastIndexOf('/')
      // ok even if lastSlash is -1
      file = file.slice(0, lastSlash + 1) + part
    }
  }
  return file
}
