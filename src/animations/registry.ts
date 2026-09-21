import type { AnimationEntry } from '../types'
import { fadeInGrow } from './fade-in-grow'
import { staggerList } from './stagger-list'
import { magneticButton } from './magnetic-button'
import { counter } from './counter'
import { modal } from './modal'
import { toggleSwitch } from './toggle-switch'
import { radialMenu } from './radial-menu'
import { knob } from './knob'
import { sliderVertical } from './slider-vertical'
import { componentList } from './component-list'

export const animations: AnimationEntry[] = [
  fadeInGrow,
  staggerList,
  magneticButton,
  counter,
  modal,
  toggleSwitch,
  radialMenu,
  knob,
  sliderVertical,
  componentList,
]

export type { AnimationEntry } from '../types'