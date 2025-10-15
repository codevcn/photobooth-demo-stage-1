import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/helpers'

type TUseHtmlToCanvasReturn = {
  editorRef: React.RefObject<HTMLDivElement>
  handleSaveHtmlAsImage: (productId: string) => Promise<void>
}

export const useHtmlToCanvas = (): TUseHtmlToCanvasReturn => {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleSaveHtmlAsImage = async (productId: string) => {
    if (!editorRef.current) return

    try {
      const canvas = await html2canvas(editorRef.current, {
        backgroundColor: null,
        scale: 2, // Tăng chất lượng
        useCORS: true, // Cho phép load ảnh cross-origin
        logging: false,
      })

      // Chuyển canvas thành base64 và lưu vào localStorage
      queueMicrotask(() => {
        LocalStorageHelper.saveMockupImageAsBase64(productId, canvas.toDataURL('image/png'))
      })
    } catch (error) {
      toast.error('Failed to save image. Please try again.')
    }
  }

  return {
    editorRef,
    handleSaveHtmlAsImage,
  }
}
