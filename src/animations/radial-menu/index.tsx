import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type Variants,
} from 'framer-motion'
import {
  Home,
  MessageCircle,
  Camera,
  Music,
  Image,
  Settings,
  Radar,
  type LucideIcon,
} from 'lucide-react'
import type { AnimationEntry, ControlSettings } from '../../types'

type Item = { label: string; Icon: LucideIcon; iconName: string; color: string }

const items: Item[] = [
  { label: 'Inicio', Icon: Home, iconName: 'Home', color: '#00a86b' },
  { label: 'Mensajes', Icon: MessageCircle, iconName: 'MessageCircle', color: '#00c98d' },
  { label: 'Cámara', Icon: Camera, iconName: 'Camera', color: '#00ffb2' },
  { label: 'Música', Icon: Music, iconName: 'Music', color: '#34d399' },
  { label: 'Fotos', Icon: Image, iconName: 'Image', color: '#777777' },
  { label: 'Ajustes', Icon: Settings, iconName: 'Settings', color: '#2dd4a0' },
]

const R = 112
const iconSize = 52
const labelOffset = iconSize / 2 + 4
const spring = { type: 'spring', stiffness: 260, damping: 20 } as const

function labelPos(a: number) {
  return { x: Math.cos(a) * labelOffset, y: Math.sin(a) * labelOffset }
}

function itemPos(index: number, count: number) {
  const a = (index / count) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * R, y: Math.sin(a) * R }
}

interface OptionProps {
  item: Item
  index: number
  count: number
  variants: Variants
  active: boolean
  dimmed: boolean
  solid: boolean
  glow: boolean
  wobble: boolean
  noShadow: boolean
  onEnter: () => void
  onLeave: () => void
  onPick: () => void
}

