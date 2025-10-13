import useDraggable from '@/hooks/use-draggable'
import { ITextElement } from '@/utils/types'
import { X } from 'lucide-react'

interface TextElementProps {
  textEl: ITextElement
  handleRemoveText: (id: string) => void
}

export const TextElement: React.FC<TextElementProps> = ({ textEl, handleRemoveText }) => {
  const { ref, position } = useDraggable()

  return (
    <div
      ref={ref}
      className="absolute group cursor-move translate-x-[-50%] translate-y-[-50%] touch-none"
      style={{ top: position.y, left: position.x }}
    >
      <div className="relative">
        <p
          style={{
            fontSize: `${textEl.fontSize}px`,
            color: textEl.color,
          }}
          className="font-bold whitespace-nowrap select-none"
        >
          {textEl.text}
        </p>
        <button
          onClick={() => handleRemoveText(textEl.id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-active:opacity-100 transition-opacity touch-target"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
