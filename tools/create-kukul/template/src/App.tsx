import { useState } from 'react'
import {
  Counter,
  ComponentList,
  Knob,
  MagneticButton,
  Modal,
  RadialMenu,
  SliderVertical,
  StaggerList,
  ToggleSwitch,
} from '@gerardolcdf/kukul'
import './App.css'

const items = [
  { id: 'counter', title: 'Contador', comp: Counter },
  { id: 'component-list', title: 'Lista de componentes', comp: ComponentList },
  { id: 'knob', title: 'Perilla', comp: Knob },
  { id: 'magnetic-button', title: 'Botón magnético', comp: MagneticButton },
  { id: 'modal', title: 'Modal', comp: Modal },
  { id: 'radial-menu', title: 'Menú radial', comp: RadialMenu },
  { id: 'slider-vertical', title: 'Slider vertical', comp: SliderVertical },
  { id: 'stagger-list', title: 'Stagger list', comp: StaggerList },
  { id: 'toggle-switch', title: 'Toggle', comp: ToggleSwitch },
]

function Card({ item }: { item: (typeof items)[number] }) {
  const C = item.comp
  return (
    <section className="card">
      <h2>{item.title}</h2>
      <div className="stage">
        <C />
      </div>
    </section>
  )
}

export default function App() {
  const [show, setShow] = useState(false)
  return (
    <main>
      <header className="hero">
        <h1>Kukul demo</h1>
        <p>Tus animaciones, listas para usar. Live desde <code>@gerardolcdf/kukul</code>.</p>
        <button onClick={() => setShow((s) => !s)}>
          {show ? 'Ocultar modal' : 'Abrir modal'}
        </button>
      </header>

      <div className="grid">
        {items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>

      {show && (
        <Modal
          settings={{
            colorPrimary: '#00a86b',
            colorAccent: '#00ffb2',
            flat: false,
            noShadow: false,
          }}
        />
      )}
    </main>
  )
}
