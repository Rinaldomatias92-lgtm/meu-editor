import { useRef } from 'react'
import { type Marca, contrast, textOn } from './marca'
import { FONTS } from './types'

interface MarcaPanelProps {
  marca: Marca
  onChange: (patch: Partial<Marca>) => void
  onLogo: (file: File) => void
}

const PALETAS: { nome: string; principal: string; destaque: string }[] = [
  { nome: 'Marinho e dourado', principal: '#0f1c2e', destaque: '#f4c95d' },
  { nome: 'Verde e laranja', principal: '#123d33', destaque: '#ff8a3d' },
  { nome: 'Preto e amarelo', principal: '#111111', destaque: '#ffd400' },
  { nome: 'Vinho e rosé', principal: '#4a1325', destaque: '#f2b8c6' },
  { nome: 'Azul e amarelo', principal: '#1f4fd8', destaque: '#ffd166' },
  { nome: 'Grafite e turquesa', principal: '#2b2f36', destaque: '#3dd6c3' },
]

export default function MarcaPanel({ marca, onChange, onLogo }: MarcaPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const colorField = (key: 'principal' | 'destaque', label: string, help: string) => (
    <div className="marca-color">
      <label className="field">
        {label}
        <input id={`marca-${key}`} type="color" value={marca[key] ?? '#888888'} onChange={(e) => onChange({ [key]: e.target.value })} />
      </label>
      <p className="hint">{marca[key] ? help : 'Usando as cores de cada modelo.'}</p>
      {marca[key] && (
        <button className="link" onClick={() => onChange({ [key]: undefined })}>
          Usar a cor do modelo
        </button>
      )}
    </div>
  )

  return (
    <>
      <h3>Minha marca</h3>
      <p className="hint">Sua logo, cores e fonte são aplicadas nos modelos de Imóveis e nas capas de vídeo.</p>

      <h4>Logo</h4>
      <button className="marca-logo" onClick={() => inputRef.current?.click()} title="Escolher logo">
        {marca.logo ? <img src={marca.logo} alt="Sua logo" /> : <span>+ Enviar logo</span>}
      </button>
      <p className="hint">Prefira PNG com fundo transparente.</p>
      {marca.logo && (
        <button className="link" onClick={() => onChange({ logo: undefined })}>
          Remover logo
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onLogo(f)
          e.target.value = ''
        }}
      />

      <h4>Cores</h4>
      <div className="paletas">
        {PALETAS.map((p) => (
          <button
            key={p.nome}
            className={marca.principal === p.principal && marca.destaque === p.destaque ? 'paleta on' : 'paleta'}
            onClick={() => onChange({ principal: p.principal, destaque: p.destaque })}
            title={p.nome}
            aria-label={p.nome}
          >
            <span style={{ background: p.principal }} />
            <span style={{ background: p.destaque }} />
          </button>
        ))}
      </div>
      {colorField('principal', 'Cor principal', 'Fundos e blocos grandes.')}
      {colorField('destaque', 'Cor de destaque', 'Preços, etiquetas e botões.')}
      {marca.principal && marca.destaque && (
        <div className="marca-preview" style={{ background: marca.principal, color: textOn(marca.principal) }}>
          Apartamento 3 quartos
          <strong style={{ color: marca.destaque }}>R$ 890.000</strong>
          <span className="marca-tag" style={{ background: marca.destaque, color: textOn(marca.destaque) }}>
            À VENDA
          </span>
        </div>
      )}
      {marca.principal && marca.destaque && contrast(marca.principal, marca.destaque) < 3 && (
        <p className="hint linked">
          O destaque fica pouco visível sobre a cor principal: preços podem ficar difíceis de ler. Escolha um destaque mais escuro ou mais
          claro.
        </p>
      )}

      <h4>Fonte dos títulos</h4>
      <label className="field">
        <select
          id="marca-fonte"
          value={marca.fonteTitulo ?? ''}
          onChange={(e) => onChange({ fonteTitulo: e.target.value || undefined })}
          style={{ fontFamily: marca.fonteTitulo }}
        >
          <option value="">A de cada modelo</option>
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </label>
    </>
  )
}
