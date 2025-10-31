import React from 'react'
import { X } from 'lucide-react'

interface StickerPickerProps {
  onAddSticker: (emoji: string) => void
  onClose: () => void
  show: boolean
}

const stickers = [
  { path: '/images/stickers/st-1.png', size: 100 },
  { path: '/images/stickers/st-2.png', size: 100 },
  { path: '/images/stickers/st-3.png', size: 100 },
  { path: '/images/stickers/st-4.png', size: 100 },
  { path: '/images/stickers/st-5.png', size: 100 },
  { path: '/images/stickers/st-6.png', size: 100 },
]

const StickerPicker: React.FC<StickerPickerProps> = ({ onAddSticker, onClose, show }) => {
  const handleSelect = (emoji: string) => {
    onAddSticker(emoji)
    onClose()
  }

  return (
    <div
      style={{ display: show ? 'flex' : 'none' }}
      className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in"
    >
      <div className="flex flex-col items-center bg-white w-full rounded-t-3xl py-4 shadow-2xl max-h-[70vh]">
        <div className="flex items-center w-full sticky top-0 bg-white mb-2 grow px-6">
          <h3 className="text-xl font-bold text-gray-800 w-full">Thêm nhãn dán</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-8 gap-2 overflow-y-auto px-4 w-full">
          {stickers.map(({ path, size }, index) => (
            <button
              key={index}
              onClick={() => handleSelect(path)}
              className="relative h-[150px] w-[150px] aspect-square flex items-center justify-center active:bg-light-pink-cl rounded-xl touch-target transition-colors active:scale-95"
            >
              <img
                src={path}
                alt={`Sticker ${index + 1}`}
                style={{ minWidth: `${size}px`, width: `${size}px` }}
                className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 object-center"
              />
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 text-center mt-2 grow px-6 leading-snug">
          Chạm vào nhãn dán bất kỳ để thêm vào khu vực chỉnh sửa
        </p>
      </div>
    </div>
  )
}

export default StickerPicker
