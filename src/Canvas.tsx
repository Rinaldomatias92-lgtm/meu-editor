import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Ellipse, Line, Star, Text, Image as KImage, Group, Transformer } from 'react-konva'
import Konva from 'konva'
import type { Design, DesignElement } from './types'

interface Guide {
  orientation: 'V' | 'H'
  pos: number
}

interface CanvasProps {
  design: Design
  scale: number
  selectedId: string | null
  fontsVersion: number
  stageRef: React.RefObject<Konva.Stage | null>
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<DesignElement>) => void
  onReplaceImage: (id: string) => void
}

const SNAP_PX = 6

// Imagens já carregadas, por src: permite desenhar na hora quando já estão em cache
const imageCache = new Map<string, HTMLImageElement>()

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve) => {
    const i = new window.Image()
    i.onload = () => {
      imageCache.set(src, i)
      resolve(i)
    }
    i.onerror = () => resolve(i)
    i.src = src
  })
}

export const preloadImages = (srcs: string[]) => Promise.all(srcs.map(loadImage)).then(() => undefined)

function useHtmlImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement | undefined>(() => (src ? imageCache.get(src) : undefined))
  useEffect(() => {
    if (!src) return
    let alive = true
    loadImage(src).then((i) => alive && setImg(i))
    return () => {
      alive = false
    }
  }, [src])
  return img
}

// Preenche a caixa sem distorcer: recorta o excesso da foto, centralizado.
// Com fit "contain" (logos), a imagem cabe inteira, centralizada na caixa.
function ImageShape({ el }: { el: DesignElement }) {
  const img = useHtmlImage(el.src)
  if (el.fit === 'contain' && img && img.width && img.height) {
    const scale = Math.min(el.width / img.width, el.height / img.height)
    const w = img.width * scale
    const h = img.height * scale
    return (
      <>
        <Rect width={el.width} height={el.height} fill="transparent" />
        <KImage image={img} x={(el.width - w) / 2} y={(el.height - h) / 2} width={w} height={h} />
      </>
    )
  }
  let crop
  if (img && img.width && img.height) {
    const scale = Math.max(el.width / img.width, el.height / img.height)
    const cw = el.width / scale
    const ch = el.height / scale
    crop = { x: (img.width - cw) / 2, y: (img.height - ch) / 2, width: cw, height: ch }
  }
  return <KImage image={img} width={el.width} height={el.height} crop={crop} cornerRadius={el.cornerRadius ?? 0} />
}

// Textos ligados à ficha mudam de tamanho conforme os dados: a fonte diminui
// (até a metade) para o texto caber na altura reservada pelo modelo.
let measurer: Konva.Text | null = null
function fitFontSize(el: DesignElement) {
  const max = el.fontSize ?? 32
  measurer ??= new Konva.Text({})
  measurer.setAttrs({
    text: el.text,
    width: el.width,
    fontFamily: el.fontFamily,
    fontStyle: el.fontStyle,
    lineHeight: el.lineHeight ?? 1.2,
  })
  let size = max
  while (size > max / 2) {
    measurer.fontSize(size)
    if (measurer.height() <= el.height + 1) break
    size = Math.floor(size * 0.94)
  }
  return size
}

export function Shape({ el }: { el: DesignElement }) {
  const { width: w, height: h } = el
  const paint = { fill: el.fill, stroke: el.stroke, strokeWidth: el.stroke ? el.strokeWidth ?? 0 : 0 }
  switch (el.type) {
    case 'rect':
      return <Rect width={w} height={h} cornerRadius={el.cornerRadius ?? 0} {...paint} />
    case 'ellipse':
      return <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} {...paint} />
    case 'triangle':
      return <Line points={[w / 2, 0, w, h, 0, h]} closed {...paint} />
    case 'star':
      return <Star x={w / 2} y={h / 2} numPoints={5} innerRadius={w * 0.2} outerRadius={w / 2} scaleY={h / w} {...paint} />
    case 'text':
      return (
        <Text
          width={w}
          text={el.text}
          fontSize={el.textTemplate ? fitFontSize(el) : el.fontSize}
          fontFamily={el.fontFamily}
          fontStyle={el.fontStyle}
          align={el.align}
          lineHeight={el.lineHeight ?? 1.2}
          fill={el.fill}
        />
      )
    case 'image':
      return <ImageShape el={el} />
  }
}

