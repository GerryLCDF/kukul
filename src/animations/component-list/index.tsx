import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { Camera, Check, ChevronDown, Circle, Cylinder, Eye, EyeOff, Box, Focus, Gamepad2, GripVertical, Layers, Lightbulb, RectangleHorizontal, Type, User, Volume2, VolumeX, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AnimationEntry, ControlSettings } from '../../types'
import { alpha, grad135 } from '../../utils/color'

type Item = { id: string; name: string; type: string; Icon: LucideIcon }

const BASE: Item[] = [
  { id: 'player', name: 'Player', type: 'Jugador', Icon: User },
  { id: 'camera', name: 'Camera2D', type: 'Cámara', Icon: Camera },
  { id: 'control', name: 'Control', type: 'Controlador', Icon: Gamepad2 },
  { id: 'cilindro', name: 'Cilindro', type: '3D primitivo', Icon: Cylinder },
  { id: 'esfera', name: 'Esfera', type: '3D primitivo', Icon: Circle },
  { id: 'cubo', name: 'Cubo', type: '3D primitivo', Icon: Box },
  { id: 'luz', name: 'Luz', type: 'Iluminación', Icon: Lightbulb },
  { id: 'audio', name: 'Audio', type: 'Sonido', Icon: Volume2 },
  { id: 'texto', name: 'Texto', type: '2D', Icon: Type },
  { id: 'plano', name: 'Plano', type: '2D', Icon: RectangleHorizontal },
]

function settingsOf(s: ControlSettings) {
  return {
    count: Math.max(2, Math.min(10, Number(s.count) || 6)),
    drag: s.drag !== false,
    glow: s.glow !== false,
    cascade: s.cascade !== false,
    showSolo: s.showSolo !== false,
    showMute: s.showMute !== false,
    showEye: s.showEye !== false,
    showX: s.showX !== false,
    showCount: s.showCount !== false,
    collapsable: s.collapsable !== false,
    collapseRight: !!s.collapseRight,
    showIcons: s.showIcons !== false,
    showType: s.showType !== false,
    confirmDelete: s.confirmDelete !== false,
    colorPrimary: String(s.colorPrimary) || '#00a86b',
    colorAccent: String(s.colorAccent) || '#00ffb2',
    flat: !!s.flat,
    noShadow: !!s.noShadow,
  }
}

function IconButton(props: {
  active?: boolean
  disabledStyle?: boolean
  title: string
  onToggle: () => void
  children: ReactNode
  primary: string
  accent: string
  flat: boolean
  glow: boolean
  noShadow: boolean
  danger?: boolean
}) {
  const { active, disabledStyle, title, onToggle, children, primary, accent, flat, glow, noShadow, danger } = props
  const activeBg = disabledStyle ? '#2a2a2a' : grad135(primary, accent, flat)
  const activeColor = disabledStyle ? '#8a8a8a' : '#0b110d'
  const activeBorder = disabledStyle ? '#3a3a3a' : 'transparent'
  return (
    <motion.button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onToggle}
      whileHover={danger ? { backgroundColor: '#e5484d', color: '#ffffff', borderColor: '#e5484d' } : { opacity: 0.8 }}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 24,
        height: 24,
        padding: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 8,
        cursor: 'pointer',
        border: '1px solid transparent',
        background: active ? activeBg : 'transparent',
        color: active ? activeColor : danger ? '#b06a6a' : '#8d9294',
        borderColor: active ? activeBorder : 'transparent',
        boxShadow: active && !disabledStyle && glow && !noShadow ? `0 0 9px ${alpha(primary, 0.5)}` : 'none',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </motion.button>
  )
}

