import { SlidersHorizontal, Palette } from 'lucide-react'
import type { ControlDef, ControlSettings } from '../types'

interface Props {
  controls: ControlDef[]
  colors: ControlDef[]
  settings: ControlSettings
  onChange: (id: string, value: boolean | number | string) => void
}

export default function ControlsPanel({ controls, colors, settings, onChange }: Props) {
  return (
    <aside className="controls">
      <div className="controls-title">
        <SlidersHorizontal size={16} /> Opciones
      </div>

      {controls.map((c) => {
        if (c.show && !c.show(settings)) return null
        const value = settings[c.id]
        return (
          <label key={c.id} className="control">
            <span className="control-label">{c.label}</span>
            {c.type === 'toggle' && (
              <input
                type="checkbox"
                className="control-toggle"
                checked={!!value}
                onChange={(e) => onChange(c.id, e.target.checked)}
              />
            )}
            {c.type === 'range' && (
              <div className="control-range">
                <input
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={Number(value)}
                  onChange={(e) => onChange(c.id, Number(e.target.value))}
                />
                <span className="control-value">{String(value)}</span>
              </div>
            )}
            {c.type === 'color' && (
              <input
                type="color"
                className="control-color"
                value={String(value)}
                onChange={(e) => onChange(c.id, e.target.value)}
              />
            )}
          </label>
        )
      })}

      {colors.length > 0 && (
        <details className="controls-collapse" open={false}>
          <summary>
            <Palette size={14} /> Colores
          </summary>
          <div className="controls-colors">
            {colors.map((c) => {
              if (c.show && !c.show(settings)) return null
              return (
                <label key={c.id} className="control">
                  <span className="control-label">{c.label}</span>
                  <input
                    type="color"
                    className="control-color"
                    value={String(settings[c.id])}
                    onChange={(e) => onChange(c.id, e.target.value)}
                  />
                </label>
              )
            })}
          </div>
        </details>
      )}
    </aside>
  )
}