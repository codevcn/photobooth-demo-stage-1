import { IPrintedImage, IProductImage } from '@/utils/types'
import { ArrowLeft } from 'lucide-react'
import React, { useMemo } from 'react'

interface ProductGalleryProps {
  galleryImages: IProductImage[][]
  activeImageId: string
  onSelectImage: (id: string) => void
  printedImages: IPrintedImage[]
}

const countForTraditional: number = 5
const countForTrending: number = 2

const ProductGallery: React.FC<ProductGalleryProps> = ({
  galleryImages,
  activeImageId,
  onSelectImage,
  printedImages,
}) => {
  const productsToRender = useMemo(() => {
    return galleryImages.slice(0, countForTraditional).map((group) => {
      return {
        ...(group.find((img) => img.id === activeImageId) || group[0]),
        printedImageUrl: printedImages[0].url || '/placeholder.svg',
      }
    })
  }, [galleryImages, activeImageId])

  const trendingToRender = useMemo(() => {
    return galleryImages
      .slice(countForTraditional, countForTraditional + countForTrending)
      .map((group) => {
        return {
          ...(group.find((img) => img.id === activeImageId) || group[0]),
          printedImageUrl: printedImages[0].url || '/placeholder.svg',
        }
      })
  }, [galleryImages, activeImageId])

  return (
    <div>
      <h2 className="text-sm text-center font-semibold text-gray-700 mb-3 px-1">
        Chọn sản phẩm muốn lưu giữ kỷ niệm
      </h2>
      <div className="flex gap-3 overflow-x-scroll p-2 pb-3">
        {productsToRender.map((image) => {
          const isActive = image.id === activeImageId
          return (
            <button
              key={image.id}
              onClick={() => onSelectImage(image.id)}
              className={`flex-shrink-0 touch-target relative rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-4 ring-pink-cl ring-offset-2' : 'ring-2 ring-gray-200'
              }`}
            >
              <span className="block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-max w-1/2 pointer-events-none">
                <img
                  src={image.printedImageUrl || '/placeholder.svg'}
                  alt="Overlay"
                  className="h-full w-full"
                />
              </span>
              <img src={image.url} alt={image.name} className="w-20 h-20 object-cover" />
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 overflow-x-auto gallery-scroll p-2 mt-2 rounded-lg">
        {trendingToRender.map((image) => {
          const isActive = image.id === activeImageId
          return (
            <button
              key={image.id}
              onClick={() => onSelectImage(image.id)}
              className={`flex-shrink-0 touch-target relative rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-4 ring-pink-cl ring-offset-2' : 'ring-2 ring-gray-200'
              }`}
            >
              <span className="block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-max w-1/2 pointer-events-none">
                <img
                  src={image.printedImageUrl || '/placeholder.svg'}
                  alt="Overlay"
                  className="h-full w-full"
                />
              </span>
              <img src={image.url} alt={image.name} className="w-20 h-20 object-cover" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductGallery
