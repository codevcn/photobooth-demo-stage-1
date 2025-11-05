import React from 'react'

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
      className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4"
    >
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="flex flex-col items-center bg-white w-full rounded-xl py-4 shadow-xl max-h-[80vh] relative z-20">
        <div className="flex items-center w-full sticky top-0 bg-white mb-2 grow px-6">
          <h3 className="text-xl font-bold text-gray-800 w-full">Thêm nhãn dán</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x text-black"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
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
      </div>
    </div>
  )
}

export default StickerPicker
