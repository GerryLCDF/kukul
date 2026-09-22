import { useCallback, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react'
import { Gauge } from 'lucide-react'
import { alpha, grad135 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

const SIZE = 220
const MIN_ANG = 135
const SWEEP = 270

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

function fracToRot(frac: number) {
  return frac * SWEEP - 135
}

function pointerAngle(e: PointerEvent<HTMLElement>, cx: number, cy: number) {
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  return ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360
}

export default function Knob({ settings }: { settings: ControlSettings }) {
  const { stepped, steps, disabled, glow, colorPrimary, colorAccent, flat, noShadow } = settingsOf(settings)
  const zoneRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragRef = useRef<{ prev: number | null; cont: number }>({ prev: null, cont: 0 })
  const [v, setV] = useState(55)

  const snap = useCallback(
    (frac: number) => (stepped ? Math.round(frac * (steps - 1)) / (steps - 1) : frac),
    [stepped, steps],
  )

  const applyOffset = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const el = zoneRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const raw = pointerAngle(e, cx, cy)
      const d = dragRef.current

      if (d.prev === null) {
        let t = ((raw - MIN_ANG) % 360 + 360) % 360
        if (t > SWEEP) t = SWEEP
        d.cont = MIN_ANG + t
      } else {
        let delta = raw - d.prev
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        d.cont += delta
      }
      d.prev = raw

      const frac = Math.min(1, Math.max(0, (d.cont - MIN_ANG) / SWEEP))
      setV(snap(frac) * 100)
    },
    [snap],
  )

  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (disabled) return
    dragging.current = true
    dragRef.current = { prev: null, cont: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
    applyOffset(e)
  }

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!dragging.current) return
    applyOffset(e)
  }

  const onUp = () => {
    dragging.current = false
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return
    const delta = stepped ? 100 / (steps - 1) : 5
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    setV((prev) => Math.min(100, Math.max(0, prev + dir * delta)))
    if (stepped) setV((prev) => Math.round(prev / delta) * delta)
  }

  const frac = v / 100
  const idx = Math.round(frac * (steps - 1))
  const label = stepped ? `${idx + 1} de ${steps}` : `${Math.round(v)}`
  const dim = disabled

  const trackBorder = dim ? '#3a3a3a' : alpha(colorPrimary, 0.6)
  const lineColor = dim ? '#555555' : colorAccent
  const hubColor = dim ? '#2e2e2e' : grad135(colorPrimary, colorAccent, flat)
  const textColor = dim ? '#777' : '#f0f0f0'
  const lineGlow = !dim && glow && !stepped && !noShadow
  const knobShadow = noShadow
    ? 'none'
    : dim
      ? 'inset 0 4px 14px rgba(0,0,0,0.5), 0 6px 18px rgba(0,0,0,0.45)'
      : glow
        ? `inset 0 4px 14px rgba(0,0,0,0.5), 0 6px 18px ${alpha(colorPrimary, 0.25)}`
        : 'inset 0 4px 14px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)'

  const snapTicks = stepped
    ? Array.from({ length: steps }, (_, i) => i / (steps - 1))
    : [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        ref={zoneRef}
        role="slider"
        aria-label="Perilla"
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
          width: SIZE,
          height: SIZE,
          borderRadius: '50%',
          background: dim ? '#1e1e1e' : '#1b1b1b',
          border: `2px solid ${trackBorder}`,
          boxShadow: knobShadow,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'grab',
          opacity: dim ? 0.55 : 1,
          userSelect: 'none',
          touchAction: 'none',
          outline: 'none',
        }}
      >
        <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', border: `1px solid ${dim ? '#333' : alpha(colorAccent, 0.28)}` }} />

        {snapTicks.map((f, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: stepped ? 4 : 2,
              height: stepped ? 18 : 10,
              borderRadius: 3,
              background:
                dim
                  ? '#555'
                  : i === idx && stepped
                    ? glow
                      ? colorAccent
                      : colorPrimary
                    : '#6b6b6b',
              transform: `translate(-50%, -100%) translateY(-46px) rotate(${fracToRot(f)}deg)`,
              transformOrigin: '50% 100%',
              boxShadow: !noShadow && stepped && i === idx && !dim && glow ? `0 0 8px ${alpha(colorAccent, 0.6)}` : 'none',
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 3,
            height: SIZE / 2 - 26,
            borderRadius: 3,
            background: lineColor,
            transform: `translate(-50%, -100%) rotate(${fracToRot(frac)}deg)`,
            transformOrigin: '50% 100%',
            boxShadow: lineGlow ? `0 0 10px ${alpha(colorAccent, 0.7)}` : 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: hubColor,
            border: `3px solid ${dim ? '#444' : '#0b110d'}`,
          }}
        />
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
          {label}
        </div>
        <div style={{ fontSize: 12, color: dim ? '#666' : '#9aa0a3' }}>
          {stepped ? 'Opción' : 'Valor'}
        </div>
      </div>
    </div>
  )
}

