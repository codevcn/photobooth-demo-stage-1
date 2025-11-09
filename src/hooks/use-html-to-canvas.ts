import { domToCanvas } from 'modern-screenshot'
import { useRef } from 'react'

export const useHtmlToCanvas = () => {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleSaveHtmlAsImage = async (
    onSaved: (imgDataUrl: string) => void,
    onError: (error: Error) => void,
    onCanvas: (canvas: HTMLCanvasElement) => void
  ) => {
    requestIdleCallback(async () => {
      const editor = editorRef.current
      if (!editor) return
      try {
        const canvas = await domToCanvas(editor, {
          scale: 3,
          quality: 1,
          type: 'image/webp',
          width: editor.getBoundingClientRect().width,
          height: editor.getBoundingClientRect().height,
        })
        onSaved(canvas.toDataURL('image/webp', 0.95))
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
