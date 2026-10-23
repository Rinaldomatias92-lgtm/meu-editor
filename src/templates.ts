import { type Design, type DesignElement, newId } from './types'
import { DEFAULT_FICHA, fillText, type Ficha } from './ficha'

type Partial = Omit<DesignElement, 'id' | 'rotation' | 'opacity'> & { rotation?: number; opacity?: number }

const el = (p: Partial): DesignElement => ({ rotation: 0, opacity: 1, ...p, id: newId() })

// Imagem provisória que marca o lugar de uma foto; o usuário troca com dois cliques
export function photoPlaceholder(w: number, h: number, tone = '#c9d6e3') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w)}" height="${Math.round(h)}">
<rect width="100%" height="100%" fill="${tone}"/>
<svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMin meet">
<g fill="none" stroke="#5b6b7d" stroke-width="6" stroke-linejoin="round">
<path d="M150 150 L200 108 L250 150 V198 H150 Z"/><rect x="186" y="164" width="28" height="34"/></g>
<text x="200" y="236" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#3e4c5c">Dois cliques para trocar a foto</text>
</svg></svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const photo = (
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  extra: { cornerRadius?: number; opacity?: number; bind?: DesignElement['bind'] } = {},
) =>
  el({ type: 'image', name, x, y, width, height, src: photoPlaceholder(width, height), ...extra })

// Texto ligado à Ficha do imóvel; o exemplo `f` só define o que aparece na miniatura
const bound = (textTemplate: string, f: Ficha = DEFAULT_FICHA) => ({ textTemplate, text: fillText(textTemplate, f) })

const ALUGUEL: Ficha = { ...DEFAULT_FICHA, finalidade: 'aluguel', titulo: 'Casa com quintal e piscina', quartos: '4', banheiros: '3', vagas: '3', area: '220', preco: '6500' }
const COBERTURA: Ficha = { ...DEFAULT_FICHA, titulo: 'Cobertura Duplex', quartos: '4', banheiros: '5', vagas: '3', area: '320', preco: '2400000' }

export interface Template {
  id: string
  name: string
  category: string
  build: () => Design
}

