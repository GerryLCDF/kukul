import { motion, type Variants } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { alpha, grad135 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

function settingsOf(s: ControlSettings) {
  return {
    stiffness: Number(s.stiffness) || 140,
    damping: Number(s.damping) || 14,
    initialScale: Number(s.initialScale) || 0.6,
    yStart: Number(s.yStart) || 40,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

function variantsOf(s: ControlSettings): Variants {
  const { stiffness, damping, initialScale, yStart } = settingsOf(s)
  return {
    hidden: { opacity: 0, scale: initialScale, y: yStart },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness, damping },
    },
  }
}

export default function FadeInGrow({ settings }: { settings: ControlSettings }) {
  const { colorPrimary, colorAccent, flat, noShadow } = settingsOf(settings)
  return (
    <motion.div
      variants={variantsOf(settings)}
      initial="hidden"
      animate="show"
      style={{
        width: 220,
        padding: '26px 26px 30px',
        borderRadius: 20,
        background: grad135(colorPrimary, colorAccent, flat),
        boxShadow: noShadow ? 'none' : `0 18px 40px ${alpha(colorPrimary, 0.4)}`,
        color: '#0b110d',
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>Hola</div>
      <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
        Aparece con escala y transparencia al montar el componente.
      </div>
    </motion.div>
  )
}

function fadeCode(s: ControlSettings): string {
  const { stiffness, damping, initialScale, yStart, colorPrimary, colorAccent, flat, noShadow } = settingsOf(s)
  return [
    "import { motion, type Variants } from 'framer-motion'",
    '',
    'const card: Variants = {',
    `  hidden: { opacity: 0, scale: ${initialScale}, y: ${yStart} },`,
    '  show: {',
    '    opacity: 1,',
    '    scale: 1,',
    '    y: 0,',
    `    transition: { type: 'spring', stiffness: ${stiffness}, damping: ${damping} },`,
    '  },',
    '}',
    '',
    'export default function FadeInGrow() {',
    '  return (',
    '    <motion.div',
    '      variants={card}',
    '      initial="hidden"',
    '      animate="show"',
    '      style={{',
    flat
      ? `        background: '${colorPrimary}',`
      : `        background: 'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})',`,
    '        borderRadius: 16,',
    '        padding: "28px 34px",',
    '        color: "#0b110d",',
    '        fontWeight: 700,',
    noShadow ? '        boxShadow: "none",' : '        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",',
    '      }}',
    '    >',
    '      Tu contenido',
    '    </motion.div>',
    '  )',
    '}',
  ].join('\n')
}

export const fadeInGrow: AnimationEntry = {
  id: 'fade-in-grow',
  title: 'Fade + Scale',
  icon: Sparkles,
  tags: ['entrada', 'spring', '1 elemento'],
  summary: 'Entrada suave: el elemento aparece con transparencia e irá creciendo desde un porcentaje inicial hasta su tamaño real con física de muelle.',
  Component: FadeInGrow,
  replayable: true,
  previewScale: 0.6,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'stiffness', label: 'Rigidez (spring)', type: 'range', min: 40, max: 400, step: 10, initial: 140 },
    { id: 'damping', label: 'Amortiguación', type: 'range', min: 5, max: 40, step: 1, initial: 14 },
    { id: 'initialScale', label: 'Escala inicial', type: 'range', min: 0.3, max: 1, step: 0.05, initial: 0.6 },
    { id: 'yStart', label: 'Desplazamiento Y', type: 'range', min: 0, max: 120, step: 5, initial: 40 },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: fadeCode,
  doc: {
    intro:
      'Esta animación se dispara **automáticamente** cuando el componente se monta. Ideal para **modales, tarjetas inhabitadas o cualquier elemento que deba "presentarse"** al aparecer en pantalla.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `Usa dos de las ideas centrales de **Framer Motion**:

- \`initial\` → estado de partida (oculto: \`opacity: 0, scale: 0.6\`)
- \`animate\` → estado final (visible)

Con el type **spring** en lugar de la curva por defecto, el movimiento se siente **físico** y natural, no lineal.

\`\`\`tsx
const card: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 40 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 14 },
  },
}

<motion.div
  variants={card}
  initial="hidden"
  animate="show"
>
  Tu contenido
</motion.div>
\`\`\`

- **stiffness** → rigidez del muelle (más alto = más brusco)
- **damping** → amortiguación (más alto = menos rebote)
- **Escala inicial** y **desplazamiento Y** controlan cuánto "viaja" el elemento`,
      },
      {
        title: 'Cuándo usarla',
        body: `- Modales y diálogos (combinada con backdrop)
- Tarjetas o componentes que cargan después del resto
- Bloques de contenido que aparecen al hacer scroll

Recomendación: **no uses animaciones de entrada en todo**, escoge bien los momentos y mantén la duración corta (250–450 ms).`,
      },
    ],
  },
}