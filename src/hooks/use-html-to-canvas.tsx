import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/helpers'
import { TProductInCart } from '@/utils/types'

type TUseHtmlToCanvasReturn = {
  editorRef: React.RefObject<HTMLDivElement>
  handleSaveHtmlAsImage: (
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtmlToCanvasReturn => {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleSaveHtmlAsImage = (
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => {
    if (!editorRef.current) return

    html2canvas(editorRef.current, {
      backgroundColor: null,
      scale: 2, // Tăng chất lượng
      useCORS: true, // Cho phép load ảnh cross-origin
      logging: false,
    })
      .then((canvas) => {
        queueMicrotask(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              LocalStorageHelper.saveMockupImageAsBase64(productInfo, url, sessionId)
              onSaved(url)
            }
          }, 'image/png')
        })
      })
      .catch(() => {
        toast.error('Failed to save image. Please try again.')
      })
  }

  return {
    editorRef,
    handleSaveHtmlAsImage,
  }
}
