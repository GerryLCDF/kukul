import { useCallback, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react'
import { MoveVertical } from 'lucide-react'
import { alpha, grad135, grad180 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

const H = 220
const PAD = 22

function settingsOf(s: ControlSettings) {
  return {
    stepped: !!s.stepped,
    steps: Math.max(2, Math.min(12, Number(s.steps) || 6)),
    disabled: !!s.disabled,
    glow: !!s.glow,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

function posToFrac(clientY: number, top: number, height: number) {
  const inner = height - PAD * 2
  return Math.min(1, Math.max(0, (top + height - PAD - clientY) / inner))
}

export default function VerticalSlider({ settings }: { settings: ControlSettings }) {
  const { stepped, steps, disabled, glow, colorPrimary, colorAccent, flat, noShadow } = settingsOf(settings)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [v, setV] = useState(55)

  const snap = useCallback(
    (frac: number) => (stepped ? Math.round(frac * (steps - 1)) / (steps - 1) : frac),
    [stepped, steps],
  )

  const apply = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const el = trackRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setV(snap(posToFrac(e.clientY, r.top, r.height)) * 100)
    },
    [snap],
  )

  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (disabled) return
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    apply(e)
  }

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!dragging.current) return
    apply(e)
  }

  const onUp = () => {
    dragging.current = false
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    const delta = stepped ? 100 / (steps - 1) : 5
    const dir = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = Math.min(100, Math.max(0, v + dir * delta))
    setV(stepped ? Math.round(next / delta) * delta : next)
  }

  const frac = v / 100
  const idx = Math.round(frac * (steps - 1))
  const dim = disabled

  const innerH = H - PAD * 2
  const thumbTop = PAD + (1 - frac) * innerH

  const railColor = dim ? '#2c2c2c' : alpha(colorPrimary, 0.18)
  const fillColor = dim ? '#3a3a3a' : grad180(colorAccent, colorPrimary, flat)
  const thumbColor = dim ? '#444' : grad135(colorPrimary, colorAccent, flat)
  const lineColor = dim ? '#fff' : '#0b110d'
  const textColor = dim ? '#777' : '#f0f0f0'
  const trackShadow = noShadow
    ? 'none'
    : dim
      ? 'inset 0 3px 10px rgba(0,0,0,0.55)'
      : glow
        ? `inset 0 3px 10px rgba(0,0,0,0.55), 0 6px 18px ${alpha(colorPrimary, 0.22)}`
        : 'inset 0 3px 10px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.4)'
  const thumbShadow = noShadow
    ? 'none'
    : dim
      ? '0 4px 10px rgba(0,0,0,0.5)'
      : glow
        ? `0 4px 14px ${alpha(colorPrimary, 0.5)}, 0 0 0 4px ${alpha(colorPrimary, 0.14)}`
        : '0 4px 10px rgba(0,0,0,0.5)'

  const snapTicks = stepped
    ? Array.from({ length: steps }, (_, i) => i / (steps - 1))
    : [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        ref={trackRef}
        role="slider"
        aria-label="Deslizante vertical"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v)}
        aria-disabled={disabled}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        tabIndex={disabled ? -1 : 0}
        style={{
          width: 64,
          height: H,
          borderRadius: 999,
          background: railColor,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'grab',
          opacity: dim ? 0.55 : 1,
          userSelect: 'none',
          touchAction: 'none',
          outline: 'none',
          boxShadow: trackShadow,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: PAD,
            width: 22,
            height: frac * innerH,
            transform: 'translateX(-50%)',
            borderRadius: 999,
            background: fillColor,
          }}
        />

        {snapTicks.map((f, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: PAD + (1 - f) * innerH,
              transform: 'translate(-50%, -50%)',
              width: 28,
              height: 2,
              borderRadius: 2,
              background: dim ? '#555' : i === idx && stepped ? (glow ? colorAccent : colorPrimary) : '#555',
              boxShadow: !noShadow && stepped && i === idx && !dim && glow ? `0 0 8px ${alpha(colorAccent, 0.6)}` : 'none',
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: thumbTop,
            transform: 'translate(-50%, -50%)',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: thumbColor,
            border: `3px solid ${dim ? '#2e2e2e' : '#0b110d'}`,
            boxShadow: thumbShadow,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: lineColor,
              opacity: 0.9,
            }}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: textColor,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 92,
          }}
        >
          {stepped ? `${idx + 1} de ${steps}` : `${Math.round(v)}`}
        </div>
        <div style={{ fontSize: 12, color: dim ? '#666' : '#9aa0a3' }}>
          {stepped ? 'Opción' : 'Valor'}
        </div>
      </div>
    </div>
  )
}

