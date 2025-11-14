import React, { useEffect, useMemo, useState } from 'react'
import { TBaseProduct, TProductSize } from '@/utils/types/global'
import { cn } from '@/lib/utils'

type TCheckIconProps = {
  size?: number
  strokeWidth?: number
  className?: string
}

const CheckIcon = ({
  size = 24,
  strokeWidth = 3,
  className = 'text-white drop-shadow-lg',
}: TCheckIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-check-icon lucide-check', className)}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

interface ProductVariantPickerProps {
  selectedColor: string
  selectedSize: TProductSize
  onSelectVariant: (color: string, size: TProductSize, productImageId: number) => void
  onClose: () => void
  product: TBaseProduct
}

type TColorOption = {
  value: string
  title: string
  availableSizes: Set<TProductSize>
}

const ProductVariantPicker: React.FC<ProductVariantPickerProps> = ({
  selectedColor,
  selectedSize,
  onSelectVariant,
  onClose,
  product,
}) => {
  const [tempColor, setTempColor] = useState<string>(selectedColor)
  const [tempSize, setTempSize] = useState<TProductSize>(selectedSize)

  // Build color options với available sizes
  const colorOptions = useMemo<TColorOption[]>(() => {
    const colorMap = new Map<string, TColorOption>()

    for (const image of product.images) {
      if (!colorMap.has(image.color.value)) {
        colorMap.set(image.color.value, {
          value: image.color.value,
          title: image.color.title,
          availableSizes: new Set(),
        })
      }
      colorMap.get(image.color.value)!.availableSizes.add(image.size)
    }

    return Array.from(colorMap.values())
  }, [product])

  // Build tất cả size options (không phụ thuộc color)
  const allSizes = useMemo<TProductSize[]>(() => {
    const sizeSet = new Set<TProductSize>()
    for (const image of product.images) {
      sizeSet.add(image.size)
    }
    return Array.from(sizeSet)
  }, [product])

  // Kiểm tra size có available với color đang chọn không
  const isSizeAvailable = (size: TProductSize): boolean => {
    const colorOption = colorOptions.find((c) => c.value === tempColor)
    return colorOption ? colorOption.availableSizes.has(size) : false
  }

  const handleSelectColor = (colorValue: string) => {
    setTempColor(colorValue)

    // Tự động chọn size available đầu tiên cho color mới
    const colorOption = colorOptions.find((c) => c.value === colorValue)
    if (colorOption) {
      const availableSizes = Array.from(colorOption.availableSizes)
      // Nếu size hiện tại không có trong color mới, chọn size đầu tiên
      if (!colorOption.availableSizes.has(tempSize) && availableSizes.length > 0) {
        setTempSize(availableSizes[0])
      }
    }
  }

  const handleSelectSize = (size: TProductSize) => {
    setTempSize(size)
  }

  const handleConfirm = () => {
    // Tìm productImageId tương ứng với color và size đã chọn
    const matchedImage = product.images.find(
      (img) => img.color.value === tempColor && img.size === tempSize
    )

    if (matchedImage) {
      onSelectVariant(tempColor, tempSize, matchedImage.id)
      onClose()
    }
  }

  // Reset temp values khi modal mở
  useEffect(() => {
    setTempColor(selectedColor)
    setTempSize(selectedSize)
  }, [selectedColor, selectedSize])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full max-w-md rounded-xl p-3 shadow-2xl relative z-20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-800">Chọn phân loại</h3>
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
              className="lucide lucide-x-icon lucide-x text-gray-700"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Màu sắc</h4>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map(({ value, title }) => {
              const isSelected = tempColor === value

              return (
                <button
                  key={value}
                  onClick={() => handleSelectColor(value)}
                  className="flex flex-col items-center gap-2 touch-target transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-full border-4 transition-all ${
                      isSelected
                        ? 'border-pink-cl outline outline-4 outline-pink-200'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: value }}
                  >
                    {isSelected && (
                      <div className="w-full h-full flex items-center justify-center">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Size Selection - Hiển thị tất cả size, làm mờ những không available */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Kích thước</h4>
          <div className="grid grid-cols-3 gap-2">
            {allSizes.map((size) => {
              const isSelected = tempSize === size
              const isAvailable = isSizeAvailable(size)

              return (
                <button
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 border-gray-200 rounded-xl border-2 transition-all touch-target flex items-center justify-between ${
                    isSelected
                      ? 'border-pink-cl bg-pink-50'
                      : isAvailable
                      ? 'hover:border-gray-300'
                      : 'bg-gray-50 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <p className="font-bold text-lg text-gray-800">{size}</p>
                  {isSelected && (
                    <div className="bg-pink-cl text-white rounded-full p-1">
                      <CheckIcon size={16} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full bg-pink-cl text-white font-bold py-2 rounded-xl active:scale-95 transition touch-target"
        >
          Xác nhận
        </button>
      </div>
    </div>
  )
}

export default ProductVariantPicker
