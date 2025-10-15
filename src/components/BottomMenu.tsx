import React from 'react'
import { Type, Sticker, Palette, Ruler } from 'lucide-react'

interface BottomMenuProps {
  selectedSize: 'S' | 'M' | 'L'
  onAddText: () => void
  onAddSticker: () => void
  onChooseColor: () => void
  onChooseSize: () => void
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  selectedSize,
  onAddText,
  onAddSticker,
  onChooseColor,
  onChooseSize,
}) => {
  const menuItems = [
    { icon: Type, label: 'Thêm chữ', onClick: onAddText },
    { icon: Sticker, label: 'Thêm sticker', onClick: onAddSticker },
    { icon: Palette, label: 'Chọn màu', onClick: onChooseColor },
    { icon: Ruler, label: 'Kích thước', onClick: onChooseSize },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-2">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl active:bg-light-pink-cl touch-target transition-colors"
        >
          <item.icon size={24} className="text-pink-cl" />
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default BottomMenu
