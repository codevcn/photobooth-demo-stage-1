import useDraggable from '@/hooks/use-draggable'
import { IStickerElement } from '@/utils/types'
import { X } from 'lucide-react'

interface StickerElementProps {
  sticker: IStickerElement
  handleRemoveSticker: (id: string) => void
}

export const StickerElement: React.FC<StickerElementProps> = ({ sticker, handleRemoveSticker }) => {
  const { ref, position } = useDraggable()

  return (
    <div
      ref={ref}
      className="absolute group cursor-move translate-x-[-50%] translate-y-[-50%] touch-none"
      style={{ top: position.y, left: position.x }}
    >
      <div className="relative">
        <span
          style={{ height: `${sticker.height}px`, width: `${sticker.width}px` }}
          className="select-none"
        >
          {sticker.emoji}
        </span>
        <button
          onClick={() => handleRemoveSticker(sticker.id)}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-active:opacity-100 transition-opacity touch-target"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
