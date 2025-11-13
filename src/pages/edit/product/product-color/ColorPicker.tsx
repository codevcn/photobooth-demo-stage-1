import React, { useEffect, useMemo } from 'react'
import { TBaseProduct, TProductSize } from '@/utils/types/global'

interface ColorPickerProps {
  selectedColor: string
  selectedSize: TProductSize
  onSelectColor: (color: string, productImageId: number) => void
  onClose: () => void
  product: TBaseProduct
}

type TColor = {
  value: string
  title: string
  productImageId: number
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  selectedSize,
  onSelectColor,
  onClose,
  product,
}) => {
  // Chỉ lấy colors có sẵn cho size đang chọn
  const colors = useMemo<TColor[]>(() => {
    const uniqueColors = new Map<string, TColor>()
    for (const image of product.images) {
      if (image.size === selectedSize && !uniqueColors.has(image.color.value)) {
        uniqueColors.set(image.color.value, {
          ...image.color,
          productImageId: image.id,
        })
      }
    }
    return Array.from(uniqueColors.values())
  }, [product, selectedSize])

  const pickColor = (colorValue: string, productImageId: number) => {
    onSelectColor(colorValue, productImageId)
    onClose()
  }

  useEffect(() => {
    // Auto-select first available color if current selection is not available
    if (colors.length > 0) {
      const currentColorAvailable = colors.some((c) => c.value === selectedColor)
      if (!currentColorAvailable) {
        onSelectColor(colors[0].value, colors[0].productImageId)
      }
    }
  }, [colors, selectedColor])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full rounded-xl p-4 shadow-2xl relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Chọn màu cho sản phẩm</h3>
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

        <div className="grid grid-cols-4 gap-3 overflow-y-auto p-2">
          {colors.map(({ value, title, productImageId }) => {
            const isSelected = selectedColor === value
            return (
              <button
                key={value}
                onClick={() => pickColor(value, productImageId)}
                className="flex flex-col items-center gap-2 touch-target"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-gray-200 transition-all ${
                    isSelected ? 'outline-4 outline outline-primary border-transparent' : ''
                  }`}
                  style={{ backgroundColor: value }}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check-icon lucide-check text-pink-cl"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">{title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
