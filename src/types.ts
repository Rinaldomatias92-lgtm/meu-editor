export type ElementType = 'rect' | 'ellipse' | 'triangle' | 'star' | 'text' | 'image'

export interface DesignElement {
  id: string
  type: ElementType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked?: boolean
  hidden?: boolean
  // formas
  fill?: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
  // texto
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string // 'normal' | 'bold' | 'italic' | 'bold italic'
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  // imagem
  src?: string
  // ligação com a Ficha do imóvel: texto com {campos} e foto da ficha
  textTemplate?: string
  bind?: 'foto1' | 'foto2' | 'foto3'
}

export interface Page {
  width: number
  height: number
  background: string
}

export interface Design {
  page: Page
  elements: DesignElement[]
}

export const FONTS = ['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Bebas Neue', 'Pacifico', 'Arial', 'Georgia']

let counter = 0
export const newId = () => `el_${Date.now().toString(36)}_${(counter++).toString(36)}`
