import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { jsPDF } from 'jspdf'
import Canvas from './Canvas'
import { type Design, type DesignElement, type ElementType, FONTS, newId } from './types'
import { SIZES, TEMPLATES, blankDesign } from './templates'
import './App.css'

const STORAGE_KEY = 'meu-editor:design'
type Tab = 'modelos' | 'elementos' | 'texto' | 'uploads'

interface History {
  past: Design[]
  present: Design
  future: Design[]
}

function loadInitial(): Design {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Design
  } catch {
    /* sem armazenamento disponível */
  }
  return TEMPLATES[0].build()
}

export default function App() {
  const [history, setHistory] = useState<History>(() => ({ past: [], present: loadInitial(), future: [] }))
  const design = history.present
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('modelos')
  const [zoom, setZoom] = useState<number | null>(null) // null = ajustar à tela
  const [fitScale, setFitScale] = useState(0.5)
  const [fontsVersion, setFontsVersion] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const replaceTargetRef = useRef<string | null>(null)

  const scale = zoom ?? fitScale
  const selected = design.elements.find((e) => e.id === selectedId) ?? null

  // ---------- histórico ----------
  const commit = useCallback((fn: (d: Design) => Design) => {
    setHistory((h) => ({ past: [...h.past.slice(-60), h.present], present: fn(h.present), future: [] }))
  }, [])
  const undo = useCallback(() => {
    setHistory((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h))
  }, [])
  const redo = useCallback(() => {
    setHistory((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h))
  }, [])

  const updateElement = useCallback(
    (id: string, patch: Partial<DesignElement>) =>
      commit((d) => ({ ...d, elements: d.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    [commit],
  )

  const addElement = useCallback(
    (el: Omit<DesignElement, 'id' | 'x' | 'y' | 'rotation' | 'opacity'> & Partial<DesignElement>) => {
      const id = newId()
      commit((d) => ({
        ...d,
        elements: [
          ...d.elements,
          {
            rotation: 0,
            opacity: 1,
            x: (d.page.width - el.width) / 2,
            y: (d.page.height - el.height) / 2,
            ...el,
            id,
          },
        ],
      }))
      setSelectedId(id)
    },
    [commit],
  )

  const removeElement = useCallback(
    (id: string) => {
      commit((d) => ({ ...d, elements: d.elements.filter((e) => e.id !== id) }))
      setSelectedId(null)
    },
    [commit],
  )

  const duplicateElement = useCallback(
    (id: string) => {
      const src = design.elements.find((e) => e.id === id)
      if (!src) return
      const copy = { ...src, id: newId(), name: src.name + ' (cópia)', x: src.x + 30, y: src.y + 30, locked: false }
      commit((d) => {
        const idx = d.elements.findIndex((e) => e.id === id)
        const elements = [...d.elements]
        elements.splice(idx + 1, 0, copy)
        return { ...d, elements }
      })
      setSelectedId(copy.id)
    },
    [commit, design.elements],
  )

  const moveLayer = (id: string, dir: 'up' | 'down' | 'top' | 'bottom') =>
    commit((d) => {
      const elements = [...d.elements]
      const idx = elements.findIndex((e) => e.id === id)
      const [el] = elements.splice(idx, 1)
      const target = dir === 'up' ? Math.min(idx + 1, elements.length) : dir === 'down' ? Math.max(idx - 1, 0) : dir === 'top' ? elements.length : 0
      elements.splice(target, 0, el)
      return { ...d, elements }
    })

  // ---------- alinhamento à página ----------
  const alignToPage = (mode: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom') => {
    if (!selected) return
    const node = stageRef.current?.findOne('#' + selected.id)
    const layer = node?.getLayer()
    if (!node || !layer) return
    const r = node.getClientRect({ relativeTo: layer })
    const { width: pw, height: ph } = design.page
    let dx = 0
    let dy = 0
    if (mode === 'left') dx = -r.x
    if (mode === 'hcenter') dx = (pw - r.width) / 2 - r.x
    if (mode === 'right') dx = pw - r.width - r.x
    if (mode === 'top') dy = -r.y
    if (mode === 'vcenter') dy = (ph - r.height) / 2 - r.y
    if (mode === 'bottom') dy = ph - r.height - r.y
    updateElement(selected.id, { x: selected.x + dx, y: selected.y + dy })
  }

  // ---------- adicionar conteúdo ----------
  const addShape = (type: ElementType, name: string, extra: Partial<DesignElement> = {}) => {
    const size = Math.round(Math.min(design.page.width, design.page.height) * 0.3)
    addElement({ type, name, width: size, height: size, fill: '#8b3dff', ...extra })
  }

  const addText = (kind: 'title' | 'subtitle' | 'body') => {
    const pw = design.page.width
    const preset = {
      title: { text: 'Adicione um título', fontSize: Math.round(pw * 0.08), fontStyle: 'bold', name: 'Título' },
      subtitle: { text: 'Adicione um subtítulo', fontSize: Math.round(pw * 0.05), fontStyle: 'normal', name: 'Subtítulo' },
      body: { text: 'Adicione um pouco de texto', fontSize: Math.round(pw * 0.03), fontStyle: 'normal', name: 'Texto' },
    }[kind]
    addElement({
      type: 'text',
      width: pw * 0.7,
      height: preset.fontSize * 1.2,
      fontFamily: 'Inter',
      fill: '#1d1d1f',
      align: 'center',
      lineHeight: 1.2,
      ...preset,
    })
  }

  const addImageFile = async (file: File) => {
    const { src, width, height } = await readImageFile(file)
    const max = Math.min(design.page.width, design.page.height) * 0.6
    const ratio = Math.min(1, max / Math.max(width, height))
    addElement({ type: 'image', name: file.name.replace(/\.[^.]+$/, ''), src, width: width * ratio, height: height * ratio })
  }

  const requestReplaceImage = (id: string) => {
    replaceTargetRef.current = id
    replaceInputRef.current?.click()
  }

  const replaceImageFile = async (file: File) => {
    const id = replaceTargetRef.current
    if (!id) return
    const { src } = await readImageFile(file)
    updateElement(id, { src, name: file.name.replace(/\.[^.]+$/, '') })
  }

  // Sem confirmação: trocar de modelo pode ser desfeito com Ctrl+Z
  const applyTemplate = (build: () => Design) => {
    commit(() => build())
    setSelectedId(null)
    setZoom(null)
  }

  const resizePage = (width: number, height: number) => {
    commit((d) => ({ ...d, page: { ...d.page, width, height } }))
    setZoom(null)
  }

  // ---------- exportação ----------
  const renderPng = (): string | null => {
    const stage = stageRef.current
    if (!stage) return null
    const ui = stage.find('.ui')
    ui.forEach((n) => n.hide())
    const url = stage.toDataURL({ pixelRatio: 1 / scale, mimeType: 'image/png' })
    ui.forEach((n) => n.show())
    return url
  }

  const exportAs = async (format: 'png' | 'pdf') => {
    setExporting(true)
    setNotice(null)
    setSelectedId(null)
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const png = renderPng()
    try {
      if (!png) return
      let blob: Blob
      if (format === 'png') blob = await (await fetch(png)).blob()
      else {
        const { width, height } = design.page
        const pdf = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height], hotfixes: ['px_scaling'] })
        pdf.addImage(png, 'PNG', 0, 0, width, height)
        blob = pdf.output('blob')
      }
      const result = await saveFile(blob, `meu-design.${format}`)
      if (result === 'unavailable') setNotice('Este visualizador não permite baixar arquivos.')
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code !== 'declined') setNotice('Não foi possível baixar o arquivo. Tente de novo.')
    } finally {
      setExporting(false)
    }
  }

  // ---------- efeitos ----------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design))
    } catch {
      /* cota excedida ou armazenamento bloqueado */
    }
  }, [design])

  // Redesenha os textos quando as fontes web terminam de carregar
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsVersion((v) => v + 1))
  }, [])
  const loadedFonts = useRef(new Set<string>())
  useEffect(() => {
    const pending = [...new Set(design.elements.filter((e) => e.type === 'text').map((e) => `${e.fontStyle ?? 'normal'} 32px "${e.fontFamily}"`))].filter(
      (f) => !loadedFonts.current.has(f),
    )
    if (!pending.length || !document.fonts) return
    pending.forEach((f) => loadedFonts.current.add(f))
    Promise.all(pending.map((f) => document.fonts.load(f))).then(() => setFontsVersion((v) => v + 1))
  }, [design.elements])

  useLayoutEffect(() => {
    const ws = workspaceRef.current
    if (!ws) return
    const fit = () => {
      const pad = 64
      setFitScale(Math.max(0.05, Math.min((ws.clientWidth - pad) / design.page.width, (ws.clientHeight - pad) / design.page.height)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(ws)
    return () => ro.disconnect()
  }, [design.page.width, design.page.height])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable]')) return
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (mod && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault()
        duplicateElement(selectedId)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeElement(selectedId)
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      } else if (selected && !selected.locked && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        updateElement(selected.id, { x: selected.x + dx, y: selected.y + dy })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedId, selected, duplicateElement, removeElement, updateElement])

  // ---------- UI ----------
  const sizeMatch = SIZES.find((s) => s.width === design.page.width && s.height === design.page.height)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◆</span> Meu Editor
        </div>
        <div className="topbar-group">
          <button className="ghost" onClick={undo} disabled={!history.past.length} title="Desfazer (Ctrl+Z)">
            ↶
          </button>
          <button className="ghost" onClick={redo} disabled={!history.future.length} title="Refazer (Ctrl+Shift+Z)">
            ↷
          </button>
          <select
            className="ghost"
            value={sizeMatch ? sizeMatch.name : ''}
            onChange={(e) => {
              const s = SIZES.find((x) => x.name === e.target.value)
              if (s) resizePage(s.width, s.height)
            }}
            title="Redimensionar"
          >
            {!sizeMatch && <option value="">{`${design.page.width} × ${design.page.height}`}</option>}
            {SIZES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.width}×{s.height})
              </option>
            ))}
          </select>
        </div>
        <div className="topbar-group">
          {notice && (
            <span className="notice" role="status">
              {notice}
            </span>
          )}
          <button onClick={() => exportAs('png')} disabled={exporting}>
            Baixar PNG
          </button>
          <button className="primary" onClick={() => exportAs('pdf')} disabled={exporting}>
            Baixar PDF
          </button>
        </div>
      </header>

      <nav className="rail">
        {(
          [
            ['modelos', '▦', 'Modelos'],
            ['elementos', '◯', 'Elementos'],
            ['texto', 'T', 'Texto'],
            ['uploads', '⇪', 'Uploads'],
          ] as const
        ).map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'rail-btn active' : 'rail-btn'} onClick={() => setTab(id)}>
            <span className="rail-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <aside className="panel left">
        {tab === 'modelos' && (
          <>
            <h3>Modelos</h3>
            {[...new Set(TEMPLATES.map((t) => t.category))].map((category) => (
              <div key={category}>
                <h4>{category}</h4>
                <div className="template-grid">
                  {TEMPLATES.filter((t) => t.category === category).map((t) => (
                    <button key={t.id} className="template-card" onClick={() => applyTemplate(t.build)}>
                      <TemplateThumb design={t.build()} />
                      <span className="template-name">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <h3>Começar em branco</h3>
            <div className="size-list">
              {SIZES.map((s) => (
                <button key={s.name} className="size-btn" onClick={() => applyTemplate(() => blankDesign(s.width, s.height))}>
                  {s.name}
                  <small>
                    {s.width}×{s.height}
                  </small>
                </button>
              ))}
            </div>
          </>
        )}
        {tab === 'elementos' && (
          <>
            <h3>Formas</h3>
            <div className="shape-grid">
              <button onClick={() => addShape('rect', 'Retângulo')} title="Retângulo">
                <svg viewBox="0 0 40 40"><rect x="4" y="8" width="32" height="24" /></svg>
              </button>
              <button onClick={() => addShape('rect', 'Retângulo arredondado', { cornerRadius: 40 })} title="Arredondado">
                <svg viewBox="0 0 40 40"><rect x="4" y="8" width="32" height="24" rx="8" /></svg>
              </button>
              <button onClick={() => addShape('ellipse', 'Círculo')} title="Círculo">
                <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" /></svg>
              </button>
              <button onClick={() => addShape('triangle', 'Triângulo')} title="Triângulo">
                <svg viewBox="0 0 40 40"><polygon points="20,5 36,34 4,34" /></svg>
              </button>
              <button onClick={() => addShape('star', 'Estrela')} title="Estrela">
                <svg viewBox="0 0 40 40"><polygon points="20,3 24.7,14.5 37,15.3 27.5,23.3 30.5,35.3 20,28.7 9.5,35.3 12.5,23.3 3,15.3 15.3,14.5" /></svg>
              </button>
              <button onClick={() => addShape('rect', 'Linha', { height: 8, width: design.page.width * 0.4 })} title="Linha">
                <svg viewBox="0 0 40 40"><rect x="4" y="18" width="32" height="4" /></svg>
              </button>
              <button onClick={() => addShape('rect', 'Contorno', { fill: 'transparent', stroke: '#8b3dff', strokeWidth: 8 })} title="Contorno">
                <svg viewBox="0 0 40 40"><rect x="5" y="9" width="30" height="22" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
              </button>
              <button onClick={() => addShape('ellipse', 'Anel', { fill: 'transparent', stroke: '#8b3dff', strokeWidth: 8 })} title="Anel">
                <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
              </button>
            </div>
          </>
        )}
        {tab === 'texto' && (
          <>
            <h3>Texto</h3>
            <button className="text-add title" onClick={() => addText('title')}>
              Adicionar título
            </button>
            <button className="text-add subtitle" onClick={() => addText('subtitle')}>
              Adicionar subtítulo
            </button>
            <button className="text-add body" onClick={() => addText('body')}>
              Adicionar corpo de texto
            </button>
            <p className="hint">Dica: dê dois cliques num texto no design para editá-lo.</p>
          </>
        )}
        {tab === 'uploads' && (
          <>
            <h3>Uploads</h3>
            <button className="primary wide" onClick={() => fileInputRef.current?.click()}>
              Enviar imagem
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) addImageFile(f)
                e.target.value = ''
              }}
            />
            <div
              className="dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f?.type.startsWith('image/')) addImageFile(f)
              }}
            >
              ou arraste uma imagem para cá
            </div>
          </>
        )}
      </aside>

      <main className="workspace" ref={workspaceRef}>
        <div className="workspace-inner">
          <Canvas
            design={design}
            scale={scale}
            selectedId={selectedId}
            fontsVersion={fontsVersion}
            stageRef={stageRef}
            onSelect={setSelectedId}
            onChange={updateElement}
            onReplaceImage={requestReplaceImage}
          />
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) replaceImageFile(f)
              e.target.value = ''
            }}
          />
        </div>
        <div className="zoom-bar">
          <button className="ghost" onClick={() => setZoom(Math.max(0.05, scale / 1.25))}>
            −
          </button>
          <button className="ghost zoom-value" onClick={() => setZoom(null)} title="Ajustar à tela">
            {Math.round(scale * 100)}%
          </button>
          <button className="ghost" onClick={() => setZoom(Math.min(4, scale * 1.25))}>
            +
          </button>
        </div>
      </main>

      <aside className="panel right">
        {selected ? (
          <Properties
            el={selected}
            onChange={(patch) => updateElement(selected.id, patch)}
            onAlign={alignToPage}
            onLayer={(dir) => moveLayer(selected.id, dir)}
            onDuplicate={() => duplicateElement(selected.id)}
            onDelete={() => removeElement(selected.id)}
            onReplaceImage={() => requestReplaceImage(selected.id)}
          />
        ) : (
          <>
            <h3>Página</h3>
            <label className="field">
              Cor de fundo
              <input type="color" value={toHex(design.page.background)} onChange={(e) => commit((d) => ({ ...d, page: { ...d.page, background: e.target.value } }))} />
            </label>
            <div className="field-row">
              <label className="field">
                Largura
                <input type="number" min={50} max={8000} value={design.page.width} onChange={(e) => resizePage(clampInt(e.target.value, 50, 8000), design.page.height)} />
              </label>
              <label className="field">
                Altura
                <input type="number" min={50} max={8000} value={design.page.height} onChange={(e) => resizePage(design.page.width, clampInt(e.target.value, 50, 8000))} />
              </label>
            </div>
          </>
        )}

        <h3>Camadas</h3>
        <ul className="layers">
          {[...design.elements].reverse().map((el) => (
            <li key={el.id} className={el.id === selectedId ? 'layer active' : 'layer'} onClick={() => setSelectedId(el.id)}>
              <span className="layer-type">{TYPE_ICON[el.type]}</span>
              <span className="layer-name" title={el.name}>
                {el.type === 'text' ? el.text?.split('\n')[0] || el.name : el.name}
              </span>
              <button
                className="icon"
                title={el.hidden ? 'Mostrar' : 'Ocultar'}
                onClick={(e) => {
                  e.stopPropagation()
                  updateElement(el.id, { hidden: !el.hidden })
                }}
              >
                {el.hidden ? '◌' : '◉'}
              </button>
              <button
                className="icon"
                title={el.locked ? 'Desbloquear' : 'Bloquear'}
                onClick={(e) => {
                  e.stopPropagation()
                  updateElement(el.id, { locked: !el.locked })
                }}
              >
                {el.locked ? '🔒' : '🔓'}
              </button>
            </li>
          ))}
          {!design.elements.length && <li className="hint">Nenhum elemento ainda.</li>}
        </ul>
      </aside>
    </div>
  )
}