function sliderCode(s: ControlSettings): string {
  const { stepped, steps, disabled, glow, colorPrimary, colorAccent, flat, noShadow } = settingsOf(s)
  const fillBg = flat
    ? `'${disabled ? '#3a3a3a' : colorPrimary}'`
    : `'${disabled ? '#3a3a3a' : `linear-gradient(180deg, ${colorAccent}, ${colorPrimary})`}'`
  // bloque renderizado solo en modo pasos: marcas sobre la pista
  const snapBlock = stepped
    ? [
        '        {SNAP.map((p) => (',
        '          <div key={p} style={{',
        '            position: "absolute", left: "50%",',
        '            top: `${PAD + (1 - p / 100) * inner}px`,',
        '            transform: "translate(-50%, -50%)",',
        '            width: 28, height: 2, borderRadius: 2,',
        `            background: p === Math.round(frac * 100) ? '${colorAccent}' : "#555",`,
        '          />)}',
      ]
    : []
  return [
    "import { useRef, useState } from 'react'",
    '',
    'const H = 220',
    'const PAD = 22 // reserva arriba/abajo para que el pomo no rebase',
    `const STEP_FRAC = ${stepped ? `1 / (${steps} - 1)` : '1'}`,
    `const SNAP = ${JSON.stringify(Array.from({ length: steps }, (_, i) => Math.round((i / (steps - 1)) * 100)))} // posiciones fijas %`,
    '',
    '// coordenada Y del puntero dentro de la pista → 0..1',
    'function yToFrac(clientY: number, rect: DOMRect) {',
    '  const inner = rect.height - PAD * 2',
    '  const f = (rect.bottom - PAD - clientY) / inner // 0 abajo, 1 arriba',
    '  const clamped = Math.max(0, Math.min(1, f))',
    `  return ${stepped ? 'Math.round(clamped / STEP_FRAC) * STEP_FRAC' : 'clamped'}`,
    '}',
    '',
    'export default function VerticalSlider() {',
    '  const railRef = useRef<HTMLDivElement>(null)',
    '  const [v, setV] = useState(32)',
    '  const frac = v / 100',
    '  const inner = H - PAD * 2',
    '',
    '  // arrastre: pista → valor',
    '  const onPointerDown = (e: React.PointerEvent) => {',
    '    const r = railRef.current!.getBoundingClientRect()',
    '    setV(Math.round(yToFrac(e.clientY, r) * 100))',
    '  }',
    '',
    '  return (',
    '    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>',
    '      <div',
    '        ref={railRef}',
    '        role="slider"',
    '        aria-orientation="vertical"',
    '        aria-valuemin={0}',
    '        aria-valuemax={100}',
    '        aria-valuenow={Math.round(v)}',
    `        aria-disabled={${disabled}}`,
    '        onPointerDown={onPointerDown}',
    '        style={{',
    '          width: 64,',
    '          height: H,',
    '          borderRadius: 999,',
    `          background: '${disabled ? '#2c2c2c' : `${colorPrimary}2E`}',`,
    noShadow
      ? '          boxShadow: "none", // sin sombra'
      : glow
        ? `          boxShadow: '0 6px 18px ${colorPrimary}3B', // brillo`
        : '          boxShadow: "0 4px 8px rgba(0,0,0,0.4)", // sin brillo',
    '          position: "relative",',
    '          cursor: "grab",',
    '          userSelect: "none",',
    '          touchAction: "none",',
    '        }}',
    '      >',
    ...snapBlock,
    '        {/* relleno: crece desde abajo con el valor */}',
    '        <div',
    '          style={{',
    '            position: "absolute", left: "50%", bottom: PAD,',
    '            width: 22, height: frac * inner,',
    '            transform: "translateX(-50%)",',
    '            borderRadius: 999,',
    '            background: ' + fillBg + ',',
    '          }}',
    '        />',
    '        {/* pomo */}',
    '        <div',
    '          style={{',
    '            position: "absolute", left: "50%",',
    '            top: `${PAD + (1 - frac) * inner}px`,',
    '            transform: "translate(-50%, -50%)",',
    '            width: 36, height: 36, borderRadius: "50%",',
    `            background: '${disabled ? '#1e1e1e' : '#222'}',`,
    `            border: \`3px solid ${disabled ? '"#2e2e2e"' : '"#0b110d"'}\`,`,
    `            boxShadow: ${noShadow ? '"none"' : '"0 4px 10px rgba(0,0,0,0.4)"'},`,
    '            display: "grid", placeItems: "center",',
    '          }}',
    '        >',
    `          <span style={{ width: 12, height: 12, borderRadius: "50%", background: \`${disabled ? '"#555"' : `'"${colorAccent}"'`}\`, opacity: 0.9 }} />`,
    '        </div>',
    '      </div>',
    '      <div style={{ fontSize: 13, fontWeight: 700, color: "#9aa0a3" }}>',
    `        {${stepped ? '"Opción " + (Math.round(frac / STEP_FRAC) + 1) + " de ' + steps + '"' : 'Math.round(v) + "%"'}}`,
    '      </div>',
    '    </div>',
    '  )',
    '}',
  ].join('\n')
}

