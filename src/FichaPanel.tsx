import { useRef } from 'react'
import { type Ficha, type PhotoSlot, formatDetalhes, formatPreco } from './ficha'

interface FichaPanelProps {
  ficha: Ficha
  onChange: (patch: Partial<Ficha>) => void
  onPhoto: (slot: PhotoSlot, file: File) => void
}

type TextField = Exclude<keyof Ficha, 'finalidade' | PhotoSlot>

const SLOTS: [PhotoSlot, string][] = [
  ['foto1', 'Foto principal'],
  ['foto2', 'Foto 2'],
  ['foto3', 'Foto 3'],
]

export default function FichaPanel({ ficha, onChange, onPhoto }: FichaPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const slotRef = useRef<PhotoSlot>('foto1')

  const field = (key: TextField, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      {label}
      <input id={`ficha-${key}`} value={ficha[key]} onChange={(e) => onChange({ [key]: e.target.value })} {...props} />
    </label>
  )

  const pickPhoto = (slot: PhotoSlot) => {
    slotRef.current = slot
    inputRef.current?.click()
  }

  return (
    <>
      <h3>Ficha do imóvel</h3>
      <p className="hint">Preencha uma vez: os modelos da categoria Imóveis usam estes dados e estas fotos.</p>

      <h4>Imóvel</h4>
      <div className="btn-row">
        {(['venda', 'aluguel'] as const).map((f) => (
          <button key={f} className={ficha.finalidade === f ? 'toggle on' : 'toggle'} onClick={() => onChange({ finalidade: f })}>
            {f === 'venda' ? 'À venda' : 'Para alugar'}
          </button>
        ))}
      </div>
      {field('titulo', 'Título', { placeholder: 'Ex.: Apartamento 3 quartos' })}
      <div className="field-row">
        {field('bairro', 'Bairro')}
        {field('cidade', 'Cidade')}
      </div>
      <div className="field-row">
        {field('quartos', 'Quartos', { inputMode: 'numeric' })}
        {field('banheiros', 'Banheiros', { inputMode: 'numeric' })}
      </div>
      <div className="field-row">
        {field('vagas', 'Vagas', { inputMode: 'numeric' })}
        {field('area', 'Área (m²)', { inputMode: 'numeric' })}
      </div>
      <label className="field">
        {ficha.finalidade === 'aluguel' ? 'Aluguel por mês (R$)' : 'Preço (R$)'}
        <input
          id="ficha-preco"
          inputMode="numeric"
          value={ficha.preco ? Number(ficha.preco).toLocaleString('pt-BR') : ''}
          onChange={(e) => onChange({ preco: e.target.value.replace(/\D/g, '') })}
        />
      </label>
      <p className="hint ficha-preview">
        {formatPreco(ficha) || 'Sem preço'}
        <br />
        {formatDetalhes(ficha) || 'Sem detalhes'}
      </p>

      <h4>Fotos</h4>
      <div className="ficha-photos">
        {SLOTS.map(([slot, label]) => (
          <button key={slot} className="ficha-photo" onClick={() => pickPhoto(slot)} title={`Escolher ${label.toLowerCase()}`}>
            {ficha[slot] ? <img src={ficha[slot]} alt={label} /> : <span className="ficha-photo-empty">+</span>}
            <small>{label}</small>
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPhoto(slotRef.current, f)
          e.target.value = ''
        }}
      />

      <h4>Corretor</h4>
      {field('corretor', 'Nome')}
      <div className="field-row">
        {field('creci', 'CRECI')}
        {field('telefone', 'Telefone', { inputMode: 'tel' })}
      </div>
      {field('instagram', 'Instagram')}
    </>
  )
}
