import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'
import { animations } from '../animations/registry'
import type { AnimationEntry, ControlSettings } from '../types'

function defaultsOf(a: AnimationEntry): ControlSettings {
  return Object.fromEntries(
    [...(a.controls ?? []), ...(a.colors ?? [])].map((c) => [c.id, c.initial]),
  )
}

function AnimationCard({ a }: { a: AnimationEntry }) {
  const defaults = useMemo(() => defaultsOf(a), [a])
  const replayable = !!a.replayable
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!replayable) return
    const id = window.setInterval(() => setTick((t) => t + 1), 6000)
    return () => window.clearInterval(id)
  }, [replayable])

  return (
    <a className="card" href={`#/${a.id}`}>
      <div className="card-head">
        <span className="card-icon">
          <a.icon size={18} />
        </span>
        <h3>{a.title}</h3>
      </div>

      <div className="card-body">
        <div className="card-about">
          <p>{a.summary}</p>
          <div className="tags">
            {a.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div
          className="card-preview"
          style={{ ['--pv-scale' as string]: a.previewScale ?? 0.55 }}
        >
          <div className="card-preview-box">
            <a.Component key={replayable ? tick : 0} settings={defaults} />
          </div>
        </div>
      </div>
    </a>
  )
}

export default function IndexPage() {
  const [copied, setCopied] = useState(false)

  const install = 'npm install kukul'

  const copy = async () => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(install)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="logo">K</div>
        <div>
          <div className="topbar-title">Kukul</div>
          <div className="topbar-sub">UI motion lab · framer-motion + react</div>
        </div>
        <a className="topbar-link" href="#/docs">
          <BookOpen size={15} /> Documentación
        </a>
      </div>

      <div className="hero">
        <h1>Animaciones de UI para React</h1>
        <p>
          Este proyecto nació ante la falta de buenas opciones gratuitas: la gran mayoría
          de animaciones disponibles eran de pago. Al crear alternativas propias para
          distintos proyectos, acumulé una biblioteca amplia y decidí compartirla con la
          comunidad. Son gratuitas, de código abierto y completamente personalizables.
        </p>
        <div className="install-line">
          <code>{install}</code>
          <button onClick={copy} title="Copiar comando">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="grid">
        {animations.map((a) => (
          <AnimationCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  )
}