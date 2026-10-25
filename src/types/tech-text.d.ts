declare module '@/components/TechText.jsx' {
  import type { CSSProperties, ComponentType } from 'react'

  type TechTextProps = {
    text?: string
    fontFamily?: string
    fontWeight?: number
    fontSize?: number
    letterSpacing?: number
    color?: string
    accentColor?: string
    gradient?: boolean
    align?: 'left' | 'center' | 'right'
    reach?: number
    softness?: number
    dashLength?: number
    dashGap?: number
    strokeWidth?: number
    lineStyle?: 'dashed' | 'solid'
    reveal?: 'letter' | 'area' | 'none'
    specks?: number
    selection?: boolean
    labels?: boolean
    draggable?: boolean
    bounce?: number
    sweep?: boolean
    speed?: number
    clickKick?: boolean
    intro?: 'none' | 'type' | 'assemble' | 'metrics'
    introDuration?: number
    guides?: boolean
    className?: string
    style?: CSSProperties
  }

  const TechText: ComponentType<TechTextProps>
  export default TechText
}