const MAX_IMAGE_SIDE = 2000

// Lê uma imagem enviada e reduz fotos grandes (ex.: de celular) para no máximo
// MAX_IMAGE_SIDE px, para o design caber no armazenamento do navegador.
function readImageFile(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height))
      const width = Math.round(img.width * ratio)
      const height = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      const keepAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif'
      resolve({ src: canvas.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', 0.88), width, height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagem inválida'))
    }
    img.src = url
  })
}

interface DownloadsApi {
  save(req: { filename: string; data: Blob }): Promise<{ status: string }>
}
interface ClaudeRuntime {
  use(name: 'downloads'): Promise<DownloadsApi | null>
}

// Publicado no claude.ai, downloads passam pela capacidade "downloads";
// rodando localmente, usa um link de download comum.
async function saveFile(blob: Blob, filename: string): Promise<'saved' | 'unavailable'> {
  const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude
  if (runtime?.use) {
    const downloads = await runtime.use('downloads')
    if (!downloads) return 'unavailable'
    await downloads.save({ filename, data: blob })
    return 'saved'
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'saved'
}

const TYPE_ICON: Record<ElementType, string> = { rect: '▭', ellipse: '◯', triangle: '△', star: '☆', text: 'T', image: '▣' }

const clampInt = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(v) || min)))

