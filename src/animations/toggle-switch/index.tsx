import { useState } from 'react'
import { motion } from 'framer-motion'
import { ToggleRight } from 'lucide-react'
import type { AnimationEntry, ControlSettings } from '../../types'

function settingsOf(s: ControlSettings) {
  return {
    stiffness: Number(s.stiffness) || 600,
    damping: Number(s.damping) || 30,
    onColor: String(s.onColor) || '#00a86b',
    accent: String(s.accent) || '#00ffb2',
    size: Number(s.size) || 76,
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

export default function ToggleSwitch({ settings }: { settings: ControlSettings }) {
  const { stiffness, damping, onColor, accent, size, flat, noShadow } = settingsOf(settings)
  const [on, setOn] = useState(true)

  const knob = Math.round(size * 0.42)
  const padding = Math.max(4, Math.round(size * 0.05))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        role="switch"
        aria-label="Toggle"
        style={{
          width: size,
          height: Math.round(size * 0.52),
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: on ? (flat ? onColor : `linear-gradient(135deg, ${onColor}, ${accent})`) : '#353535',
          padding,
          display: 'flex',
          justifyContent: on ? 'flex-end' : 'flex-start',
        }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness, damping }}
          style={{
            width: knob,
            height: knob,
            borderRadius: 999,
            background: '#fff',
            boxShadow: noShadow ? 'none' : '0 3px 8px rgba(0,0,0,0.35)',
            display: 'block',
          }}
        />
      </button>
      <span style={{ fontWeight: 700 }}>{on ? 'Encendido' : 'Apagado'}</span>
    </div>
  )
}

function toggleCode(s: ControlSettings): string {
  const { stiffness, damping, onColor, accent, size, flat, noShadow } = settingsOf(s)
  return [
    '<button',
    '  onClick={() => setOn(!on)}',
    '  style={{',
    flat
      ? `    background: on ? '${onColor}' : '#353535', // color plano`
      : `    background: on ? 'linear-gradient(135deg, ${onColor}, ${accent})' : '#353535',`,
    '    justifyContent: on ? "flex-end" : "flex-start",',
    `    width: ${size}, height: ${Math.round(size * 0.52)},`,
    '    borderRadius: 999,border: "none",cursor: "pointer",',
    '  }}',
    '>',
    '  <motion.span',
    '    layout',
    `    transition={{ type: "spring", stiffness: ${stiffness}, damping: ${damping} }}`,
    `    style={{ width: ${Math.round(size * 0.42)}, height: ${Math.round(size * 0.42)}, background: "#fff"${noShadow ? ', boxShadow: "none"' : ', boxShadow: "0 3px 8px rgba(0,0,0,0.35)"'} }}`,
    '  />',
    '</button>',
  ].join('\n')
}

export const toggleSwitch: AnimationEntry = {
  id: 'toggle-switch',
  title: 'Toggle con spring',
  icon: ToggleRight,
  tags: ['toggle', 'layout', 'spring'],
  summary: 'Un interruptor cuyo "perrito" se desliza con un muelle. La magia: la prop layout de Framer Motion anima el cambio de posición automáticamente.',
  Component: ToggleSwitch,
  previewScale: 0.8,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'stiffness', label: 'Rigidez del resorte', type: 'range', min: 300, max: 900, step: 20, initial: 600 },
    { id: 'damping', label: 'Amortiguación', type: 'range', min: 15, max: 45, step: 1, initial: 30 },
    { id: 'size', label: 'Tamaño (ancho)', type: 'range', min: 48, max: 100, step: 4, initial: 76 },
  ],
  colors: [
    { id: 'onColor', label: 'Color activo', type: 'color', initial: '#00a86b' },
    { id: 'accent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: toggleCode,
  doc: {
    intro:
      'El toggle perfecto solo necesita **una idea**: \`layout\`. Cuando el contenedor cambia su alineación (\`flex-start\` ↔ \`flex-end\`), Framer Motion **interpola la posición** del hijo en vez de saltar de golpe.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `El perrito del interruptor está marcado con \`layout\`. Al cambiar el estado, su posición cambia (el padre pasa de \`flex-start\` a \`flex-end\`) y \`layout\` **anima la diferencia**.

\`\`\`tsx
<button
  onClick={() => setOn(!on)}
  style={{
    background: on ? 'linear-gradient(135deg,#00a86b,#00ffb2)' : '#353535',
    justifyContent: on ? 'flex-end' : 'flex-start',
  }}
>
  <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} />
</button>
\`\`\`

- \`stiffness: 600\` → responde al instante, sin arrastrar
- \`damping: 30\` → sin rebote excesivo
- \`layout\` + spring = el clásico "deslizarse sobre carril" de los toggles

Bonus: con \`layoutId\` se puede **compartir la animación entre componentes** — por ejemplo, una barra indicadora que se desliza de pestaña a pestaña (tabs).`,
      },
      {
        title: 'Cuándo usar layout',
        body: `- Toggles, acordeones, tabs que deslizan una barra indicadora
- **Mover** un elemento de un contenedor a otro (con \`layoutId\`)
- Reordenamientos de listas (\`Reorder\` de Framer Motion está construido sobre esto)

Regla de oro: si dos estados solo cambian la **posición** de algo, \`layout\` hace el trabajo sin trackear valores manualmente.`,
      },
    ],
  },
}