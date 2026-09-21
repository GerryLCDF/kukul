import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelsTopLeft } from 'lucide-react'
import { alpha, grad135 } from '../../utils/color'
import type { AnimationEntry, ControlSettings } from '../../types'

function settingsOf(s: ControlSettings) {
  return {
    spring: !!s.spring,
    scaleStart: Number(s.scaleStart) || 0.7,
    yStart: Number(s.yStart) || 30,
    blur: !!s.blur,
    blurAmount: Number(s.blurAmount) || 6,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

export default function ModalDemo({ settings }: { settings: ControlSettings }) {
  const { spring, scaleStart, yStart, blur, blurAmount, colorPrimary, colorAccent, flat, noShadow } = settingsOf(settings)
  const [open, setOpen] = useState(false)

  const openTrans = spring
    ? { type: 'spring', stiffness: 320, damping: 24 } as const
    : { type: 'tween', duration: 0.25, ease: 'easeOut' } as const

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: grad135(colorPrimary, colorAccent, flat),
          color: '#0b110d',
          border: 'none',
          borderRadius: 999,
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: noShadow ? 'none' : `0 12px 30px ${alpha(colorPrimary, 0.4)}`,
        }}
      >
        Abrir modal
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              ...(blur ? { backdropFilter: `blur(${blurAmount}px)` } : {}),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <motion.div
              initial={{ scale: scaleStart, y: yStart, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: scaleStart * 1.05, y: yStart * 0.7, opacity: 0 }}
              transition={openTrans}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#212121',
                border: '1px solid #353535',
                borderRadius: 18,
                padding: '24px 26px',
                width: 300,
                boxShadow: noShadow ? 'none' : '0 30px 80px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>Modal</div>
              <p style={{ margin: '0 0 16px', color: '#9aa0a3', fontSize: 14 }}>
                Con <code>AnimatePresence</code> la salida también se anima, algo que React
                solo no puede hacer.
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '100%',
                  background: '#353535',
                  color: '#f0f0f0',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 0',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function modalCode(s: ControlSettings): string {
  const { spring, scaleStart, yStart, blur, blurAmount, colorPrimary, colorAccent, flat, noShadow } = settingsOf(s)
  const cardTrans = spring
    ? "  transition={{ type: 'spring', stiffness: 320, damping: 24 }}"
    : "  transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}"
  return [
    '<AnimatePresence>',
    '  {open && (',
    '    <motion.div',
    '      initial={{ opacity: 0 }}',
    '      animate={{ opacity: 1 }}',
    '      exit={{ opacity: 0 }}',
    '      onClick={() => setOpen(false)}',
    '      style={{',
    '        position: "absolute", inset: 0,',
    '        background: "rgba(0,0,0,0.65)",',
    blur ? `        backdropFilter: "blur(${blurAmount}px)",` : '        // sin difuminado',
    '      }}',
    '    >',
    '      <motion.div',
    `        initial={{ scale: ${scaleStart}, y: ${yStart}, opacity: 0 }}`,
    '        animate={{ scale: 1, y: 0, opacity: 1 }}',
    `        exit={{ scale: ${Math.round(scaleStart * 1.05 * 100) / 100}, y: ${Math.round(yStart * 0.7 * 100) / 100}, opacity: 0 }}`,
    cardTrans,
    flat
      ? `        style={{ background: '${colorPrimary}', borderRadius: 999, padding: "12px 24px" }}`
      : `        style={{ background: 'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})', borderRadius: 999, padding: "12px 24px" }}`,
    noShadow ? '        // sin sombra' : '        // sombra: "0 30px 80px rgba(0,0,0,0.5)"',
    '      >',
    '        Contenido del modal',
    '      </motion.div>',
    '    </motion.div>',
    '  )}',
    '</AnimatePresence>',
  ].join('\n')
}

export const modal: AnimationEntry = {
  id: 'modal',
  title: 'Modal con entrada y salida',
  icon: PanelsTopLeft,
  tags: ['modal', 'AnimatePresence', 'entrada/salida'],
  summary: 'Modal con backdrop que se difumina y tarjeta que entra en escala. La clave: AnimatePresence anima tanto la entrada como la salida.',
  Component: ModalDemo,
  previewScale: 0.75,
controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'spring', label: 'Entrada con física (spring)', type: 'toggle', initial: true },
    { id: 'scaleStart', label: 'Escala inicial', type: 'range', min: 0.4, max: 1, step: 0.05, initial: 0.7 },
    { id: 'yStart', label: 'Desplazamiento Y', type: 'range', min: 0, max: 120, step: 5, initial: 30 },
    { id: 'blur', label: 'Difuminar fondo', type: 'toggle', initial: true },
    { id: 'blurAmount', label: 'Cantidad de blur', type: 'range', min: 2, max: 16, step: 1, initial: 6 },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    { id: 'colorAccent', label: 'Color acento', type: 'color', initial: '#00ffb2' },
  ],
  code: modalCode,
  doc: {
    intro:
      'El problema clásico de React: cuando un elemento **desaparece** (se desmonta), ya no hay manera de animarlo. \`AnimatePresence\` soluciona esto: **deja el componente vivo durante su animación de salida** y lo desmonta al terminar.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `1. \`<AnimatePresence>\` envuelve la condición (\`{open && ...}\`).
2. Cada hijo con \`key\` independiente anima su \`initial → animate\` al entrar.
3. Al volverse \`false\`, el **exit** se ejecuta antes de desmontar.

\`\`\`tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ... */}
    </motion.div>
  )}
</AnimatePresence>
\`\`\`

En el ejemplo, la **tarjeta** entra con \`type: 'spring'\` (escala + deslizamiento) y el **backdrop** solo cambia transparencia. Hacer \`e.stopPropagation()\` en la tarjeta evita que el clic en ella cierre el modal.`,
      },
      {
        title: 'Buenas prácticas de accesibilidad',
        body: `Cuando lo lleves a producción, añade:

- Cerrar con **Escape** (\`useEffect\` con listener de teclado)
- **Focus trap** al primer foco del modal
- \`role="dialog"\` y \`aria-modal="true"\`
- **No bloquees el scroll** del body sin motivo

Para proyectos serios existe la librería \`@radix-ui/react-dialog\` que puedes combinar con Framer Motion mediante su API de presentación.`,
      },
    ],
  },
}