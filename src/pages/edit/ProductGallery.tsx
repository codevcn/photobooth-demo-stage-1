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
  onSelectImage: (productImageId: number, printedImage: TPrintedImage) => void
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

  const [productsToRender, productsInNewLine] = useMemo<
    [TGalleryProduct[], TGalleryProduct[]]
  >(() => {
    const firstLineProducts: TGalleryProduct[] = []
    const productsInNewLine: TGalleryProduct[] = []
    const printedImage = printedImages[0]
    for (const product of products) {
      const firstImage = product.images[0]
      if (product.inNewLine) {
        productsInNewLine.push({
          idToRender: generateIdToRender(product.id, printedImage.id),
          productId: product.id,
          name: product.name,
          productImageUrl: product.url,
          printedImage,
          firstImage,
        })
      } else {
        firstLineProducts.push({
          idToRender: generateIdToRender(product.id, printedImage.id),
          productId: product.id,
          name: product.name,
          productImageUrl: product.url,
          printedImage,
          firstImage,
        })
      }
    }
    const threshold = Math.round(products.length / 2)
    return [
      firstLineProducts.slice(0, threshold),
      firstLineProducts.slice(threshold, firstLineProducts.length),
    ]
  }, [products, printedImages])

  const hasProductsInNewLine = productsInNewLine && productsInNewLine.length > 0

  const handleSelectProduct = (product: TGalleryProduct, printedImage: TPrintedImage) => {
    setSelectedProduct(product)
    onSelectImage(product.firstImage.id, printedImage)
  }

  useEffect(() => {
    setSelectedProduct(productsToRender[0])
  }, [])

  return (
    <div className="md:h-screen pb-3 h-fit flex flex-col bg-white rounded-xl shadow-lg px-1.5 pt-3 border border-gray-200">
      <h2 className="text-base w-full text-center font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        Gian hàng sản phẩm
      </h2>
      <h2 className="lg:flex hidden text-sm text-center font-semibold text-gray-700 mb-3 px-1">
        Chọn sản phẩm muốn lưu giữ kỷ niệm
      </h2>
      <div
        className={`${
          hasProductsInNewLine ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        } grid grow overflow-y-auto`}
      >
        <div className="flex md:flex-col md:items-center gap-3 overflow-x-scroll p-2 pt-3 md:overflow-y-auto md:overflow-x-clip h-fit md:max-h-full spmd:max-h-full gallery-scroll">
          {productsToRender &&
            productsToRender.map((product) => {
              const isActive = product.idToRender === selectedProduct?.idToRender
              return (
                <button
                  key={product.idToRender}
                  onClick={() => handleSelectProduct(product, product.printedImage)}
                  className={`w-fit h-fit flex-shrink-0 relative rounded-xl overflow-hidden transition duration-200 ${
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
        {hasProductsInNewLine && (
          <div className="flex md:flex-col md:items-center gap-3 overflow-x-scroll p-2 pt-3 md:overflow-y-auto md:overflow-x-clip h-fit md:max-h-full spmd:max-h-full gallery-scroll">
            {productsInNewLine.map((product) => {
              const isActive = product.idToRender === selectedProduct?.idToRender
              return (
                <button
                  key={product.idToRender}
                  onClick={() => handleSelectProduct(product, product.printedImage)}
                  className={`flex-shrink-0 touch-target relative rounded-xl overflow-hidden transition duration-200 ${
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
        )}
      </div>
    </div>
  )
}

export default ProductGallery
