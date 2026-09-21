import { ArrowLeft, BookOpen } from 'lucide-react'
import { allAnimations } from '../lib'
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

export default function DocsPage() {
  return (
    <div className="page">
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

      <div className="doc-section">
        <h2>Instalación</h2>
        {renderMarkdown(sections[0].body)}
      </div>

      {sections.slice(1).map((s) => (
        <div key={s.title} className="doc-section">
          <h2>{s.title}</h2>
          {renderMarkdown(s.body)}
        </div>
      ))}
    </div>
  )
}