import React from 'react'
import { X, Check } from 'lucide-react'
import { TProductSize } from '@/utils/types'

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
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">Chọn kích thước</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
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
