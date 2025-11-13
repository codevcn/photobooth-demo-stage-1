import { useMemo, useState } from 'react'
import { Type, Sticker, Palette, Ruler, Info } from 'lucide-react'
import { ProductDetails } from './ProductDetails'
import { createPortal } from 'react-dom'
import { TProductImage } from '@/utils/types/global'

interface BottomMenuProps {
  onAddText: () => void
  onAddSticker: () => void
  onChooseColor: () => void
  onChooseSize: () => void
  activeProduct: TProductImage
  peerProducts: TProductImage[]
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  onAddText,
  onAddSticker,
  onChooseColor,
  onChooseSize,
  activeProduct,
  peerProducts,
}) => {
  const [showProductDetails, setShowProductDetails] = useState(false)

  const menuItems = useMemo(
    () => [
      {
        icon: <Type size={24} className="text-pink-cl" />,
        label: 'Thêm chữ',
        onClick: onAddText,
      },
      {
        icon: <Sticker size={24} className="text-pink-cl" />,
        label: 'Thêm sticker',
        onClick: onAddSticker,
      },
      {
        icon: <Palette size={24} className="text-pink-cl" />,
        label: 'Chọn màu',
        onClick: onChooseColor,
      },
      {
        icon: <Ruler size={24} className="text-pink-cl" />,
        label: 'Kích thước',
        onClick: onChooseSize,
      },
      {
        icon: <Info size={24} className="text-pink-cl" />,
        label: 'Chi tiết',
        onClick: () => setShowProductDetails(true),
      },
    ],
    [onAddSticker, onAddText]
  )

  return (
    <div className="grid grid-cols-5 gap-1 px-4 py-2">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl active:bg-light-pink-cl touch-target transition-colors"
        >
          {item.icon}
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
            {item.label}
          </span>
        </button>
      ))}

      {showProductDetails &&
        createPortal(
          <ProductDetails
            show={showProductDetails}
            onHideShow={setShowProductDetails}
            productDetails={activeProduct}
            peerProducts={peerProducts}
          />,
          document.body
        )}
    </div>
  )
}

export default BottomMenu
