import type { ComponentType } from 'react'
import type { AnimationEntry, ControlSettings } from './types'
import { animations } from './animations/registry'

import FadeInGrowBase from './animations/fade-in-grow'
import StaggerListBase from './animations/stagger-list'
import MagneticButtonBase from './animations/magnetic-button'
import CounterBase from './animations/counter'
import ModalBase from './animations/modal'
import ToggleSwitchBase from './animations/toggle-switch'
import RadialMenuBase, { type RadialMenuProps } from './animations/radial-menu'
import KnobBase, { type KnobProps } from './animations/knob'
import SliderVerticalBase from './animations/slider-vertical'
import ComponentListBase, { type ComponentListProps } from './animations/component-list'

function defaultsOf(entry: AnimationEntry): ControlSettings {
  const settings: ControlSettings = {}
  for (const def of [...(entry.controls ?? []), ...(entry.colors ?? [])]) {
    settings[def.id] = def.initial
  }
  return settings
}

export type AnimationProps<P = {}> = { settings?: Partial<ControlSettings> } & P

function withSettings<P>(
  Component: ComponentType<P & { settings: ControlSettings }>,
  defaults: ControlSettings,
): ComponentType<AnimationProps<P>> {
  return function KukulComponent(props: AnimationProps<P>) {
    const { settings, ...rest } = props
    const merged: ControlSettings = Object.assign({}, defaults, settings)
    return <Component {...(rest as P)} settings={merged} />
  }
}

export const FadeInGrow = withSettings(FadeInGrowBase, defaultsOf(animations.find(a => a.id === 'fade-in-grow')!))
export const StaggerList = withSettings(StaggerListBase, defaultsOf(animations.find(a => a.id === 'stagger-list')!))
export const MagneticButton = withSettings(MagneticButtonBase, defaultsOf(animations.find(a => a.id === 'magnetic-button')!))
export const Counter = withSettings(CounterBase, defaultsOf(animations.find(a => a.id === 'counter')!))
export const Modal = withSettings(ModalBase, defaultsOf(animations.find(a => a.id === 'modal')!))
export const ToggleSwitch = withSettings(ToggleSwitchBase, defaultsOf(animations.find(a => a.id === 'toggle-switch')!))
export const RadialMenu = withSettings<Omit<RadialMenuProps, 'settings'>>(RadialMenuBase, defaultsOf(animations.find(a => a.id === 'radial-menu')!))
export const Knob = withSettings<Omit<KnobProps, 'settings'>>(KnobBase, defaultsOf(animations.find(a => a.id === 'knob')!))
export const SliderVertical = withSettings<{}>(SliderVerticalBase, defaultsOf(animations.find(a => a.id === 'slider-vertical')!))
export const ComponentList = withSettings<Omit<ComponentListProps, 'settings'>>(ComponentListBase, defaultsOf(animations.find(a => a.id === 'component-list')!))

export const allAnimations = animations
export const getAnimation = (id: string): AnimationEntry | undefined =>
  animations.find(a => a.id === id)
export const animationDefaults = (id: string): ControlSettings => {
  const entry = animations.find(a => a.id === id)
  return entry ? defaultsOf(entry) : {}
}

export type { AnimationEntry, ControlSettings, ControlDef, DocBlock, AnimationDoc } from './types'
export type { KnobProps } from './animations/knob'
export type { RadialMenuItem, RadialMenuProps } from './animations/radial-menu'
export type { ComponentListItem, ComponentListProps } from './animations/component-list'