function toHex(color?: string) {
  if (!color || color === 'transparent') return '#ffffff'
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#000000'
}

function TemplateThumb({ design }: { design: Design }) {
  const { width, height, background } = design.page
  return (
    <svg className="template-thumb" viewBox={`0 0 ${width} ${height}`} style={{ background }}>
      {design.elements.map((e) => (
        <g key={e.id} transform={`rotate(${e.rotation} ${e.x} ${e.y})`} opacity={e.opacity}>
          <ThumbShape e={e} />
        </g>
      ))}
    </svg>
  )
}

function ThumbShape({ e }: { e: DesignElement }) {
  const p = { fill: e.fill === 'transparent' ? 'none' : e.fill, stroke: e.stroke, strokeWidth: e.strokeWidth }
  if (e.type === 'rect') return <rect x={e.x} y={e.y} width={e.width} height={e.height} rx={e.cornerRadius} {...p} />
  if (e.type === 'ellipse') return <ellipse cx={e.x + e.width / 2} cy={e.y + e.height / 2} rx={e.width / 2} ry={e.height / 2} {...p} />
  if (e.type === 'triangle') return <polygon points={`${e.x + e.width / 2},${e.y} ${e.x + e.width},${e.y + e.height} ${e.x},${e.y + e.height}`} {...p} />
  if (e.type === 'star') return <circle cx={e.x + e.width / 2} cy={e.y + e.height / 2} r={e.width / 3} {...p} />
  if (e.type === 'image') return <image href={e.src} x={e.x} y={e.y} width={e.width} height={e.height} preserveAspectRatio="xMidYMid slice" />
  return (
    <>
      {(e.text ?? '').split('\n').map((line, i) => (
            <text
              key={i}
              x={e.align === 'center' ? e.x + e.width / 2 : e.align === 'right' ? e.x + e.width : e.x}
              y={e.y + (e.fontSize ?? 32) * (e.lineHeight ?? 1.2) * i + (e.fontSize ?? 32) * 0.85}
              fontSize={e.fontSize}
              fontFamily={e.fontFamily}
              fontWeight={e.fontStyle?.includes('bold') ? 700 : 400}
              fontStyle={e.fontStyle?.includes('italic') ? 'italic' : 'normal'}
              textAnchor={e.align === 'center' ? 'middle' : e.align === 'right' ? 'end' : 'start'}
              fill={e.fill}
            >
              {line}
            </text>
      ))}
    </>
  )
}