function MenuOption({
  item,
  index,
  count,
  variants,
  active,
  dimmed,
  solid,
  glow,
  wobble,
  noShadow,
  onEnter,
  onLeave,
  onPick,
}: OptionProps) {
  const controls = useAnimationControls()
  const a = (index / count) * Math.PI * 2 - Math.PI / 2
  const lp = labelPos(a)

  useEffect(() => {
    if (active) {
      controls.start({
        scale: 1.28,
        opacity: 1,
        rotate: wobble ? [0, -11, 11, -6, 0] : 0,
        boxShadow: glow
          ? `0 0 26px ${item.color}99`
          : noShadow
            ? 'none'
            : '0 10px 22px rgba(0,0,0,0.5)',
        transition: {
          scale: spring,
          opacity: { duration: 0.15 },
          boxShadow: { type: 'tween', duration: 0.2 },
          rotate: wobble
            ? { type: 'tween', duration: 0.45, ease: 'easeInOut' }
            : { type: 'tween', duration: 0.15 },
        },
      })
    } else {
      const idleShadow = glow
        ? `0 6px 16px ${item.color}44`
        : noShadow
          ? 'none'
          : '0 4px 10px rgba(0,0,0,0.4)'
      controls.start({
        scale: dimmed ? 0.82 : 1,
        opacity: dimmed ? 0.55 : 1,
        rotate: 0,
        boxShadow: idleShadow,
        transition: {
          scale: spring,
          rotate: { type: 'tween', duration: 0.15 },
          opacity: { duration: 0.15 },
          boxShadow: { duration: 0.2 },
        },
      })
    }
  }, [active, dimmed, wobble, glow, noShadow, item.color, controls])

  return (
    <motion.div
      custom={index}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="rm-item"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onPick}
      role="button"
      tabIndex={0}
      aria-label={item.label}
    >
      <motion.div
        className="rm-icon"
        animate={controls}
        initial={{ scale: 0 }}
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: 999,
          background: solid
            ? item.color
            : `linear-gradient(135deg, ${item.color}, ${item.color}99)`,
          display: 'grid',
          placeItems: 'center',
          boxShadow: glow
            ? `0 6px 16px ${item.color}44`
            : noShadow
              ? 'none'
              : '0 4px 10px rgba(0,0,0,0.4)',
          border: '2px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        }}
      >
        <item.Icon size={22} color="#fff" strokeWidth={2.2} />
      </motion.div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="label"
            className="rm-label"
            initial={{ opacity: 0, y: 5, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${lp.x}px, ${lp.y}px)`,
              background: '#1b1b1b',
              border: `1px solid ${item.color}66`,
              borderRadius: 999,
              padding: '3px 11px',
              fontSize: 12.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: noShadow ? 'none' : '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function makeVariants(count: number): Variants {
  return {
    initial: (i: number) => ({
      scale: 0,
      opacity: 0,
      x: 0,
      y: (i === 0 ? -1 : 1) * 14, // pequeño desfase vertical de salida
    }),
    enter: (i: number) => {
      const p = itemPos(i, count)
      return {
        scale: 1,
        opacity: 1,
        x: p.x,
        y: p.y,
        transition: { ...spring, delay: 0.12 + i * 0.06 },
      }
    },
    exit: (i: number) => {
      const p = itemPos(i, count)
      return {
        scale: 0,
        opacity: 0,
        x: 0,
        y: p.y * 0.35,
        transition: { duration: 0.16, delay: (count - 1 - i) * 0.03 },
      }
    },
  }
}

export default function RadialMenu({ settings }: { settings: ControlSettings }) {
  const solid = !!settings.solid || !!settings.flat
  const glow = !!settings.glow
  const wobble = !!settings.wobble
  const noShadow = !!settings.noShadow
  const centerColor = String(settings.centerColor) || '#216e4b'
  const count = Math.max(1, Math.min(6, Number(settings.count) || 6))
  const visible = items.slice(0, count)

  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const timer = useRef<number>(0)
  const variants = useMemo(() => makeVariants(count), [count])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const pick = (it: Item) => {
    setOpen(false)
    setHover(null)
    setToast(`${it.label} seleccionado`)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(''), 1500)
  }

  return (
    <div style={{ position: 'relative', width: 340, height: 340 }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#212121',
              border: '1px solid #353535',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 13,
              whiteSpace: 'nowrap',
              zIndex: 30,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open &&
          visible.map((it, i) => (
            <MenuOption
              key={it.label}
              item={it}
              index={i}
              count={count}
              variants={variants}
              active={hover === i}
              dimmed={hover !== null && hover !== i}
              solid={solid}
              glow={glow}
              wobble={wobble}
              noShadow={noShadow}
              onEnter={() => setHover(i)}
              onLeave={() => setHover((h) => (h === i ? null : h))}
              onPick={() => pick(it)}
            />
          ))}
      </AnimatePresence>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
        }}
      >
        <motion.button
          className="rm-btn"
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: open
              ? glow
                ? `0 0 34px ${centerColor}`
                : noShadow
                  ? 'none'
                  : '0 12px 30px rgba(0,0,0,0.5)'
              : noShadow
                ? 'none'
                : '0 12px 30px rgba(0,0,0,0.45)',
          }}
          transition={spring}
          style={{
            width: 68,
            height: 68,
            borderRadius: 999,
            border: open ? `2px solid ${centerColor}` : '1px solid #353535',
            background: centerColor,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
          }}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            style={{ width: 28, height: 28, position: 'relative', display: 'block' }}
          >
            <span
              style={{
                position: 'absolute',
                inset: '12px 0 12px 0',
                height: 3,
                borderRadius: 99,
                background: '#fff',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '12px',
                right: '12px',
                top: 0,
                bottom: 0,
                width: 3,
                margin: '0 auto',
                borderRadius: 99,
                background: '#fff',
              }}
            />
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}

function radialCode(s: ControlSettings): string {
  const solid = !!s.solid || !!s.flat
  const glow = !!s.glow
  const wobble = !!s.wobble
  const noShadow = !!s.noShadow
  const center = String(s.centerColor)
  const count = Math.max(1, Math.min(6, Number(s.count) || 6))
  const visible = items.slice(0, count)

  const imports = visible.map((it) => it.iconName).join(', ')

  return [
    `import { ${imports} } from 'lucide-react'`,
    '',
    'const R = 112 // radio del círculo',
    '',
    `// ${count} opciones · ${solid ? 'colores sólidos' : 'degradados'}`,
    'const pos = items.map((_, i) => {',
    '  const a = (i / items.length) * Math.PI * 2 - Math.PI / 2',
    '  return { x: Math.cos(a) * R, y: Math.sin(a) * R }',
    '})',
    '',
    `const items = [ // ${count} iconos de Lucide`,
    ...visible.map((it) => `  { label: '${it.label}', Icon: ${it.iconName}, color: '${it.color}' },`),
    ']',
    '',
    '// cada opción: al estar activa, escala + brillo (+ temblor si está activado)',
    '<motion.div',
    '  animate={{',
    '    scale: active ? 1.28 : 1,',
    wobble
      ? '    rotate: active ? [0, -11, 11, -6, 0] : 0, // temblor al hover'
      : '    rotate: 0, // temblor desactivado',
    glow
      ? `    boxShadow: active ? \`0 0 26px \${it.color}99\` : \`0 6px 16px \${it.color}44\`, // brillo`
      : noShadow
        ? '    boxShadow: "none", // sin sombra'
        : '    boxShadow: "0 4px 10px rgba(0,0,0,0.4)", // sin brillo',
    '  }}',
    '  style={{',
    solid
      ? '    background: it.color, // color sólido'
      : '    background: `linear-gradient(135deg, ${it.color}, ${it.color}99)`, // degradado',
    '  }}',
    '>',
    '  <it.Icon size={22} color="#fff" strokeWidth={2.2} />',
    '</motion.div>',
    '',
    `// botón central (centro: ${center})`,
    `<motion.button style={{ background: '${center}' }}>`,
    '  {/* el + rota 45° y se convierte en ✕ */}',
    '</motion.button>',
  ].join('\n')
}

