import type { ReactNode } from 'react'
import CodeBlock, { escapeHtml } from '../components/CodeBlock'

export function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let i = 0
  let inCode = false
  let codeBuf: string[] = []
  let listBuf: ReactNode[] = []

  const flushCode = () => {
    out.push(<CodeBlock key={`code${i}`} code={codeBuf.join('\n')} />)
    codeBuf = []
  }

  const flushList = () => {
    if (listBuf.length) {
      out.push(<ul key={`ul${i}`}>{listBuf}</ul>)
      listBuf = []
    }
  }

  for (const raw of lines) {
    const trimmed = raw.trim()
    if (trimmed.startsWith('```')) {
      flushList()
      if (inCode) {
        flushCode()
        inCode = false
      } else {
        inCode = true
      }
      i++
      continue
    }
    if (inCode) {
      codeBuf.push(raw)
      continue
    }
    if (trimmed.startsWith('- ')) {
      listBuf.push(<li key={`li${i}`}>{inline(trimmed.slice(2))}</li>)
      i++
      continue
    }
    flushList()
    if (trimmed === '') {
      i++
      continue
    }
    out.push(<p key={`p${i}`}>{inline(trimmed)}</p>)
    i++
  }
  flushList()
  if (codeBuf.length) flushCode()

  return out
}

function inline(s: string) {
  const parts = s.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((p, k) => {
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={k}>{escapeHtml(p.slice(1, -1))}</code>
    }
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={k}>{p.slice(2, -2)}</strong>
    }
    return <span key={k}>{escapeHtml(p)}</span>
  })
}