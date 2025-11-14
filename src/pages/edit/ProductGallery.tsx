import { TBaseProduct, TPrintedImage, TProductImage } from '@/utils/types/global'
import { useEffect, useMemo, useState } from 'react'

type TGalleryProduct = {
  idToRender: string
  productId: number
  name: string
  productImageUrl: string
  printedImage: TPrintedImage
  firstImage: TProductImage
}

interface ProductGalleryProps {
  products: TBaseProduct[]
  activeImageId: number
  activeProduct: TBaseProduct
  onSelectImage: (productImageId: number) => void
  printedImages: TPrintedImage[]
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  activeImageId,
  activeProduct,
  onSelectImage,
  printedImages,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<TGalleryProduct>()

  const generateIdToRender = (productId: number, printedImageId: string) => {
    return `${productId}-${printedImageId}`
  }

  const [productsToRender, trendingToRender] = useMemo<
    [TGalleryProduct[], TGalleryProduct[]]
  >(() => {
    const nonTrendingProducts: TGalleryProduct[] = []
    const trendingProducts: TGalleryProduct[] = []
    for (const printedImage of printedImages) {
      for (const product of products) {
        const firstImage = product.images[0]
        if (product.isTrending) {
          trendingProducts.push({
            idToRender: generateIdToRender(product.id, printedImage.id),
            productId: product.id,
            name: product.name,
            productImageUrl: product.url,
            printedImage,
            firstImage,
          })
        } else {
          nonTrendingProducts.push({
            idToRender: generateIdToRender(product.id, printedImage.id),
            productId: product.id,
            name: product.name,
            productImageUrl: product.url,
            printedImage,
            firstImage,
          })
        }
      }
    }
    return [nonTrendingProducts, trendingProducts]
  }, [products, printedImages])

  const handleSelectProduct = (product: TGalleryProduct) => {
    setSelectedProduct(product)
    onSelectImage(product.firstImage.id)
  }

  useEffect(() => {
    setSelectedProduct(productsToRender[0])
  }, [])

  return (
    <div>
      <h2 className="text-sm text-center font-semibold text-gray-700 mb-3 px-1">
        Chọn sản phẩm muốn lưu giữ kỷ niệm
      </h2>
      <div className="flex gap-3 overflow-x-scroll p-2 pb-3">
        {productsToRender.map((product) => {
          const isActive = product.idToRender === selectedProduct?.idToRender
          return (
            <button
              key={product.idToRender}
              onClick={() => handleSelectProduct(product)}
              className={`flex-shrink-0 touch-target relative rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-4 ring-pink-cl ring-offset-2' : 'ring-2 ring-gray-200'
              }`}
            >
              <span className="block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-max w-1/2 pointer-events-none">
                <img
                  src={product.printedImage.url || '/placeholder.svg'}
                  alt="Overlay"
                  className="h-full w-full"
                />
              </span>
              <img
                src={product.productImageUrl}
                alt={product.name}
                className="w-20 h-20 object-cover"
              />
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 overflow-x-auto gallery-scroll p-2 mt-2 rounded-lg">
        {trendingToRender.map((product) => {
          const isActive = product.idToRender === selectedProduct?.idToRender
          return (
            <button
              key={product.idToRender}
              onClick={() => handleSelectProduct(product)}
              className={`flex-shrink-0 touch-target relative rounded-xl overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-4 ring-pink-cl ring-offset-2' : 'ring-2 ring-gray-200'
              }`}
            >
              <span className="block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-max w-1/2 pointer-events-none">
                <img
                  src={product.printedImage.url || '/placeholder.svg'}
                  alt="Overlay"
                  className="h-full w-full"
                />
              </span>
              <img
                src={product.productImageUrl}
                alt={product.name}
                className="w-20 h-20 object-cover"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductGallery
