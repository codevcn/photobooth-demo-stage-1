import { IProductImage } from '@/utils/types'
import React, { useMemo } from 'react'

interface ProductGalleryProps {
  galleryImages: IProductImage[][]
  activeImageId: string
  onSelectImage: (id: string) => void
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  galleryImages,
  activeImageId,
  onSelectImage,
}) => {
  const productsToRender = useMemo(() => {
    return galleryImages.map((group) => group.find((img) => img.id === activeImageId) || group[0])
  }, [galleryImages, activeImageId])

  return (
    <div>
      <h2 className="text-sm text-center font-semibold text-gray-700 mb-3 px-1">
        Chọn sản phẩm muốn lưu giữ kỷ niệm
      </h2>
      <div className="flex gap-3 overflow-x-auto gallery-scroll p-2">
        {productsToRender.map((image) => {
          const isActive = image.id === activeImageId
          return (
            <button
              key={image.id}
              onClick={() => onSelectImage(image.id)}
              className={`flex-shrink-0 touch-target ${
                isActive ? 'ring-4 ring-pink-cl ring-offset-2' : 'ring-2 ring-gray-200'
              } rounded-xl overflow-hidden transition-all duration-200`}
            >
              <img src={image.url} alt={image.name} className="w-20 h-20 object-cover" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductGallery
