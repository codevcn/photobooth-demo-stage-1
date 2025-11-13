import { TImageSizeInfo } from '@/utils/types/global'
import { domToCanvas } from 'modern-screenshot'
import { useRef } from 'react'

type TUseHtlmToCanvasReturn = {
  editorRef: React.RefObject<HTMLDivElement>
  handleSaveHtmlAsImage: (
    onSaved: (imgDataUrl: string, imageSizeInfo: TImageSizeInfo) => void,
    onError: (error: Error) => void,
    onCanvas: (canvas: HTMLCanvasElement) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtlmToCanvasReturn => {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleSaveHtmlAsImage = async (
    onSaved: (imgDataUrl: string, imageSizeInfo: TImageSizeInfo) => void,
    onError: (error: Error) => void,
    onCanvas: (canvas: HTMLCanvasElement) => void
  ) => {
    requestIdleCallback(async () => {
      const editor = editorRef.current
      if (!editor) return
      try {
        const canvas = await domToCanvas(editor, {
          scale: 6,
          quality: 1,
          type: 'image/webp',
          width: editor.getBoundingClientRect().width,
          height: editor.getBoundingClientRect().height,
        })
        onSaved(canvas.toDataURL('image/webp', 0.95), {
          width: canvas.width,
          height: canvas.height,
        })
        onCanvas(canvas)
        // if (blob) {
        //   onSaved(URL.createObjectURL(blob))
        // }
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  return { editorRef, handleSaveHtmlAsImage }
}