function knobCode(s: ControlSettings): string {
  const { stepped, steps, disabled, glow, colorPrimary, colorAccent, flat, noShadow } = settingsOf(s)
  const hubBg = flat ? `'${colorPrimary}'` : `'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})'`
  const snapLines = Array.from({ length: steps }, (_, i) => i / (steps - 1))
  // bloque renderizado solo en modo pasos: marcas alrededor del borde
  const snapBlock = stepped
    ? [
        '      {SNAP.map((p) => (',
        '        <div key={p} style={{',
        '          position: "absolute",',
        '          left: "50%", top: "50%",',
        '          width: 4, height: 18, borderRadius: 3,',
        `          background: p === Math.round(frac * 100) ? '${colorAccent}' : "#6b6b6b",`,
        '          transform: `translate(-50%, -100%) translateY(-46px) rotate(${p * SWEEP - MIN_ANG}deg)`,',
        '          transformOrigin: "50% 100%",',
        '        }}',
        '        />)}',
      ]
    : []
  return [
    "import { useRef, useState } from 'react'",
    '',
    'const SIZE = 220',
    'const MIN_ANG = 135 // punto inicial (7:30)',
    'const SWEEP = 270  // recorrido total (7:30 → 4:30)',
    `const STEP_FRAC = ${stepped ? `1 / (${steps} - 1)` : '1'}`,
    `const SNAP = ${JSON.stringify(snapLines.map((f) => Math.round(f * 100)))} // posiciones fijas %`,
    '',
    'function angleToFrac(deg: number) {',
    '  let t = ((deg - MIN_ANG) % 360 + 360) % 360',
    '  if (t > SWEEP) t = SWEEP',
    '  const f = t / SWEEP',
    '  // redondea al paso más cercano',
    `  return ${stepped ? 'Math.round(f / STEP_FRAC) * STEP_FRAC' : 'f'}`,
    '}',
    '',
    'export default function Knob() {',
    '  const zoneRef = useRef<HTMLDivElement>(null)',
    '  const [v, setV] = useState(45)',
    '  const frac = v / 100',
    '  // ángulo visual de la línea: 0% → -135°, 100% → +135°',
    '  const lineDeg = frac * SWEEP - MIN_ANG',
    '',
    '  // arrastre: calcula el ángulo respecto al centro y lo convierte en %',
    '  const onPointerDown = (e: React.PointerEvent) => {',
    '    const r = zoneRef.current!.getBoundingClientRect()',
    '    const cx = r.left + r.width / 2',
    '    const cy = r.top + r.height / 2',
    '    const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI',
    '    setV(Math.round(angleToFrac(deg) * 100))',
    '  }',
    '',
    '  return (',
    '    <div',
    '      ref={zoneRef}',
    '      role="slider"',
    '      aria-valuemin={0}',
    '      aria-valuemax={100}',
    '      aria-valuenow={Math.round(v)}',
    `      aria-disabled={${disabled}}`,
    '      onPointerDown={onPointerDown}',
    '      style={{',
    '        width: SIZE,',
    '        height: SIZE,',
    `        borderRadius: "50%",`,
    `        background: '${disabled ? '#1e1e1e' : '#1b1b1b'}',`,
    `        border: '2px solid ${disabled ? '#3a3a3a' : `${colorPrimary}99`}',`,
    noShadow
      ? '        boxShadow: "none", // sin sombra'
      : glow
        ? `        boxShadow: '0 6px 18px ${colorPrimary}44', // brillo`
        : '        boxShadow: "0 4px 10px rgba(0,0,0,0.4)", // sin brillo',
    '        position: "relative",',
    '        cursor: "grab",',
    '        userSelect: "none",',
    '        touchAction: "none",',
    '      }}',
    '    >',
    ...snapBlock,
    '      {/* línea indicadora */}',
    '      <div',
    '        style={{',
    '          position: "absolute",',
    '          left: "50%", top: "50%",',
    '          width: 3, height: SIZE / 2 - 26, borderRadius: 3,',
    '          transform: `translate(-50%, -100%) rotate(${lineDeg}deg)`,',
    '          transformOrigin: "50% 100%",',
    `          background: '${disabled ? '#555' : colorAccent}',`,
    glow ? `          boxShadow: ${disabled ? '"none"' : `'0 0 10px ${colorAccent}B3'`},` : '          // brillo OFF',
    '        }}',
    '      />',
    '      {/* centro (hub) */}',
    '      <div',
    '        style={{',
    '          position: "absolute",',
    '          left: "50%", top: "50%",',
    '          transform: "translate(-50%, -50%)",',
    '          width: 44, height: 44, borderRadius: "50%",',
    '          background: ' + hubBg + ',',
    `          border: \`3px solid ${disabled ? '"#444"' : '"#0b110d"'}\`,`,
    '        }}',
    '      />',
    '    </div>',
    '  )',
    '}',
  ].join('\n')
}

