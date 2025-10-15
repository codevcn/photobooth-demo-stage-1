import React, { useEffect, useMemo } from 'react'
import { X, Check } from 'lucide-react'
import { IProductImage } from '@/utils/types'

interface ColorPickerProps {
  selectedColor: string
  onSelectColor: (color: string, productId: string) => void
  onClose: () => void
  activeProduct: IProductImage
  peerProducts: IProductImage[]
}

type TColor = {
  value: string
  title: string
  productId: string
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  onClose,
  activeProduct,
  peerProducts,
}) => {
  const colors = useMemo<TColor[]>(() => {
    return peerProducts.map((product) => ({ ...product.color, productId: product.id }))
  }, [peerProducts, activeProduct])

  const pickColor = (colorValue: string, productId: string) => {
    onSelectColor(colorValue, productId)
    onClose()
  }

  useEffect(() => {
    if (!selectedColor) onSelectColor(colors[0].value, colors[0].productId)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Chọn màu cho sản phẩm</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {colors.map(({ value, title, productId }) => {
            const isSelected = selectedColor === value
            return (
              <button
                key={value}
                onClick={() => pickColor(value, productId)}
                className="flex flex-col items-center gap-2 touch-target"
              >
                <div
                  className={`w-16 h-16 rounded-full border-4 border-gray-200 transition-all ${
                    isSelected ? 'outline-4 outline outline-primary border-transparent' : ''
                  }`}
                  style={{ backgroundColor: value }}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check size={26} strokeWidth={3} className="text-white drop-shadow-lg" />
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
