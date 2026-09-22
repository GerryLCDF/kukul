import { useState } from 'react'
import { ArrowLeft, BookOpen, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { allAnimations } from '../lib'
import type { AnimationEntry } from '../types'
import { renderMarkdown } from '../utils/markdown'
import CodeBlock from './CodeBlock'

const INSTALL = 'npm install kukul framer-motion lucide-react react react-dom'

const sections: { title: string; body: string }[] = [
  {
    title: 'Instalación',
    body: `Kukul se publica como paquete **npm**. Dentro de tu proyecto de React ejecuta:

\`\`\`bash
npm install kukul framer-motion lucide-react react react-dom
\`\`\`

**Kukul** es la librería; los otros paquetes son sus *dependencias* (React, framer-motion y
lucide-react) y el consumidor es quien las instala, no el paquete. Eso evita duplicados y
mantiene el bundle pequeño.

> Necesitas **React 18+**. La librería exporta componentes, no estilos globales:
> cada componente viene con su propio CSS inline vía framer-motion.`,
  },
  {
    title: 'Uso',
    body: `Importa el componente que quieras y úsalo como un componente normal de React:

\`\`\`tsx
import { Counter, ComponentList, animationDefaults } from 'kukul'

export default function App() {
  return (
    <>
      <Counter settings={{ target: 5000 }} />
      <ComponentList />
    </>
  )
}
\`\`\`

Todas las animaciones reciben **\`settings\` opcional**: si no lo pasas usan los valores
por defecto, y puedes sobrescribir solo lo que te interese:

\`\`\`tsx
import { Knob } from 'kukul'

// solo cambia el color, el resto usa el default
<Knob settings={{ flat: true }} />
\`\`\`

Componentes disponibles:

- ${allAnimations.map(a => '`' + a.id + '`').join('\n- ')}

Utilidades:

- **\`allAnimations\`** — el registro completo (título, icono, controls, documentación).
- **\`getAnimation(id)\`** — busca una animación por su id.
- **\`animationDefaults(id)\`** — objeto de valores por defecto de una animación.

Tipos exportados: \`AnimationEntry\`, \`ControlSettings\`, \`ControlDef\`.`,
  },
  {
    title: 'Actualización',
    body: `Cuando publique versiones nuevas (arreglos, mejoras o animaciones nuevas), tu equipo
actualiza con un comando:

\`\`\`bash
npm update kukul
# o para una versión exacta
npm install kukul@^1.0.0
\`\`\`

La librería usa **semver**:

- **patch (\`1.0.x\`)** — correcciones que no rompen nada.
- **minor (\`1.x.0\`)** — animaciones nuevas o mejoras, retrocompatible.
- **major (\`2.0.0\`)** — cambios que rompen la API.

Mientras la API (\`settings\` y los nombres de export) no cambie, actualizar tu
\`package.json\` no debería requerir tocar el código.`,
  },
  {
    title: 'Contribuir',
    body: `El proyecto es **open source** en
\`https://github.com/GerryLCDF/kukul\`.

- Cada animación vive en \`src/animations/<id>/index.tsx\`.
- Para añadir una nueva: crea la carpeta, exporta el componente y un objeto
  \`AnimationEntry\`, y añádelo al registro.
- Convenciones: iconos de **lucide-react**, entrada en cascada con framer-motion,
  pantalla con fondo **#131313** y texto **#f0f0f0**.

Para publicar una versión nueva desde el repo:

\`\`\`bash
npm run build:lib   # genera dist/ (ESM + CJS + tipos)
npm version patch   # o minor / major
npm publish
\`\`\``,
  },
]

const pascal = (id: string) =>
  id.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')

function useCase(entry: AnimationEntry) {
  const name = pascal(entry.id)
  return [
    `import { ${name} } from 'kukul'`,
    '',
    'export default function App() {',
    '  return (',
    `    // ${entry.summary}`,
    `    <${name} settings={{ colorPrimary: '#00a86b' }} />`,
    '  )',
    '}',
  ].join('\n')
}

function ComponentCard({ entry }: { entry: AnimationEntry }) {
  const [open, setOpen] = useState(false)
  const name = pascal(entry.id)

  return (
    <div className="component-card" id={`comp-${entry.id}`}>
      <div className="component-card-head">
        <button className="component-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? <X size={14} /> : <Menu size={14} />}
        </button>
        <span className="card-icon">
          <entry.icon size={16} />
        </span>
        <div className="component-card-title">
          <strong>{name}</strong>
          <small>
            <code>{entry.id}</code> · {entry.title}
          </small>
        </div>
        <span className="component-tag">{entry.tags[0]}</span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            className="component-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="component-meta">
              <p>{entry.summary}</p>
              <div className="tags">
                {entry.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <h4>Caso de uso</h4>
            <CodeBlock code={useCase(entry)} />
            <a className="component-open" href={`#/${entry.id}`}>
              Abrir en el playground →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DocsPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navSections = [
    { id: 'Instalación', label: 'Instalación' },
    { id: 'Uso', label: 'Uso' },
    { id: 'Componentes', label: 'Componentes' },
    { id: 'Actualización', label: 'Actualización' },
    { id: 'Contribuir', label: 'Contribuir' },
  ]

  return (
    <div className="page">
      <div className="docs-layout">
        <aside className="docs-nav">
          <div className="docs-nav-title">Índice</div>
          <nav>
            {navSections.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}>
                {s.label}
              </button>
            ))}
            <div className="docs-nav-sub">Componentes</div>
            {allAnimations.map((a) => (
              <button
                key={a.id}
                className="docs-nav-comp"
                onClick={() => scrollTo(`comp-${a.id}`)}
              >
                {pascal(a.id)}
              </button>
            ))}
          </nav>
        </aside>

        <div className="docs-content">
          <a className="back" href="#/">
            <ArrowLeft size={15} /> Todas las animaciones
          </a>

          <div className="page-head">
            <span className="card-icon">
              <BookOpen size={24} />
            </span>
            <div style={{ flex: 1 }}>
              <h1>Documentación</h1>
              <p className="summary">
                Instala, usa y actualiza Kukul en tu proyecto de React.
              </p>
            </div>
            <CodeBlock code={INSTALL} />
          </div>

          <section id="Instalación" className="doc-section anchor">
            <h2>Instalación</h2>
            {renderMarkdown(sections[0].body)}
          </section>

          <section id="Uso" className="doc-section anchor">
            <h2>Uso</h2>
            {renderMarkdown(sections[1].body)}
          </section>

          <section id="Componentes" className="doc-section anchor">
            <h2>Componentes</h2>
            <p className="muted">
              Toca el menú hamburguesa de cada componente para ver un ejemplo de uso.
            </p>
            {allAnimations.map((a) => (
              <ComponentCard key={a.id} entry={a} />
            ))}
          </section>

          <section id="Actualización" className="doc-section anchor">
            <h2>Actualización</h2>
            {renderMarkdown(sections[2].body)}
          </section>

          <section id="Contribuir" className="doc-section anchor">
            <h2>Contribuir</h2>
            {renderMarkdown(sections[3].body)}
          </section>
        </div>
      </div>
    </div>
  )
}