export const knob: AnimationEntry = {
  id: 'knob',
  title: 'Perilla de control',
  icon: Gauge,
  tags: ['knob', 'arrastre', 'pasos', 'disabled'],
  summary: 'Perilla arrastrable con línea indicadora: movimiento fluido o por pasos, valor/opción en pantalla y estado desactivado (gris e inmutable).',
  Component: Knob,
  previewScale: 0.9,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'stepped', label: 'Movimiento por pasos', type: 'toggle', initial: false },
    { id: 'steps', label: 'Cantidad de pasos', type: 'range', min: 2, max: 12, step: 1, initial: 6, show: (s) => !!s.stepped },
    { id: 'glow', label: 'Brillo de la perilla', type: 'toggle', initial: true },
    { id: 'disabled', label: 'Desactivada (no editable)', type: 'toggle', initial: false },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: knobCode,
  doc: {
    intro:
      'Una **perilla de control** estilo potenciómetro: se arrastra para seleccionar un valor y una **línea indicadora** marca la posición. Dos modos: **fluido** (valor continuo) o **por pasos** (opciones discretas). Soporta estado **desactivado** para paneles de ajuste.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `**1. De la posición del puntero al valor**

El ángulo del puntero respecto al centro se convierte a un valor de 0 a 100 mediante \`atan2\`. El recorrido es de **270°**, desde las 7:30 (mínimo) hasta las 4:30 (máximo), pasando por arriba.

\`\`\`ts
const MIN_ANG = 135 // 7:30 en la medida de atan2
const SWEEP = 270

function angleToFrac(raw) {
  let t = ((raw - MIN_ANG) % 360 + 360) % 360
  if (t > SWEEP) t = SWEEP
  return t / SWEEP
}
\`\`\`

**2. Fluido vs pasos**

- **Fluido**: \`frac\` se usa tal cual → el valor cambia libremente.
- **Pasos**: se redondea al múltiplo más cercano \`Math.round(frac / stepSize) * stepSize\`, en el que \`stepSize = 1 / (steps - 1)\`. La perilla **encaja** en esas posiciones y abajo se muestra *"Opción N de M"*.

**3. La línea indicadora**

Cada valor se convierte a una rotación CSS: \`rotate(frac * 270 - 135)\`. La línea nace del centro (\`transform-origin: 50% 100%\`) y señala el valor.

**4. Desactivada**

Con \`disabled\`, el componente ignora puntero y teclado (\`aria-disabled\`, \`pointer-events\`), baja su opacidad y cambia todos sus colores a **escala de grises**. El **brillo** de la perilla se puede quitar con \`glow\` (útil en modos por pasos, donde lo que importa son las líneas alrededor del círculo).`,
      },
      {
        title: 'Cuándo usarla',
        body: `- **Ajustes**: brillo, volumen, temperatura, intensidad
- **Panes modal con pasos**: "Bajo / Medio / Alto", niveles de dificultad
- **Control activable/desactivable**: al apagar el panel, la perilla se bloquea en gris

Buenas prácticas:

- Mantén un \`aria-label\` y valores accesibles (\`aria-valuenow\`, \`aria-valuemin/max\`)
- Soporta teclado: flechas izquierda/derecha y arriba/abajo para ajustar
- Usa \`pointer capture\` para que arrastrar fuera del círculo siga funcionando.`,
      },
    ],
  },
}