export default function ComponentList({ settings }: { settings: ControlSettings }) {
  const {
    count,
    drag,
    glow,
    cascade,
    showSolo,
    showMute,
    showEye,
    showX,
    showCount,
    collapsable,
    collapseRight,
    showIcons,
    showType,
    confirmDelete,
    colorPrimary,
    colorAccent,
    flat,
    noShadow,
  } = settingsOf(settings)
  const [order, setOrder] = useState<string[]>(() => BASE.slice(0, count).map((b) => b.id))
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [mutedIds, setMutedIds] = useState<string[]>([])
  const [soloId, setSoloId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setOrder((prev) => {
      const base = BASE.slice(0, count).map((b) => b.id)
      const missing = base.filter((id) => !prev.includes(id))
      return missing.length ? [...prev, ...missing] : prev
    })
  }, [count])

  const visibleCount = order.filter((id) => !hiddenIds.includes(id)).length
  const byId = new Map(BASE.map((b) => [b.id, b]))
  const activeGlow = glow && !noShadow

  const onReorder = (next: string[]) => setOrder(next)

  const toggleHidden = (id: string) => {
    setHiddenIds((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))
    if (soloId === id) setSoloId(null)
    if (pendingDeleteId === id) setPendingDeleteId(null)
  }

  const toggleMuted = (id: string) =>
    setMutedIds((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  const toggleSolo = (id: string) => setSoloId((s) => (s === id ? null : id))

  const remove = (id: string) => {
    setOrder((o) => o.filter((x) => x !== id))
    setHiddenIds((h) => h.filter((x) => x !== id))
    setMutedIds((m) => m.filter((x) => x !== id))
    if (soloId === id) setSoloId(null)
    setPendingDeleteId(null)
  }

  const clickDelete = (id: string) => {
    if (confirmDelete) setPendingDeleteId(id)
    else remove(id)
  }

  return (
    <div
      style={{
        width: 320,
        background: '#191919',
        border: '1px solid #353535',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: noShadow ? 'none' : '0 18px 50px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px 10px 10px',
          borderBottom: `1px solid ${flat ? alpha(colorPrimary, 0.6) : 'rgba(11,17,13,0.4)'}`,
          background: grad135(colorPrimary, colorAccent, flat),
        }}
      >
        {collapsable && !collapseRight && (
          <motion.button
            type="button"
            title={collapsed ? 'Expandir lista' : 'Colapsar lista'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 26,
              height: 26,
              padding: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(11,17,13,0.12)',
              color: '#0b110d',
              flexShrink: 0,
            }}
          >
            <motion.span animate={{ rotate: collapsed ? -90 : 0 }} style={{ display: 'grid', placeItems: 'center' }}>
              <ChevronDown size={15} />
            </motion.span>
          </motion.button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#0b110d' }}>Mundo</div>
          {showCount && (
            <div style={{ fontSize: 12, color: 'rgba(11,17,13,0.72)' }}>
              {visibleCount} de {order.length} componentes
            </div>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(11,17,13,0.72)' }}>escena</span>
        {collapsable && collapseRight && (
          <motion.button
            type="button"
            title={collapsed ? 'Expandir lista' : 'Colapsar lista'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 26,
              height: 26,
              padding: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 8,
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(11,17,13,0.12)',
              color: '#0b110d',
              flexShrink: 0,
            }}
          >
            <motion.span animate={{ rotate: collapsed ? -90 : 0 }} style={{ display: 'grid', placeItems: 'center' }}>
              <ChevronDown size={15} />
            </motion.span>
          </motion.button>
        )}
      </div>

      <motion.div
        initial={false}
        animate={collapsed ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ overflow: 'hidden' }}
      >
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={onReorder}
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
        <AnimatePresence>
          {order.length === 0 ? (
            <div
              style={{
                padding: '26px 10px',
                textAlign: 'center',
                fontSize: 12.5,
                color: '#6b6b6b',
                border: '1px dashed #353535',
                borderRadius: 12,
              }}
            >
              Lista vacía · toca Repetir
            </div>
          ) : (
            order.map((id, i) => {
              const item = byId.get(id)!
              const isSolo = soloId === id
              const isSoloDim = !!soloId && !isSolo
              const isMuted = mutedIds.includes(id)
              const isHidden = hiddenIds.includes(id)
              const rowOpacity = isHidden ? 0.5 : isSoloDim ? 0.35 : isMuted ? 0.75 : 1
              const nameColor = isHidden ? '#6b6b6b' : isMuted ? '#9aa0a3' : '#f0f0f0'
              return (
                <Reorder.Item
                  key={id}
                  value={id}
                  dragListener={drag}
                  initial={cascade ? { opacity: 0, y: 16, scale: 0.96 } : false}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: cascade
                      ? { delay: i * 0.05, type: 'spring', stiffness: 220, damping: 22 }
                      : { type: 'spring', stiffness: 260, damping: 24 },
                  }}
                  exit={{ opacity: 0, x: 26, scale: 0.96, transition: { duration: 0.18 } }}
                  whileDrag={
                    noShadow
                      ? { scale: 1.03 }
                      : { scale: 1.03, boxShadow: `0 12px 28px rgba(0,0,0,0.5), 0 0 18px ${alpha(colorPrimary, 0.35)}` }
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 52,
                    padding: '0 8px 0 10px',
                    background: isSolo ? 'rgba(0,168,107,0.08)' : '#212121',
                    border: `1px solid ${isSolo ? alpha(colorPrimary, 0.7) : isHidden ? '#2f2f2f' : '#353535'}`,
                    borderRadius: 12,
                    opacity: rowOpacity,
                    boxShadow: isSolo && activeGlow && !isHidden ? `0 0 16px ${alpha(colorPrimary, 0.25)}` : 'none',
                    cursor: drag ? 'grab' : 'default',
                    userSelect: 'none',
                    touchAction: 'none',
                  }}
                >
                  {drag && (
                    <span
                      style={{
                        color: isHidden ? '#4a4a4a' : '#6b6b6b',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <GripVertical size={15} />
                    </span>
                  )}
                  {showIcons && (
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        background: isSoloDim || isMuted || isHidden ? '#1b1b1b' : grad135(colorPrimary, colorAccent, flat),
                        color: '#0b110d',
                        border: isMuted || isHidden ? '1px solid #3a3a3a' : '1px solid transparent',
                        opacity: isMuted || isHidden ? 0.55 : 1,
                      }}
                    >
                      <item.Icon size={15} />
                    </span>
                  )}
                  {pendingDeleteId === id ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 9,
                        padding: '7px 8px 7px 10px',
                      }}
                    >
                      <span
                        style={{
                          color: '#f0f0f0',
                          fontWeight: 700,
                          fontSize: 13,
                          flex: 1,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        ¿Eliminar {item.name}?
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <motion.button
                          type="button"
                          title="Confirmar"
                          aria-label="Confirmar"
                          onClick={() => remove(id)}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            width: 24,
                            height: 24,
                            padding: 0,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 8,
                            cursor: 'pointer',
                            border: 'none',
                            background: grad135(colorPrimary, colorAccent, flat),
                            color: '#0b110d',
                          }}
                        >
                          <Check size={14} />
                        </motion.button>
                        <motion.button
                          type="button"
                          title="Cancelar"
                          aria-label="Cancelar"
                          onClick={() => setPendingDeleteId(null)}
                          whileTap={{ scale: 0.9 }}
                          style={{
                            width: 24,
                            height: 24,
                            padding: 0,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 8,
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.4)',
                            background: 'transparent',
                            color: '#ffffff',
                          }}
                        >
                          <X size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: nameColor,
                            textDecoration: isMuted ? 'line-through' : 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                        {showType && (
                          <div style={{ fontSize: 11.5, color: isHidden ? '#555' : '#6b6b6b' }}>{item.type}</div>
                        )}
                      </div>
                      {(showSolo || showMute || showEye || showX) && (
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {showSolo && (
                            <IconButton
                              active={isSolo}
                              title={isSolo ? 'Quitar solo' : 'Solo'}
                              onToggle={() => toggleSolo(id)}
                              primary={colorPrimary}
                              accent={colorAccent}
                              flat={flat}
                              glow={glow}
                              noShadow={noShadow}
                            >
                              <Focus size={13} />
                            </IconButton>
                          )}
                          {showMute && (
                            <IconButton
                              active={isMuted}
                              title={isMuted ? 'Activar sonido' : 'Mute'}
                              onToggle={() => toggleMuted(id)}
                              primary={colorPrimary}
                              accent={colorAccent}
                              flat={flat}
                              glow={glow}
                              noShadow={noShadow}
                            >
                              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                            </IconButton>
                          )}
                          {showEye && (
                            <IconButton
                              active={isHidden}
                              disabledStyle={isHidden}
                              title={isHidden ? 'Mostrar' : 'Ocultar'}
                              onToggle={() => toggleHidden(id)}
                              primary={colorPrimary}
                              accent={colorAccent}
                              flat={flat}
                              glow={glow}
                              noShadow={noShadow}
                            >
                              {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                            </IconButton>
                          )}
                          {showX && (
                            <IconButton
                              danger
                              title="Eliminar"
                              onToggle={() => clickDelete(id)}
                              primary={colorPrimary}
                              accent={colorAccent}
                              flat={flat}
                              glow={glow}
                              noShadow={noShadow}
                            >
                              <X size={13} />
                            </IconButton>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Reorder.Item>
              )
            })
          )}
        </AnimatePresence>
        </Reorder.Group>
      </motion.div>

      {drag && !collapsed && (
        <div
          style={{
            padding: '8px 16px 12px',
            borderTop: '1px solid #2a2a2a',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#6b6b6b',
            fontSize: 11.5,
          }}
        >
          <GripVertical size={12} /> Arrastra una fila para reordenar
        </div>
      )}
    </div>
  )
}

function listCode(s: ControlSettings): string {
  const {
    count,
    drag,
    glow,
    cascade,
    showSolo,
    showMute,
    showEye,
    showX,
    showCount,
    collapsable,
    collapseRight,
    showIcons,
    showType,
    confirmDelete,
    colorPrimary,
    colorAccent,
    flat,
    noShadow,
  } = settingsOf(s)
  const activeBg = flat ? `'${colorPrimary}'` : `'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})'`
  const headBg = flat ? `'${colorPrimary}'` : `'linear-gradient(135deg, ${colorPrimary}, ${colorAccent})'`
  const shadow = noShadow
    ? "            boxShadow: 'none' // sin sombra"
    : glow
      ? `            boxShadow: \`0 0 14px ${colorPrimary}66\` // brillo en solo`
      : "            boxShadow: '0 8px 16px rgba(0,0,0,0.4)' // sin brillo"

  const actionLines: string[] = []
  actionLines.push('          <div className="actions">')
  if (showSolo) {
    actionLines.push(
      `            <button aria-pressed={isSolo} style={{ background: isSolo ? activeBg : 'transparent' }} onClick={() => setSolo(isSolo ? null : it.id)}>Solo</button>`,
    )
  }
  if (showMute) {
    actionLines.push(
      `            <button aria-pressed={muted.includes(it.id)} onClick={() => setMuted(t => t.includes(it.id) ? t.filter(x => x !== it.id) : [...t, it.id])}>Mute</button>`,
    )
  }
  if (showEye) {
    actionLines.push(
      `            <button aria-pressed={hidden.includes(it.id)} disabled style={{ filter: hidden.includes(it.id) ? 'grayscale(1)' : 'none' }} onClick={() => setHidden(t => t.includes(it.id) ? t.filter(x => x !== it.id) : [...t, it.id])}>{hidden.includes(it.id) ? 'OjoCerrado' : 'Ojo'}</button>`,
    )
  }
  if (showX) {
    const delClick = confirmDelete
      ? `setPendingDeleteId(it.id)`
      : `setOrder(o => o.filter(x => x !== it.id))`
    actionLines.push(
      `            <button className="del" onClick={() => ${delClick}} onMouseEnter={e => { e.currentTarget.style.background = '#e5484d'; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '' }}>X</button>`,
    )
  }
  actionLines.push('          </div>')
  const actions = actionLines.join('\n')

  return [
    `// fondo de los botones activos${flat ? ' — color plano' : ' — degradado'}`,
    `const activeBg = ${activeBg}`,
    '',
    '// .actions .del:hover { background: #e5484d; color: #fff } // cuadrado rojo + X blanca',
    '',
    'const BASE = [',
    "  { id: 'player', name: 'Player', type: 'Jugador' },",
    "  { id: 'camera', name: 'Camera2D', type: 'Cámara' },",
    "  { id: 'control', name: 'Control', type: 'Controlador' },",
    "  { id: 'cilindro', name: 'Cilindro', type: '3D primitivo' },",
    "  { id: 'esfera', name: 'Esfera', type: '3D primitivo' },",
    "  { id: 'cubo', name: 'Cubo', type: '3D primitivo' },",
    ']',
    '',
    `const [order, setOrder] = useState(BASE.slice(0, ${count}).map(i => i.id))`,
    'const [hidden, setHidden] = useState([])',
    'const [muted, setMuted] = useState([])',
    'const [solo, setSolo] = useState(null)',
    'const [collapsed, setCollapsed] = useState(false)',
    confirmDelete ? 'const [pendingDeleteId, setPendingDeleteId] = useState(null)' : '',
    '',
    'const visibleCount = order.filter(id => !hidden.includes(id)).length',
    '',
    '// encabezado con color de marca y colapso opcional',
    `<div style={{ background: ${headBg}, color: '#0b110d' }}>`,
    collapsable
      ? collapseRight
        ? '  // flecha de colapso a la DERECHA'
        : `  <button aria-expanded={!collapsed} onClick={() => setCollapsed(c => !c)}><ChevronDown style={{ transform: collapsed ? 'rotate(-90deg)' : 'none' }} /></button>`
      : '',
    '  <div style={{ flex: 1 }}>',
    "    <h3 style={{ margin: 0 }}>Mundo</h3>",
    showCount ? '    <span style={{ opacity: 0.72 }}>{visibleCount} de {order.length} componentes</span>' : '',
    '  </div>',
    '  <span style={{ opacity: 0.72 }}>escena</span>',
    collapseRight && collapsable ? '  // flecha de colapso a la derecha aquí' : '',
    '</div>',
    '',
    '// lista colapsable: los elementos se juntan al cerrar',
    '<motion.div style={{ overflow: "hidden" }} animate={{ height: collapsed ? 0 : "auto" }}>',
    `<Reorder.Group axis="y" values={order} onReorder={setOrder}>`,
    '  <AnimatePresence>',
    '    {order.map((id, i) => {',
    '      const it = BASE.find(b => b.id === id)',
    '      const isSolo = solo === it.id',
    '      const isHidden = hidden.includes(it.id)',
    '      const dim = (solo && !isSolo) || isHidden',
    '      return (',
    `        <Reorder.Item key={it.id} value={it.id}${drag ? '' : ' dragListener={false}'}`,
    cascade ? '          initial={{ opacity: 0, y: 16 }}' : '',
    '          animate={{ opacity: 1, y: 0 }}',
    '          exit={{ opacity: 0, x: 24 }}',
    '          style={{',
    '            opacity: dim ? 0.45 : 1, // oculto o no-solo se atenúan',
    `            border: isSolo ? \`1px solid ${colorPrimary}\` : '1px solid #353535',`,
    shadow,
    '          }}',
    '        >',
    showIcons ? '          <Icon className="item-icon" />' : '          {/* showIcons OFF: sin iconos */}',
    confirmDelete
      ? '          {pendingDeleteId === it.id ? ('
      : '',
    confirmDelete
      ? '            <span className="confirm">¿Eliminar {it.name}? <button onClick={() => setOrder(o => o.filter(x => x !== it.id)); setPendingDeleteId(null)}>✓</button><button onClick={() => setPendingDeleteId(null)}>✕</button></span>'
      : '',
    confirmDelete ? '          ) : (' : '',
    '            <strong style={{ color: isHidden ? \'#6b6b6b\' : muted.includes(it.id) ? \'#9aa0a3\' : \'#f0f0f0\', textDecoration: muted.includes(it.id) ? \'line-through\' : \'none\' }}>{it.name}</strong>',
    showType ? '            <span className="type">{it.type}</span>' : '            {/* showType OFF: sin descripción */}',
    actions.replace('          <div className="actions">', '            <div className="actions">').replace(
      '          </div>',
      '            </div>',
    ),
    confirmDelete ? '          )}' : '',
    '        </Reorder.Item>',
    '      )',
    '    })}',
    '  </AnimatePresence>',
    '</Reorder.Group>',
    '</motion.div>',
  ].join('\n')
}

export const componentList: AnimationEntry = {
  id: 'component-list',
  title: 'Lista de componentes',
  icon: Layers,
  tags: ['lista', 'escena', 'reordenar', 'componentes'],
  summary:
    'Outliner de escena con nombre de sección y componentes apilados que se reordenan arrastrando; cada fila tiene Solo, Mute, Ojo (ocultar) y Eliminar, con botones configurables como plantilla.',
  Component: ComponentList,
  replayable: true,
  previewScale: 0.8,
  controls: [
    { id: 'flat', label: 'Color plano (sin degradado)', type: 'toggle', initial: false },
    { id: 'noShadow', label: 'Sin sombra', type: 'toggle', initial: false },
    { id: 'count', label: 'Cantidad de componentes', type: 'range', min: 2, max: 10, step: 1, initial: 6 },
    { id: 'drag', label: 'Reordenar arrastrando', type: 'toggle', initial: true },
    { id: 'cascade', label: 'Entrada en cascada', type: 'toggle', initial: true },
    { id: 'glow', label: 'Brillo en el activo', type: 'toggle', initial: true },
    { id: 'showSolo', label: 'Botón Solo', type: 'toggle', initial: true },
    { id: 'showMute', label: 'Botón Mute', type: 'toggle', initial: true },
    { id: 'showEye', label: 'Botón Ojo', type: 'toggle', initial: true },
    { id: 'showX', label: 'Botón X (eliminar)', type: 'toggle', initial: true },
    {
      id: 'confirmDelete',
      label: 'Confirmar antes de eliminar',
      type: 'toggle',
      initial: true,
      show: (s) => !!s.showX,
    },
    { id: 'showCount', label: 'Mostrar cantidad de componentes', type: 'toggle', initial: true },
    { id: 'showIcons', label: 'Mostrar iconos', type: 'toggle', initial: true },
    { id: 'showType', label: 'Mostrar descripción de cada elemento', type: 'toggle', initial: true },
    { id: 'collapsable', label: 'Colapsar y juntar elementos', type: 'toggle', initial: true },
    {
      id: 'collapseRight',
      label: 'Flecha de colapso a la derecha',
      type: 'toggle',
      initial: false,
      show: (s) => !!s.collapsable,
    },
  ],
  colors: [
    { id: 'colorPrimary', label: 'Color principal', type: 'color', initial: '#00a86b' },
    {
      id: 'colorAccent',
      label: 'Color acento',
      type: 'color',
      initial: '#00ffb2',
      show: (s) => !s.flat,
    },
  ],
  code: listCode,
  doc: {
    intro:
      'Un **outliner de escena** estilo motor de juegos: un encabezado con el nombre de la sección (**Mundo**, con color de marca) y debajo los **componentes en una lista** que se **reordenan arrastrando**. Cada fila lleva acciones de **Solo**, **Mute**, **Ojo** (ocultar) y **Eliminar**. Al ser una plantilla, **puedes quitar cualquier botón** que no necesites desde el inspector.',
    sections: [
      {
        title: 'Cómo funciona',
        body: `La lista es un **\`Reorder.Group\`** con **\`Reorder.Item\`**: al arrastrar una fila, framer-motion recalcula el \`layout\` y las demás **se desplazan solas** con un spring.
 
\`\`\`tsx
<Reorder.Group axis="y" values={order} onReorder={setOrder}>
  <AnimatePresence>
    {order.map((item) => (
      <Reorder.Item key={item.id} value={item.id}>
        ...
      </Reorder.Item>
    ))}
  </AnimatePresence>
</Reorder.Group>
\`\`\`

- **Ojo**: al hacer clic la fila **queda marcada como oculta**: se atenúa, el icono se vuelve un **ojo cerrado (\`EyeOff\`)** y el botón queda **deshabilitado en gris**. Un nuevo clic la restaura.
- **Solo**: aísla una fila y **atenúa el resto** (\`opacity: 0.35\`).
- **Mute**: atenúa la fila, tacha el nombre y cambia el icono a \`VolumeX\`.
- **X**: al pasar el cursor se marca con un **cuadrado rojo y la X en blanco**. Según la opción **Confirmar antes de eliminar**: si está activa, cubre el título con un rectángulo *"¿Eliminar …?"* y muestra una **palomita (✓)** para confirmar y una **X** para cancelar; si está apagada, elimina al instante.

Dos toggles de plantilla más:

- **Mostrar cantidad**: oculta o muestra el contador *"N de M componentes"* bajo el título.
- **Colapsar y juntar elementos**: añade una **flecha en el encabezado** que colapsa la lista. Al cerrarla, la altura se anima a 0 y el encabezado se **junta** con el borde inferior. La subopción **Flecha de colapso a la derecha** la mueve de lado.
- **Mostrar iconos**: muestra u oculta los iconos de cada componente.

Como plantilla, los cuatro botones se pueden **activar o quitar** con los toggles \`showSolo\`, \`showMute\`, \`showEye\` y \`showX\` del inspector.`,
      },
      {
        title: 'Cuándo usarla',
        body: `- Pluggins/paneles de **escena u outliner** en editores (jugador, cámara, luces…)
- **Franjas de capas** en editores de imagen o audio (z-order + mute/solo)
- Lista de elementos con **acciones por fila** y reorden por arrastre
 
Buenas prácticas:

- Cada botón lleva \`aria-pressed\` y \`title\`, así el estado se lee y se entiende sin tocarlo.
- El arrastre necesita \`touch-action: none\` en la fila para funcionar en táctil.
- Guardar el orden y los conmutadores al cerrar: este preview solo los mantiene en memoria.`,
      },
    ],
  },
}