export const sliderVertical: AnimationEntry = {
  id: 'slider-vertical',
  title: 'Deslizante vertical',
  icon: MoveVertical,
  tags: ['slider', 'vertical', 'arrastre', 'disabled'],
  summary: 'Control deslizante vertical: arrastra el pomo para elegir un valor de forma fluida o por pasos, con estado desactivado (gris e inmutable).',
  Component: VerticalSlider,
  previewScale: 0.75,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'stepped', label: 'Movimiento por pasos', type: 'toggle', initial: false },
    { id: 'steps', label: 'Cantidad de pasos', type: 'range', min: 2, max: 12, step: 1, initial: 6, show: (s) => !!s.stepped },
    { id: 'glow', label: 'Brillo del control', type: 'toggle', initial: true },
    { id: 'disabled', label: 'Desactivado (no editable)', type: 'toggle', initial: false },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: sliderCode,
  doc: {
    intro:
      'Un **control deslizante vertical** (slider) para seleccionar un valor arrastrando el pomo. Modo **fluido** (valor continuo) o **por pasos** (opciones discretas), con relleno de la pista, ticks alrededor y estado **desactivado** en gris para paneles de ajuste.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `**1. Del puntero al valor**

La posición Y del puntero dentro de la pista se convierte en un valor de 0 a 100. Se reserva un \`PAD\` arriba y abajo para que el pomo nunca rebase la pista:

\`\`\`ts
const inner = rect.height - PAD * 2
const f = (rect.bottom - PAD - clientY) / inner // 0 abajo, 1 arriba
const clamped = Math.max(0, Math.min(1, f))
\`\`\`

**2. Fluido vs pasos**

- **Fluido**: el valor cambia libremente.
- **Pasos**: se redondea al múltiplo más cercano de \`1 / (steps - 1)\`; el pomo **encaja** en cada posición y el label muestra *"Opción N de M"*.

**3. Relleno y pomo**

El relleno crece desde abajo con \`height: frac * inner\`. El pomo se ubica con \`top: PAD + (1 - frac) * inner\` y \`translate(-50%, -50%)\` para centrarlo sobre la posición exacta.

**4. Desactivado**

Con \`disabled\` se ignoran puntero y teclado, el control baja su opacidad y pasa a **escala de grises**. El brillo se quita con \`glow\`.`,
      },
      {
        title: 'Cuándo usarla',
        body: `- **Ajustes verticales**: volumen, brillo, zoom, intensidad
- Barra lateral de **niveles** o **prioridades** (por pasos)
- Controles **desactivable** cuando el panel se apaga

Buenas prácticas:

- Mantén \`aria-orientation="vertical"\`, \`aria-valuenow/min/max\` y label descriptivo
- Soporta teclado: \`↑\`/\`↓\` para ajustar
- Usa \`pointer capture\` y \`touch-action: none\` para un arrastre sólido en táctil y escritorio.`,
      },
    ],
  },
}