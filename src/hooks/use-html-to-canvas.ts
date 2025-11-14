import { TImageSizeInfo } from '@/utils/types/global'
import { domToCanvas } from 'modern-screenshot'

type TUseHtlmToCanvasReturn = {
  handleSaveHtmlAsImage: (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, imageSizeInfo: TImageSizeInfo, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
  handleSaveHtmlAsImageWithDesiredSize: (
    htmContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgDataUrl: string, imageSizeInfo: TImageSizeInfo, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtlmToCanvasReturn => {
  const handleSaveHtmlAsImage = async (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, imageSizeInfo: TImageSizeInfo, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    requestIdleCallback(async () => {
      try {
        // Scale factor để tạo ảnh chất lượng cao (giảm từ 6 xuống 3 để giảm kích thước file)
        const scale = 6

        const canvas = await domToCanvas(htmContainer, {
          scale: scale,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        })
        canvas.toBlob((blob) => {
          if (blob) {
            onSaved(
              blob,
              {
                width: canvas.width,
                height: canvas.height,
              },
              canvas
            )
          }
        })
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  const handleSaveHtmlAsImageWithDesiredSize = (
    htmContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgDataUrl: string, imageSizeInfo: TImageSizeInfo, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    requestIdleCallback(async () => {
      try {
        // Scale factor để tạo ảnh chất lượng cao
        const scale = 6

        const canvas = await domToCanvas(htmContainer, {
          scale: scale,
          quality: 0.95,
          type: 'image/webp',
        })

        const finalCanvas = document.createElement('canvas')
        finalCanvas.width = desiredOutputWidth
        finalCanvas.height = desiredOutputHeight

        // Vẽ lại ảnh đã capture vào canvas mới với kích thước mong muốn
        const ctx = finalCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, desiredOutputWidth, desiredOutputHeight)
        }

        // canvas.width === desiredOutputWidth
        // canvas.height === desiredOutputHeight
        onSaved(
          finalCanvas.toDataURL(desiredImgMimeType || 'image/webp', 0.95),
          {
            width: finalCanvas.width,
            height: finalCanvas.height,
          },
          finalCanvas
        )
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  return { handleSaveHtmlAsImage, handleSaveHtmlAsImageWithDesiredSize }
}