interface PropertiesProps {
  el: DesignElement
  onChange: (patch: Partial<DesignElement>) => void
  onAlign: (mode: 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom') => void
  onLayer: (dir: 'up' | 'down' | 'top' | 'bottom') => void
  onDuplicate: () => void
  onDelete: () => void
  onReplaceImage: () => void
}

function Properties({ el, onChange, onAlign, onLayer, onDuplicate, onDelete, onReplaceImage }: PropertiesProps) {
  const bold = el.fontStyle?.includes('bold') ?? false
  const italic = el.fontStyle?.includes('italic') ?? false
  const setStyle = (b: boolean, i: boolean) => onChange({ fontStyle: [b && 'bold', i && 'italic'].filter(Boolean).join(' ') || 'normal' })

  return (
    <>
      <h3>
        {el.name}
        {el.locked && <span className="badge">bloqueado</span>}
      </h3>

      {el.type === 'text' && (
        <>
          <label className="field">
            Texto
            <textarea rows={3} value={el.text} onChange={(e) => onChange({ text: e.target.value })} />
          </label>
          <label className="field">
            Fonte
            <select value={el.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })} style={{ fontFamily: el.fontFamily }}>
              {FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              Tamanho
              <input type="number" min={4} max={1000} value={el.fontSize} onChange={(e) => onChange({ fontSize: clampInt(e.target.value, 4, 1000) })} />
            </label>
            <label className="field">
              Entrelinha
              <input type="number" step={0.05} min={0.5} max={3} value={el.lineHeight ?? 1.2} onChange={(e) => onChange({ lineHeight: Number(e.target.value) || 1.2 })} />
            </label>
          </div>
          <div className="btn-row">
            <button className={bold ? 'toggle on' : 'toggle'} onClick={() => setStyle(!bold, italic)} style={{ fontWeight: 700 }}>
              B
            </button>
            <button className={italic ? 'toggle on' : 'toggle'} onClick={() => setStyle(bold, !italic)} style={{ fontStyle: 'italic' }}>
              I
            </button>
            {(['left', 'center', 'right'] as const).map((a) => (
              <button key={a} className={el.align === a ? 'toggle on' : 'toggle'} onClick={() => onChange({ align: a })} title={a}>
                {a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}
              </button>
            ))}
          </div>
        </>
      )}

      {el.type === 'image' && (
        <>
          <button className="primary wide" onClick={onReplaceImage}>
            Trocar foto
          </button>
          <p className="hint">Dica: dois cliques na foto também trocam a imagem.</p>
          <label className="field">
            Cantos arredondados
            <input type="number" min={0} max={2000} value={el.cornerRadius ?? 0} onChange={(e) => onChange({ cornerRadius: clampInt(e.target.value, 0, 2000) })} />
          </label>
        </>
      )}

      {el.type !== 'image' && (
        <div className="field-row">
          <label className="field">
            {el.type === 'text' ? 'Cor' : 'Preenchimento'}
            <input type="color" value={toHex(el.fill)} onChange={(e) => onChange({ fill: e.target.value })} />
          </label>
          {el.type !== 'text' && (
            <label className="field">
              Borda
              <input type="color" value={toHex(el.stroke ?? '#000000')} onChange={(e) => onChange({ stroke: e.target.value, strokeWidth: el.strokeWidth || 4 })} />
            </label>
          )}
        </div>
      )}
      {el.type !== 'text' && el.type !== 'image' && (
        <div className="field-row">
          <label className="field">
            Espessura da borda
            <input type="number" min={0} max={200} value={el.strokeWidth ?? 0} onChange={(e) => onChange({ strokeWidth: clampInt(e.target.value, 0, 200), stroke: el.stroke ?? '#000000' })} />
          </label>
          {el.type === 'rect' && (
            <label className="field">
              Cantos
              <input type="number" min={0} max={2000} value={el.cornerRadius ?? 0} onChange={(e) => onChange({ cornerRadius: clampInt(e.target.value, 0, 2000) })} />
            </label>
          )}
        </div>
      )}
      {el.type !== 'text' && el.type !== 'image' && (
        <button className="link" onClick={() => onChange({ fill: 'transparent' })}>
          Sem preenchimento
        </button>
      )}

      <label className="field">
        Transparência: {Math.round(el.opacity * 100)}%
        <input type="range" min={0} max={1} step={0.01} value={el.opacity} onChange={(e) => onChange({ opacity: Number(e.target.value) })} />
      </label>

      <div className="field-row">
        <label className="field">
          X
          <input type="number" value={Math.round(el.x)} onChange={(e) => onChange({ x: Number(e.target.value) })} />
        </label>
        <label className="field">
          Y
          <input type="number" value={Math.round(el.y)} onChange={(e) => onChange({ y: Number(e.target.value) })} />
        </label>
        <label className="field">
          Giro
          <input type="number" value={Math.round(el.rotation)} onChange={(e) => onChange({ rotation: Number(e.target.value) })} />
        </label>
      </div>

      <h4>Alinhar à página</h4>
      <div className="btn-row">
        <button onClick={() => onAlign('left')} title="Esquerda">⇤</button>
        <button onClick={() => onAlign('hcenter')} title="Centro horizontal">↔</button>
        <button onClick={() => onAlign('right')} title="Direita">⇥</button>
        <button onClick={() => onAlign('top')} title="Topo">⤒</button>
        <button onClick={() => onAlign('vcenter')} title="Meio vertical">↕</button>
        <button onClick={() => onAlign('bottom')} title="Base">⤓</button>
      </div>

      <h4>Posição na pilha</h4>
      <div className="btn-row">
        <button onClick={() => onLayer('top')}>Frente</button>
        <button onClick={() => onLayer('up')}>Avançar</button>
        <button onClick={() => onLayer('down')}>Recuar</button>
        <button onClick={() => onLayer('bottom')}>Trás</button>
      </div>

      <div className="btn-row">
        <button onClick={onDuplicate}>Duplicar</button>
        <button className="danger" onClick={onDelete}>
          Excluir
        </button>
      </div>
    </>
  )
}
