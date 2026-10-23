import type { ColorRole, Design } from './types'

export interface Marca {
  logo?: string
  principal?: string // cor de fundos e blocos grandes
  destaque?: string // cor de preços, etiquetas e botões
  fonteTitulo?: string
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Razão de contraste WCAG entre duas cores (1 a 21)
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Preto ou branco, o que for mais legível sobre a cor de fundo
export const textOn = (bg: string) => (luminance(bg) > 0.4 ? '#141414' : '#ffffff')

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')
}

// Cor de cada papel; undefined = a marca não define, usa a cor do modelo
function roleColor(role: ColorRole, m: Marca): string | undefined {
  switch (role) {
    case 'principal':
      return m.principal
    case 'destaque':
      return m.destaque
    case 'sobrePrincipal':
      return m.principal && textOn(m.principal)
    case 'suave':
      return m.principal && mix(textOn(m.principal), m.principal, 0.3)
    case 'sobreDestaque':
      return m.destaque && textOn(m.destaque)
  }
}

// Aplica cores, fonte e logo da marca aos elementos marcados com papéis
export function applyMarca(design: Design, m: Marca): Design {
  const { page } = design
  return {
    page: page.bgRole ? { ...page, background: roleColor(page.bgRole, m) ?? page.defaultBg ?? page.background } : page,
    elements: design.elements.map((e) => {
      let next = e
      if (e.colorRole) next = { ...next, fill: roleColor(e.colorRole, m) ?? e.defaultFill ?? e.fill }
      if (e.fontRole) next = { ...next, fontFamily: m.fonteTitulo || e.defaultFont || e.fontFamily }
      if (e.bind === 'logo') next = { ...next, src: m.logo ?? e.src, hidden: !m.logo }
      return next
    }),
  }
}
