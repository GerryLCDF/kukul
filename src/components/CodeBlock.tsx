import { useState } from 'react'

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="code-block">
      <pre>
        <code>{escapeHtml(code)}</code>
      </pre>
      <button className="code-copy" onClick={copy} title="Copiar código">
        {copied ? '✓ Copiado' : '⧉ Copiar'}
      </button>
    </div>
  )
}