export default function Canvas({ design, scale, selectedId, fontsVersion, stageRef, onSelect, onChange, onReplaceImage }: CanvasProps) {
  const { page, elements } = design
  const trRef = useRef<Konva.Transformer>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [editing, setEditing] = useState<DesignElement | null>(null)

  const selected = elements.find((e) => e.id === selectedId)

  // Liga o Transformer ao elemento selecionado
  useEffect(() => {
    const tr = trRef.current
    const stage = stageRef.current
    if (!tr || !stage) return
    const node = selected && !selected.locked && !selected.hidden && editing?.id !== selected.id ? stage.findOne('#' + selected.id) : null
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selected, editing, elements, fontsVersion, stageRef])

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    const layer = layerRef.current
    if (!layer) return
    const box = node.getClientRect({ relativeTo: layer })
    const vTargets = [0, page.width / 2, page.width]
    const hTargets = [0, page.height / 2, page.height]
    layer.find('.element').forEach((other) => {
      if (other === node || !other.visible()) return
      const r = other.getClientRect({ relativeTo: layer })
      vTargets.push(r.x, r.x + r.width / 2, r.x + r.width)
      hTargets.push(r.y, r.y + r.height / 2, r.y + r.height)
    })
    const threshold = SNAP_PX / scale
    const snap = (edges: number[], targets: number[]) => {
      let best: { diff: number; pos: number } | null = null
      for (const edge of edges)
        for (const t of targets) {
          const diff = t - edge
          if (Math.abs(diff) < threshold && (!best || Math.abs(diff) < Math.abs(best.diff))) best = { diff, pos: t }
        }
      return best
    }
    const v = snap([box.x, box.x + box.width / 2, box.x + box.width], vTargets)
    const h = snap([box.y, box.y + box.height / 2, box.y + box.height], hTargets)
    const next: Guide[] = []
    if (v) {
      node.x(node.x() + v.diff)
      next.push({ orientation: 'V', pos: v.pos })
    }
    if (h) {
      node.y(node.y() + h.diff)
      next.push({ orientation: 'H', pos: h.pos })
    }
    setGuides(next)
  }

  const handleTransformEnd = (el: DesignElement, node: Konva.Node) => {
    const sx = node.scaleX()
    const sy = node.scaleY()
    node.scale({ x: 1, y: 1 })
    const patch: Partial<DesignElement> = { x: node.x(), y: node.y(), rotation: node.rotation() }
    if (el.type === 'text') {
      patch.width = Math.max(20, el.width * sx)
      if (Math.abs(sy - 1) > 0.001) patch.fontSize = Math.max(4, Math.round((el.fontSize ?? 32) * sy))
    } else {
      patch.width = Math.max(5, el.width * sx)
      patch.height = Math.max(5, el.height * sy)
    }
    onChange(el.id, patch)
  }

  const startEditing = (el: DesignElement) => {
    if (el.locked) return
    if (el.type === 'image') {
      onSelect(el.id)
      onReplaceImage(el.id)
      return
    }
    if (el.type !== 'text') return
    onSelect(el.id)
    setEditing(el)
  }

  const finishEditing = (value: string) => {
    if (editing && value !== editing.text) onChange(editing.id, { text: value })
    setEditing(null)
  }

  const deselectOnEmpty = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const t = e.target
    if (t === t.getStage() || t.name() === 'background') onSelect(null)
  }

  return (
    <div className="stage-wrap" style={{ width: page.width * scale, height: page.height * scale }}>
      <Stage
        ref={stageRef}
        width={page.width * scale}
        height={page.height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={deselectOnEmpty}
        onTouchStart={deselectOnEmpty}
      >
        <Layer ref={layerRef}>
          <Rect name="background" width={page.width} height={page.height} fill={page.background} />
          {elements.map((el) => (
            <Group
              key={el.type === 'text' ? `${el.id}_${fontsVersion}` : el.id}
              id={el.id}
              name="element"
              x={el.x}
              y={el.y}
              rotation={el.rotation}
              opacity={editing?.id === el.id ? 0 : el.opacity}
              visible={!el.hidden}
              draggable={!el.locked}
              listening={!el.hidden}
              onMouseDown={() => onSelect(el.id)}
              onTap={() => onSelect(el.id)}
              onDblClick={() => startEditing(el)}
              onDblTap={() => startEditing(el)}
              onDragMove={handleDragMove}
              onDragEnd={(e) => {
                setGuides([])
                onChange(el.id, { x: e.target.x(), y: e.target.y() })
              }}
              onTransformEnd={(e) => handleTransformEnd(el, e.target)}
            >
              <Shape el={el} />
            </Group>
          ))}
        </Layer>
        <Layer name="ui">
          <Transformer
            ref={trRef}
            name="ui-transformer"
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            anchorSize={10}
            anchorCornerRadius={5}
            borderStroke="#8b3dff"
            anchorStroke="#8b3dff"
            keepRatio={selected?.type === 'image'}
            enabledAnchors={
              selected?.type === 'text'
                ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']
                : undefined
            }
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
          />
          {guides.map((g, i) => (
            <Line
              key={i}
              points={g.orientation === 'V' ? [g.pos, -10000, g.pos, 10000] : [-10000, g.pos, 10000, g.pos]}
              stroke="#ff2fb3"
              strokeWidth={1 / scale}
              dash={[4 / scale, 4 / scale]}
              listening={false}
            />
          ))}
        </Layer>
      </Stage>
      {editing && (
        <textarea
          className="text-editor"
          autoFocus
          defaultValue={editing.text}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => finishEditing(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.currentTarget.blur()
            e.stopPropagation()
          }}
          style={{
            left: editing.x * scale,
            top: editing.y * scale,
            width: editing.width * scale,
            minHeight: (editing.fontSize ?? 32) * (editing.lineHeight ?? 1.2) * scale,
            fontSize: (editing.fontSize ?? 32) * scale,
            fontFamily: editing.fontFamily,
            fontWeight: editing.fontStyle?.includes('bold') ? 700 : 400,
            fontStyle: editing.fontStyle?.includes('italic') ? 'italic' : 'normal',
            lineHeight: editing.lineHeight ?? 1.2,
            textAlign: editing.align,
            color: editing.fill,
            transform: `rotate(${editing.rotation}deg)`,
          }}
        />
      )}
    </div>
  )
}
