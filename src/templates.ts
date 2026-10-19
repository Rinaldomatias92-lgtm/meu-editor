import { type Design, type DesignElement, newId } from './types'

type Partial = Omit<DesignElement, 'id' | 'rotation' | 'opacity'> & { rotation?: number; opacity?: number }

const el = (p: Partial): DesignElement => ({ rotation: 0, opacity: 1, ...p, id: newId() })

export interface Template {
  id: string
  name: string
  category: string
  build: () => Design
}

export const SIZES = [
  { name: 'Post Instagram', width: 1080, height: 1080 },
  { name: 'Story', width: 1080, height: 1920 },
  { name: 'Apresentação', width: 1920, height: 1080 },
  { name: 'A4 (retrato)', width: 1240, height: 1754 },
  { name: 'Cartão de visita', width: 1050, height: 600 },
]

export const TEMPLATES: Template[] = [
  {
    id: 'promo',
    name: 'Promoção',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#ffe14d' },
      elements: [
        el({ type: 'ellipse', name: 'Círculo', x: 620, y: -160, width: 640, height: 640, fill: '#ff5a5f' }),
        el({ type: 'rect', name: 'Faixa', x: 0, y: 760, width: 1080, height: 320, fill: '#1d1d1f' }),
        el({ type: 'text', name: 'Título', x: 80, y: 200, width: 900, height: 300, text: 'MEGA\nPROMO', fontSize: 190, fontFamily: 'Bebas Neue', fill: '#1d1d1f', align: 'left', fontStyle: 'normal', lineHeight: 0.9 }),
        el({ type: 'text', name: 'Desconto', x: 80, y: 580, width: 700, height: 120, text: 'até 50% OFF', fontSize: 96, fontFamily: 'Poppins', fill: '#1d1d1f', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Rodapé', x: 80, y: 860, width: 920, height: 80, text: 'Só neste fim de semana • @sualoja', fontSize: 52, fontFamily: 'Inter', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'quote',
    name: 'Citação',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#f4efe6' },
      elements: [
        el({ type: 'rect', name: 'Moldura', x: 60, y: 60, width: 960, height: 960, fill: 'transparent', stroke: '#2b2b2b', strokeWidth: 4, cornerRadius: 0 }),
        el({ type: 'text', name: 'Aspas', x: 90, y: 110, width: 900, height: 260, text: '“', fontSize: 300, fontFamily: 'Playfair Display', fill: '#c9a227', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Citação', x: 140, y: 400, width: 800, height: 300, text: 'A simplicidade é o último grau de sofisticação.', fontSize: 72, fontFamily: 'Playfair Display', fill: '#2b2b2b', align: 'center', fontStyle: 'italic', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Autor', x: 140, y: 820, width: 800, height: 60, text: '— LEONARDO DA VINCI', fontSize: 36, fontFamily: 'Montserrat', fill: '#2b2b2b', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'story-event',
    name: 'Evento',
    category: 'Story',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#14102b' },
      elements: [
        el({ type: 'star', name: 'Estrela', x: 640, y: 120, width: 360, height: 360, fill: '#ffcc00' }),
        el({ type: 'ellipse', name: 'Brilho', x: -300, y: 1200, width: 900, height: 900, fill: '#7b2ff7', opacity: 0.6 }),
        el({ type: 'text', name: 'Chamada', x: 90, y: 560, width: 900, height: 200, text: 'Você está convidado', fontSize: 64, fontFamily: 'Pacifico', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1.1 }),
        el({ type: 'text', name: 'Título', x: 90, y: 700, width: 900, height: 500, text: 'FESTA\nDE LANÇA\nMENTO', fontSize: 200, fontFamily: 'Bebas Neue', fill: '#ffcc00', align: 'left', fontStyle: 'normal', lineHeight: 0.9 }),
        el({ type: 'rect', name: 'Botão', x: 90, y: 1500, width: 600, height: 140, fill: '#ffffff', cornerRadius: 70 }),
        el({ type: 'text', name: 'Data', x: 90, y: 1546, width: 600, height: 60, text: 'SÁB • 20H', fontSize: 52, fontFamily: 'Montserrat', fill: '#14102b', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'slide',
    name: 'Capa de apresentação',
    category: 'Apresentação',
    build: () => ({
      page: { width: 1920, height: 1080, background: '#ffffff' },
      elements: [
        el({ type: 'rect', name: 'Lateral', x: 0, y: 0, width: 760, height: 1080, fill: '#0f62fe' }),
        el({ type: 'triangle', name: 'Detalhe', x: 560, y: 760, width: 400, height: 320, fill: '#78a9ff' }),
        el({ type: 'text', name: 'Título', x: 880, y: 360, width: 960, height: 260, text: 'Relatório\nTrimestral', fontSize: 120, fontFamily: 'Montserrat', fill: '#161616', align: 'left', fontStyle: 'bold', lineHeight: 1.05 }),
        el({ type: 'text', name: 'Subtítulo', x: 880, y: 660, width: 960, height: 60, text: 'Resultados e próximos passos • 2026', fontSize: 44, fontFamily: 'Inter', fill: '#525252', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'card',
    name: 'Cartão minimalista',
    category: 'Cartão de visita',
    build: () => ({
      page: { width: 1050, height: 600, background: '#111111' },
      elements: [
        el({ type: 'rect', name: 'Linha', x: 80, y: 290, width: 120, height: 6, fill: '#e2b04a' }),
        el({ type: 'text', name: 'Nome', x: 80, y: 160, width: 800, height: 100, text: 'Seu Nome', fontSize: 84, fontFamily: 'Playfair Display', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Cargo', x: 80, y: 330, width: 800, height: 50, text: 'DESIGNER', fontSize: 34, fontFamily: 'Montserrat', fill: '#e2b04a', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Contato', x: 80, y: 460, width: 900, height: 50, text: 'voce@email.com  •  (11) 90000-0000', fontSize: 30, fontFamily: 'Inter', fill: '#bbbbbb', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
]

export const blankDesign = (width: number, height: number): Design => ({
  page: { width, height, background: '#ffffff' },
  elements: [],
})
