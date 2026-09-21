import { useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Waves } from 'lucide-react'
import { grad135 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

const allItems = [
  { t: 'Redes', d: 'Noticias, feed, timeline' },
  { t: 'Ecommerce', d: 'Lista de productos' },
  { t: 'Mensajería', d: 'Conversaciones y hilos' },
  { t: 'Dashboard', d: 'Métricas y KPIs' },
  { t: 'Media', d: 'Galerías y carruseles' },
  { t: 'Ajustes', d: 'Preferencias' },
  { t: 'Archivos', d: 'Documentos y nube' },
  { t: 'Búsqueda', d: 'Resultados y filtros' },
]

function settingsOf(s: ControlSettings) {
  return {
    stagger: Number(s.stagger) || 0.09,
    count: Math.max(1, Math.min(8, Number(s.count) || 3)),
    offsetY: Number(s.offsetY) || 24,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
  }
}

function variantsOf(s: ControlSettings): { container: Variants; item: Variants } {
  const { stagger, offsetY } = settingsOf(s)
  return {
    container: { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: 0.1 } } } as Variants,
    item: {
      hidden: { opacity: 0, y: offsetY, scale: 0.9 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 160, damping: 16 },
      },
    } as Variants,
  }
}

export default function StaggerList({ settings }: { settings: ControlSettings }) {
  const { count, colorPrimary, colorAccent, flat } = settingsOf(settings)
  const vs = useMemo(() => variantsOf(settings), [settings])
  const items = allItems.slice(0, count)

  return (
    <motion.ol
      variants={vs.container}
      initial="hidden"
      animate="show"
      style={{ listStyle: 'none', margin: 0, padding: 0, width: 280 }}
    >
      {items.map((it, idx) => (
        <motion.li
          key={it.t}
          variants={vs.item}
          style={{
            background: '#212121',
            border: '1px solid #353535',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              fontSize: 14,
              fontWeight: 800,
              background: grad135(colorPrimary, colorAccent, flat),
              color: '#0b110d',
            }}
          >
            {idx + 1}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{it.t}</div>
            <div style={{ fontSize: 13, color: '#9aa0a3' }}>{it.d}</div>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}

function staggerCode(s: ControlSettings): string {
  const { stagger, count, offsetY, colorPrimary, colorAccent, flat } = settingsOf(s)
  return [
    '// contenedor propaga el estado a los hijos',
    'const container: Variants = {',
    '  hidden: {},',
    `  show: { transition: { staggerChildren: ${stagger}, delayChildren: 0.1 } },`,
    '}',
    '',
    'const item: Variants = {',
    `  hidden: { opacity: 0, y: ${offsetY}, scale: 0.9 },`,
    '  show: { opacity: 1, y: 0, scale: 1 },',
    '}',
    '',
    'const badge: React.CSSProperties = {',
    flat
      ? `  background: '${colorPrimary}', // color plano`
      : `  background: 'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})',`,
    '}',
    '',
    '<motion.ol variants={container} initial="hidden" animate="show">',
    `    {items.slice(0, ${count}).map((it) => (`,
    '    <motion.li variants={item}>...</motion.li>',
    '  ))}',
    '</motion.ol>',
  ].join('\n')
}

export const staggerList: AnimationEntry = {
  id: 'stagger-list',
  title: 'Lista en cascada',
  icon: Waves,
  tags: ['lista', 'stagger', 'varios elementos'],
  summary: 'Cada ítem de la lista entra uno tras otro con un pequeño desfase, creando un efecto cascada muy usado en feeds y menús.',
  Component: StaggerList,
  replayable: true,
  previewScale: 0.6,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'stagger', label: 'Separación (stagger)', type: 'range', min: 0, max: 0.3, step: 0.01, initial: 0.09 },
    { id: 'count', label: 'Cantidad de ítems', type: 'range', min: 2, max: 8, step: 1, initial: 3 },
    { id: 'offsetY', label: 'Desplazamiento Y', type: 'range', min: 0, max: 80, step: 4, initial: 24 },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: staggerCode,
  doc: {
    intro:
      'El patrón **cascada (stagger)** es el más útil en interfaces de lista: los elementos se presentan **secuencialmente** en vez de todos a la vez, dando ritmo a la pantalla.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `Un **contenedor padre** propaga su estado (\`hidden\` / \`show\`) a todos los hijos, y a cada hijo se le da un \`staggerChildren\` que es el **retraso en segundos entre uno y otro**.

\`\`\`tsx
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1 },
}

<motion.ol variants={container} initial="hidden" animate="show">
  {items.map((it) => (
    <motion.li variants={item}>...</motion.li>
  ))}
</motion.ol>
\`\`\`

- **staggerChildren**: retraso en segundos entre la animación de cada hijo
- **delayChildren**: retraso extra antes de empezar con el primero`,
      },
      {
        title: 'Cuándo usarla',
        body: `- **Listas infinitas** que se rellenan poco a poco
- Menús desplegables y dropdowns
- Pantalla de bienvenida o onboarding en pasos

Ojo: en listas largas, stagger largos restan velocidad. Mantén el desfase pequeño (0.05–0.1s).
`,
      },
    ],
  },
}