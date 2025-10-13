import React from 'react'
import { X, Check } from 'lucide-react'

interface SizeSelectorProps {
  selectedSize: 'S' | 'M' | 'L'
  onSelectSize: (size: 'S' | 'M' | 'L') => void
  onClose: () => void
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ selectedSize, onSelectSize, onClose }) => {
  const sizes: Array<{ value: 'S' | 'M' | 'L'; label: string; description: string }> = [
    { value: 'S', label: 'Size S', description: 'Vòng ngực 34-36"' },
    { value: 'M', label: 'Size M', description: 'Vòng ngực 38-40"' },
    { value: 'L', label: 'Size L', description: 'Vòng ngực 42-44"' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Chọn kích thước</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {sizes.map((size) => {
            const isSelected = selectedSize === size.value
            return (
              <button
                key={size.value}
                onClick={() => {
                  onSelectSize(size.value)
                  onClose()
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all touch-target flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-800">{size.label}</p>
                  <p className="text-sm text-gray-500">{size.description}</p>
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
