import { useRef, useState } from 'react'
import { animate } from 'framer-motion'
import { RotateCcw, Calculator } from 'lucide-react'
import { grad90 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

function settingsOf(s: ControlSettings) {
  return {
    target: Number(s.target) || 8432,
    duration: Number(s.duration) || 1.6,
    separator: !!s.separator,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
  }
}

export default function Counter({ settings }: { settings: ControlSettings }) {
  const { target, duration, separator, colorPrimary, colorAccent, flat } = settingsOf(settings)
  const [value, setValue] = useState(0)
  const frameRef = useRef<HTMLSpanElement>(null)

  const fmt = (n: number) =>
    separator ? n.toLocaleString('es-ES') : String(n)

  const run = () => {
    const node = frameRef.current
    if (!node) return
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = fmt(Math.round(v))
      },
    })
    controls.then(() => setValue((v) => v + 1))
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontSize: 76,
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          background: grad90(colorPrimary, colorAccent, flat),
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1.1,
        }}
      >
        <span ref={frameRef}>{fmt(value)}</span>
      </div>
      <div style={{ fontSize: 13, color: '#9aa0a3', marginTop: 4, marginBottom: 18 }}>
        objetivo: {fmt(target)}
      </div>
      <button
        onClick={run}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#212121',
          color: '#f0f0f0',
          border: '1px solid #353535',
          borderRadius: 999,
          padding: '10px 22px',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        <RotateCcw size={15} /> Volver a contar
      </button>
    </div>
  )
}

function counterCode(s: ControlSettings): string {
  const { target, duration, separator, colorPrimary, colorAccent, flat } = settingsOf(s)
  const fmtExpr = separator
    ? 'Math.round(v).toLocaleString("es-ES")'
    : 'String(Math.round(v))'
  const bgLine = flat
    ? `      background: '${colorPrimary}',`
    : `      background: 'linear-gradient(90deg, ${colorPrimary}, ${colorAccent})',`
  return [
    "import { useRef } from 'react'",
    "import { animate } from 'framer-motion'",
    '',
    'export default function Counter() {',
    '  const node = useRef<HTMLSpanElement>(null)',
    '',
    '  const run = () => {',
    '    if (!node.current) return',
    `    animate(0, ${target}, {`,
    `      duration: ${duration},`,
    "      ease: 'easeOut',",
    '      onUpdate: (v) => {',
    `        node.current!.textContent = ${fmtExpr}`,
    '      },',
    '    })',
    '  }',
    '',
    '  return (',
    "    <div style={{ textAlign: 'center' }}>",
    "      <div",
    '        style={{',
    '          fontSize: 76,',
    '          fontWeight: 800,',
    "          fontFamily: 'JetBrains Mono, monospace',",
    bgLine,
    '          WebkitBackgroundClip: "text",',
    '          backgroundClip: "text",',
    '          color: "transparent",',
    '        }}',
    '      >',
    "        <span ref={node}>0</span>",
    '      </div>',
    "      <button onClick={run}>Volver a contar</button>",
    '    </div>',
    '  )',
    '}',
  ].join('\n')
}

export const counter: AnimationEntry = {
  id: 'counter',
  title: 'Contador animado',
  icon: Calculator,
  tags: ['números', 'animate()', 'estadísticas'],
  summary: 'Un número que cuenta de 0 hasta un objetivo con curva easeOut. Frecuente en métricas, estadísticas y precios: solo se necesita animate().',
  Component: Counter,
  replayable: true,
  previewScale: 0.85,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'target', label: 'Valor objetivo', type: 'range', min: 100, max: 50000, step: 500, initial: 8432 },
    { id: 'duration', label: 'Duración (s)', type: 'range', min: 0.4, max: 3, step: 0.1, initial: 1.6 },
    { id: 'separator', label: 'Formato con miles', type: 'toggle', initial: true },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: counterCode,
  doc: {
    intro:
      'Anima valores numéricos sin montar un \`<motion>\` por cada cambio: la utilidad **\`animate()\`** de Framer Motion te devuelve un controlador con \`onUpdate\` que ejecuta un callback en **cada frame** con el valor interpolado.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `Se anima un número abstracto de \`0\` al objetivo, y en cada frame (\`onUpdate\`) se **escribe el valor en el DOM**. Al terminar, \`controls.then()\` permite encadenar algo si hace falta.

\`\`\`tsx
import { animate } from 'framer-motion'

const controls = animate(0, 8432, {
  duration: 1.6,
  ease: 'easeOut',
  onUpdate: (v) => {
    node.textContent = Math.round(v).toLocaleString('es-ES')
  },
})

controls.stop() // si el componente se desmonta
\`\`\`

- **\`easeOut\`** → empieza rápido y frena al final, se lee como "cuenta alegre"
- \`Math.round(v)\` evita decimales; \`toLocaleString\` pone los separadores de miles
- Guarda el controlador para llamar \`controls.stop()\` en el *cleanup* del componente`,
      },
      {
        title: 'Cuándo usarla',
        body: `- Métricas y **KPIs** ('ingresos del mes', 'usuarios activos')
- Contadores o cronómetros
- Mensajes de tipo "proceso completado al 87 %"

Sugerencia: no vuelvas a lanzarlo en cada render, solo cuando el valor cambia de verdad (por ejemplo, al entrar en pantalla).

A diferencia de librerías externas de *count-up*, aquí **no hace falta ninguna dependencia extra**: es Framer Motion puro.`,
      },
    ],
  },
}