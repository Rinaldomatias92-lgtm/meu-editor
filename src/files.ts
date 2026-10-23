const MAX_IMAGE_SIDE = 2000

// Lê uma imagem enviada e reduz fotos grandes (ex.: de celular) para no máximo
// MAX_IMAGE_SIDE px, para o design caber no armazenamento do navegador.
export function readImageFile(file: File): Promise<{ src: string; width: number; height: number }> {
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
export async function saveFile(blob: Blob, filename: string): Promise<'saved' | 'unavailable'> {
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
