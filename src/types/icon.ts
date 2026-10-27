export type IconSourceType = 'builtin' | 'svg' | 'image'
export type IconPosition = 'top-left' | 'top-center' | 'inline-left'
export type IconBoxShape = 'square' | 'rounded' | 'circle'

export interface CustomIconConfig {
  type: IconSourceType
  builtinName?: string
  svgMarkup?: string
  imageUrl?: string
  tint?: boolean
  size?: number
  boxSize?: number
  showBox?: boolean
  boxShape?: IconBoxShape
  position?: IconPosition
}