export const SIZES = [
  { name: 'Post Instagram', width: 1080, height: 1080 },
  { name: 'Post retrato (4:5)', width: 1080, height: 1350 },
  { name: 'Story / Reels / TikTok', width: 1080, height: 1920 },
  { name: 'Miniatura YouTube', width: 1280, height: 720 },
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
  {
    id: 'black-friday',
    name: 'Black Friday',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#0b0b0b' },
      elements: [
        el({ type: 'rect', name: 'Etiqueta', x: 80, y: 90, width: 360, height: 90, fill: '#ffd400', cornerRadius: 12 }),
        el({ type: 'text', name: 'Etiqueta texto', x: 80, y: 112, width: 360, height: 50, text: 'SÓ HOJE', fontSize: 50, fontFamily: 'Montserrat', fill: '#0b0b0b', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 80, y: 250, width: 920, height: 400, text: 'BLACK\nFRIDAY', fontSize: 230, fontFamily: 'Bebas Neue', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 0.88 }),
        el({ type: 'text', name: 'Desconto', x: 80, y: 690, width: 920, height: 160, text: '70% OFF', fontSize: 170, fontFamily: 'Bebas Neue', fill: '#ffd400', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Rodapé', x: 80, y: 920, width: 920, height: 60, text: 'Em todo o site • Frete grátis acima de R$ 199', fontSize: 38, fontFamily: 'Inter', fill: '#9a9a9a', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'aniversario',
    name: 'Aniversário',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#ffd6e7' },
      elements: [
        el({ type: 'ellipse', name: 'Balão 1', x: 720, y: 70, width: 220, height: 280, fill: '#ff4f8b' }),
        el({ type: 'ellipse', name: 'Balão 2', x: 860, y: 190, width: 170, height: 220, fill: '#ffb000' }),
        el({ type: 'star', name: 'Estrela', x: 110, y: 120, width: 120, height: 120, fill: '#ffb000' }),
        el({ type: 'text', name: 'Título', x: 100, y: 420, width: 900, height: 320, text: 'Feliz\nAniversário!', fontSize: 140, fontFamily: 'Pacifico', fill: '#7a1040', align: 'left', fontStyle: 'normal', lineHeight: 1.1 }),
        el({ type: 'text', name: 'Nome', x: 100, y: 820, width: 900, height: 80, text: 'Ana • 30 anos', fontSize: 64, fontFamily: 'Montserrat', fill: '#7a1040', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'vaga',
    name: 'Vaga de emprego',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#eef3ff' },
      elements: [
        el({ type: 'rect', name: 'Topo', x: 0, y: 0, width: 1080, height: 330, fill: '#1f4fd8' }),
        el({ type: 'text', name: 'Chamada', x: 80, y: 90, width: 920, height: 60, text: 'ESTAMOS CONTRATANDO', fontSize: 48, fontFamily: 'Montserrat', fill: '#bcd0ff', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Cargo', x: 80, y: 170, width: 920, height: 120, text: 'Designer Gráfico', fontSize: 100, fontFamily: 'Poppins', fill: '#ffffff', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Requisitos', x: 80, y: 420, width: 920, height: 360, text: '• Experiência com redes sociais\n• Domínio de tipografia e cor\n• Trabalho híbrido\n• Vale-refeição e plano de saúde', fontSize: 50, fontFamily: 'Inter', fill: '#1b2440', align: 'left', fontStyle: 'normal', lineHeight: 1.6 }),
        el({ type: 'rect', name: 'Botão', x: 80, y: 870, width: 640, height: 110, fill: '#1f4fd8', cornerRadius: 55 }),
        el({ type: 'text', name: 'Contato', x: 80, y: 905, width: 640, height: 50, text: 'vagas@suaempresa.com', fontSize: 42, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'motivacional',
    name: 'Frase motivacional',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#1e3a34' },
      elements: [
        el({ type: 'ellipse', name: 'Sol', x: 340, y: 120, width: 400, height: 400, fill: '#f2a65a' }),
        el({ type: 'rect', name: 'Horizonte', x: 0, y: 420, width: 1080, height: 660, fill: '#1e3a34' }),
        el({ type: 'text', name: 'Frase', x: 100, y: 560, width: 880, height: 260, text: 'Um passo de cada vez\nainda é um passo.', fontSize: 76, fontFamily: 'Playfair Display', fill: '#f6efe2', align: 'center', fontStyle: 'italic', lineHeight: 1.25 }),
        el({ type: 'text', name: 'Assinatura', x: 100, y: 900, width: 880, height: 50, text: '@seuperfil', fontSize: 36, fontFamily: 'Montserrat', fill: '#f2a65a', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'comunicado',
    name: 'Comunicado',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#ffffff' },
      elements: [
        el({ type: 'rect', name: 'Moldura', x: 50, y: 50, width: 980, height: 980, fill: 'transparent', stroke: '#e5484d', strokeWidth: 14, cornerRadius: 24 }),
        el({ type: 'triangle', name: 'Ícone', x: 450, y: 150, width: 180, height: 160, fill: '#e5484d' }),
        el({ type: 'text', name: 'Exclamação', x: 450, y: 195, width: 180, height: 110, text: '!', fontSize: 110, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 100, y: 380, width: 880, height: 120, text: 'COMUNICADO', fontSize: 110, fontFamily: 'Bebas Neue', fill: '#1d1d1f', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Mensagem', x: 140, y: 540, width: 800, height: 260, text: 'Na próxima segunda-feira\nnão haverá expediente.\nRetornamos na terça às 9h.', fontSize: 50, fontFamily: 'Inter', fill: '#3a3a3c', align: 'center', fontStyle: 'normal', lineHeight: 1.4 }),
        el({ type: 'text', name: 'Assinatura', x: 100, y: 900, width: 880, height: 50, text: 'A Direção', fontSize: 40, fontFamily: 'Montserrat', fill: '#e5484d', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'depoimento',
    name: 'Depoimento de cliente',
    category: 'Post Instagram',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#fff7ec' },
      elements: [
        el({ type: 'rect', name: 'Cartão', x: 90, y: 160, width: 900, height: 760, fill: '#ffffff', cornerRadius: 40, stroke: '#f0dcc0', strokeWidth: 4 }),
        el({ type: 'star', name: 'Estrela 1', x: 300, y: 230, width: 80, height: 80, fill: '#ffb400' }),
        el({ type: 'star', name: 'Estrela 2', x: 400, y: 230, width: 80, height: 80, fill: '#ffb400' }),
        el({ type: 'star', name: 'Estrela 3', x: 500, y: 230, width: 80, height: 80, fill: '#ffb400' }),
        el({ type: 'star', name: 'Estrela 4', x: 600, y: 230, width: 80, height: 80, fill: '#ffb400' }),
        el({ type: 'star', name: 'Estrela 5', x: 700, y: 230, width: 80, height: 80, fill: '#ffb400' }),
        el({ type: 'text', name: 'Depoimento', x: 160, y: 380, width: 760, height: 320, text: '“Atendimento impecável\ne entrega antes do prazo.\nRecomendo demais!”', fontSize: 58, fontFamily: 'Playfair Display', fill: '#3b2a1a', align: 'center', fontStyle: 'italic', lineHeight: 1.3 }),
        el({ type: 'text', name: 'Cliente', x: 160, y: 780, width: 760, height: 50, text: 'MARIANA S. • SÃO PAULO', fontSize: 34, fontFamily: 'Montserrat', fill: '#b07a3c', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'lancamento',
    name: 'Lançamento de produto',
    category: 'Story',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#f3f0ff' },
      elements: [
        el({ type: 'ellipse', name: 'Fundo do produto', x: 140, y: 380, width: 800, height: 800, fill: '#8b3dff' }),
        el({ type: 'rect', name: 'Produto', x: 390, y: 520, width: 300, height: 520, fill: '#ffffff', cornerRadius: 40 }),
        el({ type: 'text', name: 'Chamada', x: 90, y: 150, width: 900, height: 70, text: 'NOVIDADE', fontSize: 60, fontFamily: 'Montserrat', fill: '#8b3dff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Produto nome', x: 90, y: 1270, width: 900, height: 260, text: 'Garrafa\nTérmica Pro', fontSize: 120, fontFamily: 'Poppins', fill: '#1a1033', align: 'center', fontStyle: 'bold', lineHeight: 1.05 }),
        el({ type: 'text', name: 'Preço', x: 90, y: 1580, width: 900, height: 90, text: 'R$ 89,90', fontSize: 80, fontFamily: 'Montserrat', fill: '#8b3dff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Arraste', x: 90, y: 1750, width: 900, height: 50, text: 'Arraste para cima ↑', fontSize: 40, fontFamily: 'Inter', fill: '#5b4b80', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'casamento',
    name: 'Convite de casamento',
    category: 'Story',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#faf6f0' },
      elements: [
        el({ type: 'rect', name: 'Moldura', x: 60, y: 60, width: 960, height: 1800, fill: 'transparent', stroke: '#b89b6a', strokeWidth: 4 }),
        el({ type: 'rect', name: 'Moldura interna', x: 90, y: 90, width: 900, height: 1740, fill: 'transparent', stroke: '#b89b6a', strokeWidth: 2 }),
        el({ type: 'text', name: 'Chamada', x: 120, y: 360, width: 840, height: 60, text: 'COM A BÊNÇÃO DE NOSSAS FAMÍLIAS', fontSize: 34, fontFamily: 'Montserrat', fill: '#8a7350', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Noivos', x: 120, y: 560, width: 840, height: 500, text: 'Júlia\n&\nRafael', fontSize: 150, fontFamily: 'Pacifico', fill: '#4a3b28', align: 'center', fontStyle: 'normal', lineHeight: 1.15 }),
        el({ type: 'rect', name: 'Divisor', x: 440, y: 1160, width: 200, height: 3, fill: '#b89b6a' }),
        el({ type: 'text', name: 'Data', x: 120, y: 1230, width: 840, height: 80, text: '14 de março de 2027', fontSize: 64, fontFamily: 'Playfair Display', fill: '#4a3b28', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Local', x: 120, y: 1360, width: 840, height: 140, text: 'às 17h • Espaço Jardim das Flores\nCampinas, SP', fontSize: 40, fontFamily: 'Montserrat', fill: '#8a7350', align: 'center', fontStyle: 'normal', lineHeight: 1.5 }),
      ],
    }),
  },
  {
    id: 'cardapio',
    name: 'Cardápio',
    category: 'A4 (retrato)',
    build: () => ({
      page: { width: 1240, height: 1754, background: '#1c1a17' },
      elements: [
        el({ type: 'text', name: 'Restaurante', x: 100, y: 120, width: 1040, height: 130, text: 'Cantina da Nonna', fontSize: 110, fontFamily: 'Playfair Display', fill: '#f3e6cf', align: 'center', fontStyle: 'italic', lineHeight: 1 }),
        el({ type: 'rect', name: 'Divisor', x: 520, y: 290, width: 200, height: 4, fill: '#c8a25a' }),
        el({ type: 'text', name: 'Seção 1', x: 140, y: 380, width: 960, height: 60, text: 'MASSAS', fontSize: 50, fontFamily: 'Montserrat', fill: '#c8a25a', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Pratos 1', x: 140, y: 470, width: 700, height: 300, text: 'Espaguete à bolonhesa\nLasanha da casa\nNhoque ao sugo', fontSize: 46, fontFamily: 'Inter', fill: '#f3e6cf', align: 'left', fontStyle: 'normal', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Preços 1', x: 840, y: 470, width: 260, height: 300, text: 'R$ 42\nR$ 48\nR$ 39', fontSize: 46, fontFamily: 'Inter', fill: '#c8a25a', align: 'right', fontStyle: 'bold', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Seção 2', x: 140, y: 820, width: 960, height: 60, text: 'PIZZAS', fontSize: 50, fontFamily: 'Montserrat', fill: '#c8a25a', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Pratos 2', x: 140, y: 910, width: 700, height: 300, text: 'Margherita\nQuatro queijos\nCalabresa', fontSize: 46, fontFamily: 'Inter', fill: '#f3e6cf', align: 'left', fontStyle: 'normal', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Preços 2', x: 840, y: 910, width: 260, height: 300, text: 'R$ 55\nR$ 62\nR$ 58', fontSize: 46, fontFamily: 'Inter', fill: '#c8a25a', align: 'right', fontStyle: 'bold', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Seção 3', x: 140, y: 1260, width: 960, height: 60, text: 'SOBREMESAS', fontSize: 50, fontFamily: 'Montserrat', fill: '#c8a25a', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Pratos 3', x: 140, y: 1350, width: 700, height: 200, text: 'Tiramisù\nPanna cotta', fontSize: 46, fontFamily: 'Inter', fill: '#f3e6cf', align: 'left', fontStyle: 'normal', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Preços 3', x: 840, y: 1350, width: 260, height: 200, text: 'R$ 24\nR$ 22', fontSize: 46, fontFamily: 'Inter', fill: '#c8a25a', align: 'right', fontStyle: 'bold', lineHeight: 1.8 }),
        el({ type: 'text', name: 'Rodapé', x: 100, y: 1620, width: 1040, height: 50, text: 'Rua das Oliveiras, 120 • (11) 3000-0000', fontSize: 34, fontFamily: 'Montserrat', fill: '#8c8170', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'slide-topicos',
    name: 'Slide de tópicos',
    category: 'Apresentação',
    build: () => ({
      page: { width: 1920, height: 1080, background: '#f7f7f5' },
      elements: [
        el({ type: 'rect', name: 'Barra', x: 120, y: 140, width: 12, height: 160, fill: '#0f62fe' }),
        el({ type: 'text', name: 'Título', x: 170, y: 150, width: 1500, height: 140, text: 'Próximos passos', fontSize: 110, fontFamily: 'Montserrat', fill: '#161616', align: 'left', fontStyle: 'bold', lineHeight: 1.2 }),
        el({ type: 'ellipse', name: 'Marcador 1', x: 170, y: 418, width: 36, height: 36, fill: '#0f62fe' }),
        el({ type: 'ellipse', name: 'Marcador 2', x: 170, y: 578, width: 36, height: 36, fill: '#0f62fe' }),
        el({ type: 'ellipse', name: 'Marcador 3', x: 170, y: 738, width: 36, height: 36, fill: '#0f62fe' }),
        el({ type: 'text', name: 'Tópico 1', x: 250, y: 400, width: 1500, height: 80, text: 'Validar o protótipo com 5 clientes', fontSize: 60, fontFamily: 'Inter', fill: '#262626', align: 'left', fontStyle: 'normal', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Tópico 2', x: 250, y: 560, width: 1500, height: 80, text: 'Definir preço e plano de lançamento', fontSize: 60, fontFamily: 'Inter', fill: '#262626', align: 'left', fontStyle: 'normal', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Tópico 3', x: 250, y: 720, width: 1500, height: 80, text: 'Contratar suporte até dezembro', fontSize: 60, fontFamily: 'Inter', fill: '#262626', align: 'left', fontStyle: 'normal', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Rodapé', x: 120, y: 960, width: 1680, height: 40, text: 'Relatório Trimestral • 2', fontSize: 30, fontFamily: 'Inter', fill: '#8d8d8d', align: 'right', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },

  // ---------- Imóveis ----------
  {
    id: 'imovel-venda',
    name: 'Imóvel à venda',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1350, background: '#0f1c2e' },
      elements: [
        photo('Foto do imóvel', 0, 0, 1080, 800, { bind: 'foto1' }),
        el({ type: 'rect', name: 'Etiqueta', x: 60, y: 60, width: 300, height: 84, fill: '#e63946', cornerRadius: 10 }),
        el({ type: 'text', name: 'Etiqueta texto', x: 60, y: 82, width: 300, height: 44, ...bound('{finalidade}'), fontSize: 44, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 60, y: 850, width: 960, height: 70, ...bound('{titulo}'), fontSize: 66, fontFamily: 'Poppins', fill: '#ffffff', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Bairro', x: 60, y: 940, width: 960, height: 44, ...bound('{local}'), fontSize: 40, fontFamily: 'Inter', fill: '#9fb3c8', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Detalhes', x: 60, y: 1020, width: 960, height: 44, ...bound('{detalhes}'), fontSize: 38, fontFamily: 'Inter', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Preço', x: 60, y: 1110, width: 960, height: 100, ...bound('{preco}'), fontSize: 96, fontFamily: 'Montserrat', fill: '#f4c95d', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Contato', x: 60, y: 1260, width: 960, height: 40, ...bound('{telefone}  •  CRECI {creci}'), fontSize: 34, fontFamily: 'Inter', fill: '#9fb3c8', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'imovel-aluguel',
    name: 'Para alugar',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#111111' },
      elements: [
        photo('Foto do imóvel', 0, 0, 1080, 1920, { bind: 'foto1' }),
        el({ type: 'rect', name: 'Sombra', x: 0, y: 1080, width: 1080, height: 840, fill: '#000000', opacity: 0.6 }),
        el({ type: 'rect', name: 'Etiqueta', x: 80, y: 1160, width: 400, height: 90, fill: '#2a9d8f', cornerRadius: 45 }),
        el({ type: 'text', name: 'Etiqueta texto', x: 80, y: 1184, width: 400, height: 44, ...bound('{finalidade}', ALUGUEL), fontSize: 42, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 80, y: 1300, width: 920, height: 200, ...bound('{titulo}', ALUGUEL), fontSize: 92, fontFamily: 'Poppins', fill: '#ffffff', align: 'left', fontStyle: 'bold', lineHeight: 1.05 }),
        el({ type: 'text', name: 'Detalhes', x: 80, y: 1530, width: 920, height: 50, ...bound('{detalhes}', ALUGUEL), fontSize: 44, fontFamily: 'Inter', fill: '#e6e6e6', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Preço', x: 80, y: 1620, width: 920, height: 100, ...bound('{preco}', ALUGUEL), fontSize: 90, fontFamily: 'Montserrat', fill: '#7ee0d2', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Contato', x: 80, y: 1780, width: 920, height: 44, ...bound('Chame no WhatsApp: {telefone}'), fontSize: 40, fontFamily: 'Inter', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'imovel-vendido',
    name: 'Vendido!',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#111111' },
      elements: [
        photo('Foto do imóvel', 0, 0, 1080, 1080, { bind: 'foto1' }),
        el({ type: 'rect', name: 'Escurecer', x: 0, y: 0, width: 1080, height: 1080, fill: '#000000', opacity: 0.3 }),
        el({ type: 'rect', name: 'Faixa', x: -100, y: 520, width: 1300, height: 190, fill: '#e63946', rotation: -12 }),
        el({ type: 'text', name: 'Vendido', x: -93, y: 554, width: 1300, height: 130, text: 'VENDIDO!', fontSize: 140, fontFamily: 'Bebas Neue', fill: '#ffffff', align: 'center', fontStyle: 'normal', lineHeight: 1, rotation: -12 }),
        el({ type: 'text', name: 'Mensagem', x: 60, y: 900, width: 960, height: 60, text: 'Mais um sonho realizado. Parabéns à família!', fontSize: 42, fontFamily: 'Inter', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Corretor', x: 60, y: 980, width: 960, height: 40, ...bound('{corretor} • Corretor de Imóveis'), fontSize: 34, fontFamily: 'Montserrat', fill: '#f4c95d', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'imovel-galeria',
    name: 'Galeria com 3 fotos',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#f5f1ea' },
      elements: [
        photo('Foto principal', 40, 40, 640, 700, { cornerRadius: 20, bind: 'foto1' }),
        photo('Foto 2', 700, 40, 340, 340, { cornerRadius: 20, bind: 'foto2' }),
        photo('Foto 3', 700, 400, 340, 340, { cornerRadius: 20, bind: 'foto3' }),
        el({ type: 'text', name: 'Título', x: 50, y: 790, width: 980, height: 70, ...bound('{titulo}', COBERTURA), fontSize: 70, fontFamily: 'Playfair Display', fill: '#1d2a26', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Detalhes', x: 50, y: 885, width: 980, height: 44, ...bound('{detalhes}', COBERTURA), fontSize: 38, fontFamily: 'Inter', fill: '#5b6660', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Preço', x: 50, y: 960, width: 600, height: 70, ...bound('{preco}', COBERTURA), fontSize: 66, fontFamily: 'Montserrat', fill: '#b5532f', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Contato', x: 630, y: 980, width: 400, height: 40, ...bound('{telefone}'), fontSize: 36, fontFamily: 'Inter', fill: '#1d2a26', align: 'right', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'imovel-visita',
    name: 'Visita aberta',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1350, background: '#fdf6ec' },
      elements: [
        el({ type: 'text', name: 'Chamada', x: 70, y: 90, width: 940, height: 50, text: 'VOCÊ ESTÁ CONVIDADO', fontSize: 40, fontFamily: 'Montserrat', fill: '#c0632b', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 70, y: 160, width: 940, height: 180, text: 'VISITA\nABERTA', fontSize: 120, fontFamily: 'Bebas Neue', fill: '#24170d', align: 'left', fontStyle: 'normal', lineHeight: 0.9 }),
        el({ type: 'text', name: 'Data', x: 600, y: 180, width: 410, height: 140, text: 'Sábado\n10h às 16h', fontSize: 52, fontFamily: 'Poppins', fill: '#24170d', align: 'right', fontStyle: 'bold', lineHeight: 1.2 }),
        photo('Foto do imóvel', 70, 400, 940, 700, { cornerRadius: 28, bind: 'foto1' }),
        el({ type: 'text', name: 'Endereço', x: 70, y: 1150, width: 940, height: 50, ...bound('{local}'), fontSize: 42, fontFamily: 'Inter', fill: '#24170d', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Contato', x: 70, y: 1225, width: 940, height: 44, ...bound('Confirme presença: {telefone}'), fontSize: 38, fontFamily: 'Inter', fill: '#7a5a42', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'corretor',
    name: 'Apresentação do corretor',
    category: 'Imóveis',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#0f1c2e' },
      elements: [
        photo('Sua foto', 80, 140, 420, 560, { cornerRadius: 24 }),
        el({ type: 'text', name: 'Chamada', x: 560, y: 170, width: 460, height: 120, text: 'Seu corretor\nde confiança', fontSize: 46, fontFamily: 'Montserrat', fill: '#f4c95d', align: 'left', fontStyle: 'bold', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Nome', x: 560, y: 330, width: 460, height: 180, ...bound('{corretor}'), fontSize: 86, fontFamily: 'Playfair Display', fill: '#ffffff', align: 'left', fontStyle: 'bold', lineHeight: 1.05 }),
        el({ type: 'text', name: 'CRECI', x: 560, y: 560, width: 460, height: 40, ...bound('CRECI {creci}'), fontSize: 34, fontFamily: 'Inter', fill: '#9fb3c8', align: 'left', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Especialidade', x: 560, y: 620, width: 460, height: 80, text: 'Compra, venda e locação\nem São Paulo', fontSize: 32, fontFamily: 'Inter', fill: '#ffffff', align: 'left', fontStyle: 'normal', lineHeight: 1.3 }),
        el({ type: 'rect', name: 'Barra', x: 0, y: 820, width: 1080, height: 260, fill: '#f4c95d' }),
        el({ type: 'text', name: 'Contato', x: 80, y: 890, width: 920, height: 120, ...bound('{telefone}\n{instagram}'), fontSize: 52, fontFamily: 'Montserrat', fill: '#0f1c2e', align: 'left', fontStyle: 'bold', lineHeight: 1.2 }),
      ],
    }),
  },

  // ---------- Fotos ----------
  {
    id: 'antes-depois',
    name: 'Antes e depois',
    category: 'Fotos',
    build: () => ({
      page: { width: 1080, height: 1080, background: '#ffffff' },
      elements: [
        el({ type: 'text', name: 'Título', x: 40, y: 50, width: 1000, height: 80, text: 'A transformação da sala', fontSize: 70, fontFamily: 'Poppins', fill: '#1d1d1f', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        photo('Foto antes', 40, 170, 490, 760, { cornerRadius: 16 }),
        photo('Foto depois', 550, 170, 490, 760, { cornerRadius: 16 }),
        el({ type: 'rect', name: 'Selo antes', x: 70, y: 200, width: 200, height: 70, fill: '#1d1d1f', cornerRadius: 35 }),
        el({ type: 'text', name: 'Antes', x: 70, y: 218, width: 200, height: 36, text: 'ANTES', fontSize: 34, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'rect', name: 'Selo depois', x: 580, y: 200, width: 220, height: 70, fill: '#2a9d8f', cornerRadius: 35 }),
        el({ type: 'text', name: 'Depois', x: 580, y: 218, width: 220, height: 36, text: 'DEPOIS', fontSize: 34, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
        el({ type: 'text', name: 'Rodapé', x: 40, y: 970, width: 1000, height: 40, text: 'Reforma completa em 45 dias • @seuperfil', fontSize: 34, fontFamily: 'Inter', fill: '#6b6f76', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'foto-moldura',
    name: 'Foto com moldura',
    category: 'Fotos',
    build: () => ({
      page: { width: 1080, height: 1350, background: '#f4efe6' },
      elements: [
        el({ type: 'rect', name: 'Moldura', x: 70, y: 70, width: 940, height: 1000, fill: '#ffffff' }),
        photo('Sua foto', 110, 110, 860, 860),
        el({ type: 'text', name: 'Legenda', x: 70, y: 1110, width: 940, height: 90, text: 'Fim de tarde na varanda', fontSize: 64, fontFamily: 'Pacifico', fill: '#3b2a1a', align: 'center', fontStyle: 'normal', lineHeight: 1.2 }),
        el({ type: 'text', name: 'Local', x: 70, y: 1230, width: 940, height: 40, text: 'ITU, SP • 2026', fontSize: 32, fontFamily: 'Montserrat', fill: '#8a7350', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },

  // ---------- Capas de vídeo ----------
  {
    id: 'capa-reels-tour',
    name: 'Capa de Reels: tour',
    category: 'Capas de vídeo',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#111111' },
      elements: [
        photo('Foto do imóvel', 0, 0, 1080, 1920, { bind: 'foto1' }),
        el({ type: 'rect', name: 'Escurecer', x: 0, y: 0, width: 1080, height: 1920, fill: '#000000', opacity: 0.35 }),
        el({ type: 'ellipse', name: 'Play fundo', x: 440, y: 760, width: 200, height: 200, fill: '#ffffff', opacity: 0.9 }),
        el({ type: 'triangle', name: 'Play', x: 605, y: 815, width: 90, height: 110, fill: '#e63946', rotation: 90 }),
        el({ type: 'text', name: 'Título', x: 80, y: 1120, width: 920, height: 380, text: 'TOUR\nCOMPLETO', fontSize: 190, fontFamily: 'Bebas Neue', fill: '#ffffff', align: 'center', fontStyle: 'normal', lineHeight: 0.9 }),
        el({ type: 'text', name: 'Subtítulo', x: 80, y: 1530, width: 920, height: 60, ...bound('{titulo} • {bairro}'), fontSize: 52, fontFamily: 'Poppins', fill: '#f4c95d', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'capa-reels-dicas',
    name: 'Capa de Reels: dicas',
    category: 'Capas de vídeo',
    build: () => ({
      page: { width: 1080, height: 1920, background: '#fff4d6' },
      elements: [
        photo('Foto de fundo', 0, 0, 1080, 1000),
        el({ type: 'rect', name: 'Número fundo', x: 80, y: 900, width: 220, height: 220, fill: '#e63946', cornerRadius: 30 }),
        el({ type: 'text', name: 'Número', x: 80, y: 925, width: 220, height: 180, text: '5', fontSize: 180, fontFamily: 'Bebas Neue', fill: '#ffffff', align: 'center', fontStyle: 'normal', lineHeight: 1 }),
        el({ type: 'text', name: 'Título', x: 80, y: 1180, width: 920, height: 420, text: 'ERROS QUE VOCÊ\nNÃO PODE COMETER\nAO COMPRAR\nUM IMÓVEL', fontSize: 118, fontFamily: 'Bebas Neue', fill: '#1d1d1f', align: 'left', fontStyle: 'normal', lineHeight: 0.95 }),
        el({ type: 'text', name: 'Perfil', x: 80, y: 1720, width: 920, height: 50, text: '@seuperfil', fontSize: 44, fontFamily: 'Montserrat', fill: '#e63946', align: 'left', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
  {
    id: 'miniatura-youtube',
    name: 'Miniatura do YouTube',
    category: 'Capas de vídeo',
    build: () => ({
      page: { width: 1280, height: 720, background: '#ffd400' },
      elements: [
        photo('Foto do imóvel', 520, 0, 760, 720, { bind: 'foto1' }),
        el({ type: 'text', name: 'Título', x: 50, y: 110, width: 520, height: 430, text: 'TOUR PELA\nCASA DE\nR$ 2 MILHÕES', fontSize: 130, fontFamily: 'Bebas Neue', fill: '#111111', align: 'left', fontStyle: 'normal', lineHeight: 0.92 }),
        el({ type: 'rect', name: 'Selo', x: 50, y: 580, width: 300, height: 80, fill: '#e63946', cornerRadius: 12 }),
        el({ type: 'text', name: 'Selo texto', x: 50, y: 600, width: 300, height: 44, text: 'VÍDEO NOVO', fontSize: 42, fontFamily: 'Montserrat', fill: '#ffffff', align: 'center', fontStyle: 'bold', lineHeight: 1 }),
      ],
    }),
  },
]

export const blankDesign = (width: number, height: number): Design => ({
  page: { width, height, background: '#ffffff' },
  elements: [],
})
