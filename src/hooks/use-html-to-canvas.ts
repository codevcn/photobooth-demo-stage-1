import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/localstorage'
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
    // Sử dụng requestIdleCallback để không block UI
    const processImage = () => {
      if (!editorRef.current) return

      html2canvas(editorRef.current, {
        backgroundColor: null,
        scale: 2, // Tăng chất lượng
        useCORS: true, // Cho phép load ảnh cross-origin
        logging: false,
        allowTaint: false, // Ngăn chặn tainted canvas
        foreignObjectRendering: false, // Tăng hiệu suất
        imageTimeout: 10000, // Timeout cho việc load image
        removeContainer: true, // Cleanup sau khi render
        windowWidth: editorRef.current.scrollWidth,
        windowHeight: editorRef.current.scrollHeight,
      })
        .then((canvas) => {
          // Tách việc convert blob thành task riêng
          requestIdleCallback(() => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  // Tách việc save localStorage thành task riêng
                  requestIdleCallback(() => {
                    LocalStorageHelper.saveMockupImageAsBase64(productInfo, url, sessionId)
                    onSaved(url)
                  })
                }
              },
              'image/png',
              1
            )
          })
        })
        .catch(() => {
          toast.error('Failed to save image. Please try again.')
        })
    }

    // Đảm bảo DOM đã render xong
    queueMicrotask(() => {
      if (typeof window.requestIdleCallback === 'function') {
        requestIdleCallback(processImage, { timeout: 5000 })
      } else {
        // Fallback cho browsers không support requestIdleCallback
        setTimeout(processImage, 0)
      }
    })
  }

  return {
    editorRef,
    handleSaveHtmlAsImage,
  }
}
