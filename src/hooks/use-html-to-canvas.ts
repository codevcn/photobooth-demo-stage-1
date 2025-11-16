import { resizeCanvas } from '@/utils/helpers'
import { TImageSizeInfo } from '@/utils/types/global'
import { domToCanvas } from 'modern-screenshot'

type TUseHtlmToCanvasReturn = {
  saveHtmlAsImage: (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
  saveHtmlAsImageWithDesiredSize: (
    htmlContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtlmToCanvasReturn => {
  const saveHtmlAsImage = async (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const scale: number = 8
      const canvas = await domToCanvas(htmContainer, {
        scale: scale,
        quality: 1,
        type: desiredImgMimeType || 'image/webp',
      })
      canvas.toBlob((blob) => {
        if (blob) {
          onSaved(blob, canvas)
        }
      })
    } catch (error) {
      onError(error as Error)
    }
  }

  const saveHtmlAsImageWithDesiredSize = async (
    htmlContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvasWithDesiredSize: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const maxImageSizeInPx: number = 5000
      const scale: number = maxImageSizeInPx / htmlContainer.getBoundingClientRect().width

      const canvas = await domToCanvas(htmlContainer, {
        scale: scale,
        quality: 1,
        type: desiredImgMimeType || 'image/webp',
      })

      const finalCanvas = resizeCanvas(canvas, desiredOutputWidth, desiredOutputHeight)
      if (!finalCanvas) {
        throw new Error('Failed to resize canvas to desired size')
      }
      canvas.toBlob((blob) => {
        if (blob) {
          onSaved(blob, finalCanvas)
        }
      })
    } catch (error) {
      onError(error as Error)
    }
  }

  return { saveHtmlAsImage, saveHtmlAsImageWithDesiredSize }
}