export const radialMenu: AnimationEntry = {
  id: 'radial-menu',
  title: 'Menú circular +/X',
  icon: Radar,
  tags: ['menú', 'radial', 'entrada', 'hover', 'lucide'],
  summary: 'Botón circular con + que al hacer clic se transforma en X girando; hasta 6 opciones emergen de detrás una por una (procencia) y muestran su título al pasar el cursor. Iconos de Lucide.',
  Component: RadialMenu,
  previewScale: 0.55,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    {
      id: 'solid',
      label: 'Discos sin degradado',
      type: 'toggle',
      initial: false,
    },
    {
      id: 'glow',
      label: 'Efecto brillo de los círculos',
      type: 'toggle',
      initial: true,
    },
    {
      id: 'wobble',
      label: 'Temblor al acercar el cursor',
      type: 'toggle',
      initial: true,
    },
    { id: 'count', label: 'Cantidad de opciones', type: 'range', min: 1, max: 6, step: 1, initial: 6 },
  ],
  colors: [
    {
      id: 'centerColor',
      label: 'Color del centro',
      type: 'color',
      initial: '#216e4b',
    },
  ],
  code: radialCode,
  doc: {
    intro:
      'Un **menú radial** es una alternativa compacta y vistosa a los menús tradicionales. El **+ central** crece levemente al acercar el cursor, al hacer clic **rota 45° hasta convertirse en X**, y las opciones salen **de detrás del botón** hacia su posición circular, una tras otra. Los iconos vienen de la librería **Lucide** (`lucide-react`).',
    sections: [
      {
        title: 'Cómo funciona',
        body: `**1. El botón + que rota**

Dos barras (horizontal y vertical) forman el \`+\`. Con \`rotate: 45°\` se convierten en \`X\`. El zoom al hacer hover es un simple \`whileHover / whileTap\`.

\`\`\`tsx
<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
  <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: 'spring' }}>
    <span /> {/* barra horizontal */}
    <span /> {/* barra vertical */}
  </motion.span>
</motion.button>
\`\`\`

**2. Opciones que emergen de detrás**

Cada opción parte de \`scale: 0\` (los ceros coinciden con el centro) y se anima hacia su posición en el círculo. La posición se calcula con seno/coseno alrededor del centro:

\`\`\`tsx
const R = 112 // radio del círculo
const a = (i / items.length) * Math.PI * 2 - Math.PI / 2 // empieza arriba
const x = Math.cos(a) * R
const y = Math.sin(a) * R

variants: {
  initial: { scale: 0, x: 0, y: 0 },
  enter:   { scale: 1, x, y, transition: { delay: i * 0.06 } }, // procencia
  exit:    { scale: 0, x: 0, y: 0 },
}
\`\`\`

El **delay por índice** (\`i * 0.06s\`) crea el efecto *procencia*: las opciones emergen en orden, no todas a la vez.

**3. Título e icono al hover**

Con \`hover: number | null\` se sabe qué opción está activa: aparece el **label** en una píldora y el icono **reacciona**. En vez de keyframes dentro de \`animate\` (que a veces no se ven con springs), el temblor se dispara con **\`useAnimationControls\`**:

\`\`\`tsx
import { useAnimationControls } from 'framer-motion'

const controls = useAnimationControls()

// al hacerse activa la opción
useEffect(() => {
  if (active) {
    controls.start({
      rotate: wobble ? [0, -11, 11, -6, 0] : 0,
      transition: { rotate: { type: 'tween', duration: 0.45 } },
    })
  }
}, [active, wobble])
\`\`\`

Así el temblor es siempre **visible y reproducible** cada vez que el cursor entra en una opción.`,
      },
      {
        title: 'Cuándo usarla',
        body: `- Botones de **acción flotante (FAB)** que revelan accesos secundarios
- Menús de **atajos / acciones rápidas** en apps móviles o de escritorio
- Pickers de "compartir", "insertar", o herramientas de edición

Límites a tener en cuenta:

- **Máximo 6-8 opciones**; más allá el círculo se llena y las etiquetas chocan (sube \`R\` y baja el tamaño de los iconos)
- **Iconos**: tómalos de [lucide.dev/icons](https://lucide.dev/icons/) con \`lucide-react\` (ligeros, accesibles y consistentes en grosor de trazo)
- Accesibilidad: usa \`aria-expanded\`, \`role="button"\` y \`tabIndex\` en las opciones; los menús radiales son más difíciles de usar con teclado, así que mantén siempre un **fallback de navegación lineal** en producción`,
      },
    ],
  },
}