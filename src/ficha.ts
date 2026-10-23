import type { Design } from './types'

export type PhotoSlot = 'foto1' | 'foto2' | 'foto3'

export interface Ficha {
  finalidade: 'venda' | 'aluguel'
  titulo: string
  bairro: string
  cidade: string
  quartos: string
  banheiros: string
  vagas: string
  area: string
  preco: string // só dígitos, em reais
  corretor: string
  creci: string
  telefone: string
  instagram: string
  foto1?: string
  foto2?: string
  foto3?: string
}

// Valores de exemplo: aparecem nos modelos até o usuário preencher a ficha
export const DEFAULT_FICHA: Ficha = {
  finalidade: 'venda',
  titulo: 'Apartamento 3 quartos',
  bairro: 'Jardins',
  cidade: 'São Paulo, SP',
  quartos: '3',
  banheiros: '2',
  vagas: '2',
  area: '98',
  preco: '890000',
  corretor: 'Seu Nome',
  creci: '00000-F',
  telefone: '(11) 99999-0000',
  instagram: '@seucorretor',
}

const plural = (n: string, um: string, varios: string) => (n.trim() === '1' ? `1 ${um}` : `${n.trim()} ${varios}`)

export function formatPreco(f: Ficha) {
  const n = Number(f.preco.replace(/\D/g, ''))
  if (!n) return ''
  const valor = n.toLocaleString('pt-BR')
  return f.finalidade === 'aluguel' ? `R$ ${valor}/mês` : `R$ ${valor}`
}

// "3 quartos  •  2 banheiros  •  2 vagas  •  98 m²", pulando campos vazios
export function formatDetalhes(f: Ficha) {
  return [
    f.quartos.trim() && plural(f.quartos, 'quarto', 'quartos'),
    f.banheiros.trim() && plural(f.banheiros, 'banheiro', 'banheiros'),
    f.vagas.trim() && plural(f.vagas, 'vaga', 'vagas'),
    f.area.trim() && `${f.area.trim()} m²`,
  ]
    .filter(Boolean)
    .join('  •  ')
}

const FIELDS: Record<string, (f: Ficha) => string> = {
  finalidade: (f) => (f.finalidade === 'aluguel' ? 'PARA ALUGAR' : 'À VENDA'),
  titulo: (f) => f.titulo,
  bairro: (f) => f.bairro,
  cidade: (f) => f.cidade,
  local: (f) => [f.bairro, f.cidade].filter((s) => s.trim()).join(' • '),
  detalhes: formatDetalhes,
  preco: formatPreco,
  corretor: (f) => f.corretor,
  creci: (f) => f.creci,
  telefone: (f) => f.telefone,
  instagram: (f) => f.instagram,
}

// Troca {campo} pelo valor da ficha. Campos desconhecidos ficam como estão.
export function fillText(template: string, f: Ficha) {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (FIELDS[key] ? FIELDS[key](f) : m))
}

// Atualiza os textos e fotos do design que estão ligados à ficha
export function applyFicha(design: Design, f: Ficha): Design {
  return {
    ...design,
    elements: design.elements.map((e) => {
      if (e.textTemplate) return { ...e, text: fillText(e.textTemplate, f) }
      if (e.bind && f[e.bind]) return { ...e, src: f[e.bind] }
      return e
    }),
  }
}

export const usesFicha = (design: Design) => design.elements.some((e) => e.textTemplate || e.bind)
