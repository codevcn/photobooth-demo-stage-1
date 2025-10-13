import React from 'react'
import { X, Check } from 'lucide-react'

interface ColorPickerProps {
  selectedColor: string
  onSelectColor: (color: string) => void
  onClose: () => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor, onClose }) => {
  const colors = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#1E3A8A' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Purple', value: '#9333EA' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Pink', value: '#EC4899' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Chọn màu cho sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {colors.map((color) => {
            const isSelected = selectedColor === color.value
            return (
              <button
                key={color.value}
                onClick={() => {
                  onSelectColor(color.value)
                  onClose()
                }}
                className="flex flex-col items-center gap-2 touch-target"
              >
                <div
                  className={`w-16 h-16 rounded-full shadow-lg border-4 transition-all ${
                    isSelected ? 'border-primary scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check size={24} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">{color.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
