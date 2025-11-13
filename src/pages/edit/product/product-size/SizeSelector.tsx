import React from 'react'
import { Check } from 'lucide-react'
import { TProductSize } from '@/utils/types/global'

interface SizeSelectorProps {
  selectedSize: TProductSize
  onSelectSize: (size: TProductSize) => void
  onClose: () => void
  sizes: TProductSize[]
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  selectedSize,
  onSelectSize,
  onClose,
  sizes,
}) => {
  const handlePickSize = (size: TProductSize) => {
    onSelectSize(size)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full rounded-xl p-4 shadow-2xl relative z-20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">Chọn kích thước cho sản phẩm</h3>
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

        <div className="grid grid-cols-3 gap-2 mt-4">
          {sizes.map((size) => {
            const isSelected = selectedSize === size
            return (
              <button
                key={size}
                onClick={() => handlePickSize(size)}
                className={`w-full px-4 py-2 rounded-xl border-2 transition-all touch-target flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-800">{size}</p>
                </div>
                {isSelected && (
                  <div className="bg-primary text-white rounded-full p-1">
                    <Check size={20} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SizeSelector
