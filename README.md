# Kukul · UI motion lab

Colección de animaciones de UI hechas con **React + Framer Motion + CSS**, cada una
aislada en su propia página con su URL, inspector de opciones y documentación simple.

- **Documentación por animación** (qué hace, cómo funciona, cuándo usarla)
- **Botón de copiar** en todos los bloques de código
- **Inspector de opciones** al lado del preview: ajusta la animación en vivo y el
  código generado se actualiza automáticamente
- **Sin emojis**: los iconos vienen de la librería **lucide-react**

## Paleta de marca

| Rol        | Color   |
| ---------- | ------- |
| Fondo      | #131313 |
| Secundario | #777777 |
| Texto      | #F0F0F0 |
| Principal  | #00A86B |
| Acento     | #00FFB2 |
| Gradiente- luz | #B4F8C8 |

## Uso

```bash
npm install        # primera vez
npm run dev        # desarrollas con recarga en vivo (http://localhost:5173)
npm run build      # genera dist/ (HTML estático)
npm run preview    # sirve el build para revisarlo
```

Para **ver el HTML estático**: abre `dist/index.html` directamente en el navegador
(double click). Para **compartir** un enlace por internet necesitas servirlo
(`npm run preview`, o súbelo a Vercel/Netlify/GitHub Pages).

## Usar como librería npm

El proyecto también compila como **paquete npm** (build con Vite *lib mode*), para
que tu equipo la instale de una vez y use los componentes directamente:

```bash
npm install kukul framer-motion lucide-react react react-dom
```

```tsx
import { Counter, ComponentList, animationDefaults } from 'kukul'

export default function App() {
  return (
    <>
      <Counter settings={{ target: 5000 }} />
      <ComponentList />
    </>
  )
}
```

- Todos los componentes reciben `settings` **opcional**: si no pasas nada usan los
  valores por defecto de su registro. Puedes cambiar solo lo que te interese
  (`settings={{ flat: true }}`).
- Componentes exportados: `FadeInGrow`, `StaggerList`, `MagneticButton`, `Counter`,
  `Modal`, `ToggleSwitch`, `RadialMenu`, `Knob`, `SliderVertical`, `ComponentList`.
- Utilidades: `allAnimations` (el registro completo), `getAnimation(id)` y
  `animationDefaults(id)` (los valores por defecto de una animación).
- Tipos: `AnimationEntry`, `ControlSettings`, `ControlDef`… todos exportados.

Recompilación de la librería:

```bash
npm run build:lib    # genera dist/ (ESM + CJS + .d.ts)
npm publish          # publica (ejecuta build:lib automáticamente vía prepublishOnly)
```

> Las dependencias (`react`, `framer-motion`, `lucide-react`) quedan **fuera** del
> bundle: son `peerDependencies`, las instala el consumidor.

## Estructura

```
animaciones/
├── src/
│   ├── animations/            ← CADA animación vive aquí, en su carpeta
│   │   ├── fade-in-grow/
│   │   ├── stagger-list/
│   │   ├── magnetic-button/
│   │   ├── counter/
│   │   ├── modal/
│   │   ├── toggle-switch/
│   │   ├── radial-menu/
│   │   └── registry.ts        ← lista de todas las animaciones (índice)
│   ├── components/            ← layout, página de detalle, inspector, índice
│   ├── utils/markdown.tsx     ← renderiza **negrita** / `código` / ```bloques```
│   ├── types.ts               ← la "receta" que define una animación
│   └── App.tsx                ← router por hash (cada animación = #/id)
```

## Cómo añadir una animación nueva

> **Iconos**: usa siempre la librería [lucide-react](https://lucide.dev/icons/) — ya está
> instalada. `import { Camera } from 'lucide-react'` → `<Camera size={22} color="#fff" strokeWidth={2.2} />`.
> Nada de emojis: el campo del registro es `icon` (un componente Lucide).

1. Crea una carpeta en `src/animations/<tu-animacion>/index.tsx`.
2. Exporta el componente de preview (lo que se ve en el escenario). Recibe `{ settings }`.
3. Exporta un objeto `AnimationEntry` junto a él:

```ts
import { Sparkles } from 'lucide-react'
import type { AnimationEntry, ControlSettings } from '../../types'

export default function MiAnimacion({ settings }: { settings: ControlSettings }) {
  const duracion = Number(settings.duration) || 1
  // ...tu JSX con framer-motion
}

export const miAnimacion: AnimationEntry = {
  id: 'mi-animacion',          // será #/mi-animacion en la URL
  title: 'Título',
  icon: Sparkles,              // icono Lucide (se muestra en índice y página)
  tags: ['hover', 'spring'],
  summary: 'Una frase corta para la tarjeta del índice.',
  Component: MiAnimacion,
  controls: [                  // panel de ajustes junto al preview
    { id: 'solid', label: 'Color sólido', type: 'toggle', initial: false },
    { id: 'count', label: 'Cantidad', type: 'range', min: 1, max: 6, initial: 6 },
    { id: 'color', label: 'Color', type: 'color', initial: '#00a86b' },
  ],
  code: (s) => `// snippet que se regenera con las opciones`, // OPCIONAL
  doc: { ... },
}
```

Los `controls` se aplican en vivo al preview y `code(settings)` regenera el snippet.
Los tipos de control disponibles: `'toggle' | 'range' | 'color'`.

4. Impórtala y añádela al array de `src/animations/registry.ts`.
5. Ejecuta `npm run build` para que aparezca en la página de inicio.

## Convenciones de documentación

En los textos de la documentación puedes usar:

- `**negrita**` para destacar
- `` `codigo` `` para nombres de props, funciones o valores inline
- ``` ```tsx ``` para bloques de código largos
- `- item` para listas con viñetas

> Las URLs del router son por **hash** (`#/modal`, `#/toggle-switch`…), por eso
> funcionan incluso abriendo `index.html` desde el disco sin servidor.