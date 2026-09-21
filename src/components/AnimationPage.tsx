import { Link2, ArrowLeft, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { AnimationEntry, ControlSettings } from '../types'
import { renderMarkdown } from '../utils/markdown'
import CodeBlock from './CodeBlock'
import ControlsPanel from './ControlsPanel'

export default function AnimationPage({ entry }: { entry: AnimationEntry }) {
  const { Component, doc } = entry
  const [frame, setFrame] = useState(0)
  const [replay, setReplay] = useState(0)

  const defaults = useMemo<ControlSettings>(
    () =>
      Object.fromEntries(
        [...(entry.controls ?? []), ...(entry.colors ?? [])].map((c) => [c.id, c.initial]),
      ),
    [entry],
  )
  const [settings, setSettings] = useState<ControlSettings>(defaults)

  useEffect(() => {
    setFrame(0)
    setReplay(0)
    setSettings(defaults)
    window.scrollTo(0, 0)
  }, [entry, defaults])

  const change = (id: string, value: boolean | number | string) =>
    setSettings((s) => ({ ...s, [id]: value }))

  const shareUrl = window.location.href

  return (
    <div className="page">
      <a className="back" href="#/">
        <ArrowLeft size={15} /> Todas las animaciones
      </a>

      <div className="page-head">
        <span className="card-icon">
          <entry.icon size={24} />
        </span>
        <div style={{ flex: 1 }}>
          <h1>{entry.title}</h1>
          <p className="summary">{entry.summary}</p>
        </div>
        <button
          className="back"
          onClick={() => {
            const p = navigator.clipboard?.writeText(shareUrl)
            if (p) p.then(() => setFrame((f) => f + 1))
          }}
        >
          <Link2 size={15} /> {frame > 0 ? '¡Copiada!' : 'Copiar link'}
        </button>
      </div>

      <div className="tool-row">
        <div className="stage">
          <span className="stage-corner">preview</span>
          {entry.replayable && (
            <button
              className="stage-replay"
              onClick={() => setReplay((r) => r + 1)}
            >
              <RotateCcw size={14} /> Repetir
            </button>
          )}
          <Component key={replay} settings={settings} />
        </div>
        {entry.controls?.length || entry.colors?.length ? (
          <ControlsPanel controls={entry.controls ?? []} colors={entry.colors ?? []} settings={settings} onChange={change} />
        ) : null}
      </div>

      {entry.code && (
        <div className="doc-section">
          <h2>Código (se actualiza con las opciones)</h2>
          <p className="muted">
            Este snippet refleja los ajustes que hayas hecho en el inspector.
          </p>
          <CodeBlock code={entry.code(settings)} />
        </div>
      )}

      <div className="doc-section doc-intro">
        <h2>¿Qué hace?</h2>
        {renderMarkdown(doc.intro)}
      </div>

      {doc.sections.map((s) => (
        <div key={s.title} className="doc-section">
          <h2>{s.title}</h2>
          {renderMarkdown(s.body)}
        </div>
      ))}
    </div>
  )
}