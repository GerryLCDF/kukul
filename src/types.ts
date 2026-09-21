import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface DocBlock {
  title: string
  body: string
}

export interface AnimationDoc {
  intro: string
  sections: DocBlock[]
}

export interface ControlDef {
  id: string
  label: string
  type: 'toggle' | 'range' | 'color'
  min?: number
  max?: number
  step?: number
  initial: boolean | number | string
  show?: (settings: ControlSettings) => boolean
}

export type ControlSettings = Record<string, boolean | number | string>

export interface AnimationEntry {
  id: string
  title: string
  icon: LucideIcon
  tags: string[]
  summary: string
  Component: ComponentType<{ settings: ControlSettings }>
  replayable?: boolean
  previewScale?: number
  controls?: ControlDef[]
  colors?: ControlDef[]
  code?: (settings: ControlSettings) => string
  doc: AnimationDoc
}