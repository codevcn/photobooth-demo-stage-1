import { useMemo, useState } from 'react'
import { ProductDetails } from './ProductDetails'
import { createPortal } from 'react-dom'
import { TBaseProduct, TPrintedImage } from '@/utils/types/global'
import { PrintedImagesPreview } from './PrintedImagesPreview'

type TMenuItem = {
  icon: JSX.Element
  label: string
  onClick: () => void
}

interface BottomMenuProps {
  onAddText: () => void
  onAddSticker: () => void
  onChooseVariant: () => void
  product: TBaseProduct
  printedImages: TPrintedImage[]
  onAddPrintedImages: (newImages: TPrintedImage[]) => void
  onPickTemplate: () => void
}

export const Toolbar: React.FC<BottomMenuProps> = ({
  onAddText,
  onAddSticker,
  onChooseVariant,
  product,
  printedImages,
  onAddPrintedImages,
  onPickTemplate,
}) => {
  const [showProductDetails, setShowProductDetails] = useState(false)

  const menuItems = useMemo<TMenuItem[]>(
    () => [
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-type-icon lucide-type text-pink-cl"
          >
            <path d="M12 4v16" />
            <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
            <path d="M9 20h6" />
          </svg>
        ),
        label: 'Thêm chữ',
        onClick: onAddText,
      },
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sticker-icon lucide-sticker text-pink-cl"
          >
            <path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
            <path d="M15 3v5a1 1 0 0 0 1 1h5" />
            <path d="M8 13h.01" />
            <path d="M16 13h.01" />
            <path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1" />
          </svg>
        ),
        label: 'Thêm sticker',
        onClick: onAddSticker,
      },
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shirt-icon lucide-shirt text-pink-cl"
          >
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          </svg>
        ),
        label: 'Phân loại',
        onClick: onChooseVariant,
      },
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-info-icon lucide-info text-pink-cl"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        ),
        label: 'Chi tiết',
        onClick: () => setShowProductDetails(true),
      },
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grid2x2-icon lucide-grid-2x2 text-pink-cl"
          >
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        ),
        label: 'Khung hình',
        onClick: () => onPickTemplate(),
      },
    ],
    [onAddSticker, onAddText, onChooseVariant, onPickTemplate()]
  )

  return (
    <div className="bg-white mt-2 md:mt-0 rounded-xl shadow-lg p-2 outline outline-1 outline-gray-200">
      <h2 className="text-base text-center md:hidden font-bold text-gray-800 mb-2 lg:mb-3 flex items-center justify-center gap-2">
        Công cụ chỉnh sửa
      </h2>
      <div className="grid grid-cols-5 spmd:grid-cols-1 gap-1">
        <button className="w-full py-2 rounded-xl touch-target transition-colors">
          <PrintedImagesPreview
            printedImages={printedImages}
            onAddPrintedImages={onAddPrintedImages}
          />
        </button>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex flex-col items-center gap-2 py-2 px-2 rounded-xl active:bg-light-pink-cl touch-target transition-colors"
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
              product={product}
            />,
            document.body
          )}
      </div>
    </div>
  )
}
