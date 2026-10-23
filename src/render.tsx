import { createRoot } from 'react-dom/client'
import { Stage, Layer, Rect, Group } from 'react-konva'
import type Konva from 'konva'
import { Shape, preloadImages } from './Canvas'
import type { Design } from './types'

// Desenha um design fora da tela, no tamanho real, e devolve o PNG.
// Usa o mesmo Shape do editor, então a arte sai igual à da tela.
export async function renderDesign(design: Design, scale = 1): Promise<Blob> {
  const visible = design.elements.filter((e) => !e.hidden)
  const families = new Set(visible.filter((e) => e.type === 'text').map((e) => `${e.fontStyle ?? 'normal'} 32px "${e.fontFamily}"`))
  await Promise.all([
    preloadImages(visible.filter((e) => e.type === 'image' && e.src).map((e) => e.src!)),
    ...[...families].map((f) => document.fonts?.load(f).catch(() => undefined)),
  ])

  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none'
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    const stage = await new Promise<Konva.Stage>((resolve) => {
      const { width, height, background } = design.page
      root.render(
        <Stage
          width={width * scale}
          height={height * scale}
          scaleX={scale}
          scaleY={scale}
          ref={(s) => {
            if (s) requestAnimationFrame(() => requestAnimationFrame(() => resolve(s)))
          }}
        >
          <Layer>
            <Rect width={width} height={height} fill={background} />
            {visible.map((el) => (
              <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation} opacity={el.opacity}>
                <Shape el={el} />
              </Group>
            ))}
          </Layer>
        </Stage>,
      )
    })
    stage.draw()
    return await new Promise<Blob>((resolve, reject) =>
      stage.toBlob({ mimeType: 'image/png', callback: (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar a imagem'))) }),
    )
  } finally {
    root.unmount()
    host.remove()
  }
}
