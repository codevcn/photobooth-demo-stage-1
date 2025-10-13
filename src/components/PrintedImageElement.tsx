import useDraggable from '@/hooks/use-draggable'
import { cn } from '@/lib/utils'
import { getNaturalSizeOfImage } from '@/utils/helpers'
import { IPrintedImage } from '@/utils/types'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface PrintedImageElementProps {
  imgEl: IPrintedImage
  handleRemovePrintedImage: (id: string) => void
  editAreaRef: React.RefObject<HTMLDivElement>
}

export const PrintedImageElement = ({
  imgEl,
  handleRemovePrintedImage,
  editAreaRef,
}: PrintedImageElementProps) => {
  const { ref, position } = useDraggable()
  const { url, height, width, id } = imgEl

  useEffect(() => {
    getNaturalSizeOfImage(
      url,
      (width, height) => {
        const imgEle = editAreaRef.current?.querySelector<HTMLImageElement>(
          `.NAME-image-box[data-img-box-id='${id}'] img`
        )
        if (imgEle) {
          imgEle.style.cssText = `width: ${width}px; height: ${height}px;`
        }
      },
      (err) => {}
    )
  }, [url])

  return (
    <div
      ref={ref}
      style={{
        left: position.x,
        top: position.y,
      }}
      data-img-box-id={id}
      className={cn(
        'NAME-image-box absolute max-w-[300px] max-h-[100px] cursor-move select-none touch-none rounded-lg overflow-hidden shadow-lg border-2 border-white'
      )}
    >
      <div>
        <img src={url || '/placeholder.svg'} alt="Overlay" className="object-cover" />
      </div>
      <button
        onClick={() => handleRemovePrintedImage(id)}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-active:opacity-100 transition-opacity touch-target"
      >
        <X size={12} />
      </button>
    </div>
  )
}
