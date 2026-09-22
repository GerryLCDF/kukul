import { useRef, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Magnet } from 'lucide-react'
import { alpha, grad135 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

function settingsOf(s: ControlSettings) {
  return {
    intensity: Number(s.intensity) || 0.35,
    stiffness: Number(s.stiffness) || 220,
    damping: Number(s.damping) || 15,
    tilt: !!s.tilt,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

export default function MagneticButton({ settings }: { settings: ControlSettings }) {
  const { intensity, stiffness, damping, tilt, colorPrimary, colorAccent, flat, noShadow } = settingsOf(settings)
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness, damping })
  const sy = useSpring(y, { stiffness, damping })

  const glowX = useTransform(sx, (v) => v / 3)
  const glowY = useTransform(sy, (v) => v / 3)

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * intensity)
    y.set(dy * intensity)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div style={{ perspective: 400 }}>
      <motion.button
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          x: sx,
          y: sy,
          ...(tilt ? { rotateX: glowY, rotateY: glowX } : {}),
          background: grad135(colorPrimary, colorAccent, flat),
          border: 'none',
          borderRadius: 999,
          padding: '16px 30px',
          color: '#0b110d',
          cursor: 'pointer',
          boxShadow: noShadow ? 'none' : `0 14px 34px ${alpha(colorPrimary, 0.4)}`,
        }}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        <span style={{ fontSize: 17, fontWeight: 700 }}>Botón magnético</span>
      </motion.button>
    </div>
  )
}

function magneticCode(s: ControlSettings): string {
  const { intensity, stiffness, damping, tilt, colorPrimary, colorAccent, flat, noShadow } = settingsOf(s)
  const bg = flat
    ? `'${colorPrimary}'`
    : `'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})'`
  return [
    "import { useRef } from 'react'",
    "import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'",
    '',
    'export default function MagneticButton() {',
    '  const ref = useRef<HTMLButtonElement>(null)',
    '  const x = useMotionValue(0)',
    '  const y = useMotionValue(0)',
    `  const sx = useSpring(x, { stiffness: ${stiffness}, damping: ${damping} })`,
    `  const sy = useSpring(y, { stiffness: ${stiffness}, damping: ${damping} })`,
    '',
    '  // rotación 3D derivada del desplazamiento (opcional)',
    tilt
      ? '  const rotateX = useTransform(sy, [-32, 32], [12, -12])'
      : '  // tilt OFF: sin rotación 3D',
    tilt
      ? '  const rotateY = useTransform(sx, [-32, 32], [-12, 12])'
      : '',
    '',
    '  const onMove = (e: React.MouseEvent) => {',
    '    const rect = ref.current!.getBoundingClientRect()',
    '    const dx = e.clientX - (rect.left + rect.width / 2)',
    '    const dy = e.clientY - (rect.top + rect.height / 2)',
    `    x.set(dx * ${intensity})`,
    `    y.set(dy * ${intensity})`,
    '  }',
    '',
    '  const onLeave = () => { x.set(0); y.set(0) }',
    '',
    '  return (',
    '    <motion.button',
    '      ref={ref}',
    '      onMouseMove={onMove}',
    '      onMouseLeave={onLeave}',
    '      whileTap={{ scale: 0.92 }}',
    '      style={{',
    `        x: sx, y: sy,`,
    tilt ? `        rotateX, rotateY,` : '',
    '        background: ' + bg + ',',
    '        color: "#0b110d",',
    '        border: "none",',
    '        borderRadius: 999,',
    '        padding: "14px 28px",',
    '        fontSize: 15,',
    '        fontWeight: 700,',
    '        cursor: "pointer",',
    '        transformStyle: "preserve-3d",',
    noShadow ? '        boxShadow: "none",' : '        boxShadow: "0 14px 34px rgba(0,0,0,0.35)",',
    '      }}',
    '    >',
    '      Botón magnético',
    '    </motion.button>',
    '  )',
    '}',
  ].join('\n')
}

export const magneticButton: AnimationEntry = {
  id: 'magnetic-button',
  title: 'Botón magnético',
  icon: Magnet,
  tags: ['hover', 'mouse', 'spring', 'feedback'],
  summary: 'El botón se acerca ligeramente al cursor como imantado y al hacer clic encoge con un rebote. Feedback inmediato, cero JS de posicionamiento manual.',
  Component: MagneticButton,
  previewScale: 0.9,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'intensity', label: 'Intensidad del imán', type: 'range', min: 0.1, max: 0.6, step: 0.05, initial: 0.35 },
    { id: 'stiffness', label: 'Rigidez de reacción', type: 'range', min: 100, max: 500, step: 20, initial: 220 },
    { id: 'damping', label: 'Amortiguación', type: 'range', min: 8, max: 30, step: 1, initial: 15 },
    { id: 'tilt', label: 'Efecto 3D (rotación)', type: 'toggle', initial: true },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: magneticCode,
  doc: {
    intro:
      'El "magnetismo" es una de las interacciones favoritas en dashboards modernos: **el botón se desplaza unos píxeles hacia el cursor** y vuelve al centro cuando salimos. Se consigue con \`useMotionValue\` + \`useSpring\`, sin re-renders.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `1. En \`onMouseMove\` se calcula la **distancia del cursor al centro** del botón.
2. Esa distancia se guarda en \`useMotionValue\` (0 al salir).
3. \`useSpring\` suaviza el valor → el botón "flota" hacia el cursor.

\`\`\`tsx
const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
  const rect = ref.current!.getBoundingClientRect()
  const dx = e.clientX - (rect.left + rect.width / 2)
  const dy = e.clientY - (rect.top + rect.height / 2)
  x.set(dx * 0.35) // 0.35 = intensidad del imán
  y.set(dy * 0.35)
}

const onLeave = () => { x.set(0); y.set(0) }

<motion.button
  onMouseMove={onMove}
  onMouseLeave={onLeave}
  style={{ x, y }}
  whileTap={{ scale: 0.92 }}
>
  Botón magnético
</motion.button>
\`\`\`

Como el valor es un **motion value**, Framer Motion lo aplica directo al estilo **sin re-renderizar** React en cada frame de mouse. Ideal para desempeño.`,
      },
      {
        title: 'Ajustes para tu propio botón',
        body: `- Multiplica por más: \`0.5\` = más recorrido, \`0.2\` = más sutil
- \`stiffness: 220\` controla la velocidad de reacción; \`damping: 15\` el rebote
- Combínalo con \`whileHover\` y \`whileTap\` para dar más vida

Bonus: la rotación suave (\`rotateX\`/\`rotateY\`) da un efecto **3D** con \`perspective\` en el padre.`,
      },
    ],
  },
}