import { domToCanvas } from 'modern-screenshot'
import { useRef } from 'react'

export const useHtmlToCanvas = () => {
  const editorRef = useRef<HTMLDivElement>(null)

  const handleSaveHtmlAsImage = async (
    onSaved: (imgDataUrl: string) => void,
    onError: (error: Error) => void
  ) => {
    if (!editorRef.current) return

    try {
      const canvas = await domToCanvas(editorRef.current, {
        scale: 4,
        quality: 1,
        type: 'image/webp',
      })
      onSaved(canvas.toDataURL('image/png'))

      // if (blob) {
      //   onSaved(URL.createObjectURL(blob))
      // }
    } catch (error) {
      onError(error as Error)
    }
  }

  return { editorRef, handleSaveHtmlAsImage }
}
