import { useEffect, useState } from 'react'
import { zipSync } from 'fflate'
import { type Ficha, applyFicha } from './ficha'
import { type Marca, applyMarca } from './marca'
import { TEMPLATES } from './templates'
import { renderDesign } from './render'
import { saveFile } from './files'

// Formatos do pacote: um modelo de cada, todos com a mesma ficha e marca
const FORMATOS = [
  { template: 'imovel-venda', label: 'Post do feed', size: '1080 × 1350', slug: 'post-feed' },
  { template: 'imovel-galeria', label: 'Post com 3 fotos', size: '1080 × 1080', slug: 'post-galeria' },
  { template: 'imovel-aluguel', label: 'Story', size: '1080 × 1920', slug: 'story' },
  { template: 'capa-reels-tour', label: 'Capa de Reels / TikTok', size: '1080 × 1920', slug: 'capa-reels' },
  { template: 'miniatura-youtube', label: 'Miniatura do YouTube', size: '1280 × 720', slug: 'miniatura-youtube' },
]

interface Arte {
  slug: string
  blob: Blob
  url: string
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'imovel'

interface PacoteModalProps {
  ficha: Ficha
  marca: Marca
  onClose: () => void
}

export default function PacoteModal({ ficha, marca, onClose }: PacoteModalProps) {
  const [artes, setArtes] = useState<Record<string, Arte>>({})
  const [selected, setSelected] = useState<Set<string>>(() => new Set(FORMATOS.map((f) => f.slug)))
  const [status, setStatus] = useState<string | null>(null)
  const base = slugify(ficha.titulo)

  useEffect(() => {
    let alive = true
    const urls: string[] = []
    ;(async () => {
      for (const f of FORMATOS) {
        const t = TEMPLATES.find((x) => x.id === f.template)
        if (!t) continue
        const blob = await renderDesign(applyMarca(applyFicha(t.build(), ficha), marca))
        if (!alive) return
        const url = URL.createObjectURL(blob)
        urls.push(url)
        setArtes((a) => ({ ...a, [f.slug]: { slug: f.slug, blob, url } }))
      }
    })()
    return () => {
      alive = false
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [ficha, marca])

  const ready = FORMATOS.every((f) => artes[f.slug])

  const save = async (blob: Blob, filename: string) => {
    setStatus(null)
    try {
      const r = await saveFile(blob, filename)
      if (r === 'unavailable') setStatus('Este visualizador não permite baixar arquivos.')
    } catch (err) {
      if ((err as { code?: string }).code !== 'declined') setStatus('Não foi possível baixar. Tente de novo.')
    }
  }

  const saveZip = async () => {
    const files: Record<string, Uint8Array> = {}
    for (const f of FORMATOS) {
      if (!selected.has(f.slug) || !artes[f.slug]) continue
      files[`${base}-${f.slug}.png`] = new Uint8Array(await artes[f.slug].blob.arrayBuffer())
    }
    // PNG já é comprimido: guardar sem recomprimir deixa o zip rápido
    const zip = zipSync(files, { level: 0 })
    await save(new Blob([zip], { type: 'application/zip' }), `${base}-pacote.zip`)
  }

  const toggle = (slug: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(slug)) n.delete(slug)
      else n.add(slug)
      return n
    })

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pacote-title">
        <header className="modal-head">
          <div>
            <h2 id="pacote-title">Pacote de divulgação</h2>
            <p className="hint">
              {ficha.titulo} • com os dados da Ficha do imóvel e a sua Marca
            </p>
          </div>
          <button className="ghost close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <div className="pacote-grid">
          {FORMATOS.map((f) => {
            const arte = artes[f.slug]
            return (
              <div key={f.slug} className={selected.has(f.slug) ? 'pacote-card on' : 'pacote-card'}>
                <label className="pacote-check">
                  <input id={`pacote-${f.slug}`} type="checkbox" checked={selected.has(f.slug)} onChange={() => toggle(f.slug)} />
                  <span>
                    <strong>{f.label}</strong>
                    <small>{f.size}</small>
                  </span>
                </label>
                <div className="pacote-preview">{arte ? <img src={arte.url} alt={f.label} /> : <span className="hint">Gerando…</span>}</div>
                <button disabled={!arte} onClick={() => arte && save(arte.blob, `${base}-${f.slug}.png`)}>
                  Baixar PNG
                </button>
              </div>
            )
          })}
        </div>

        <footer className="modal-foot">
          {status && (
            <span className="hint" role="status">
              {status}
            </span>
          )}
          <span className="hint">Para trocar textos ou fotos, edite a Ficha do imóvel e abra o pacote de novo.</span>
          <button className="primary" disabled={!ready || selected.size === 0} onClick={saveZip}>
            {ready ? `Baixar ${selected.size} ${selected.size === 1 ? 'arte' : 'artes'} (.zip)` : 'Gerando…'}
          </button>
        </footer>
      </div>
    </div>
  )
}
