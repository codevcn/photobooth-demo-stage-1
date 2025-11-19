import { formatNumberWithCommas } from '@/utils/helpers'
import { TBaseProduct, TProductImage, TProductSize } from '@/utils/types/global'
import { useEffect, useMemo, useState } from 'react'

interface ProductDetailsProps {
  show: boolean
  onHideShow: (show: boolean) => void
  product: TBaseProduct
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ show, onHideShow, product }) => {
  const { images: productImages, description, detailImages } = product
  const [pickedItem, setPickedItem] = useState<TProductImage>(productImages[0])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const { name, priceAmountOneSide, priceAfterDiscount, size, color, stock, category, currency } =
    pickedItem

  // Combine all images: detailImages + printAreaList images
  const allProductImages = useMemo(() => {
    const images: string[] = []
    if (detailImages && detailImages.length > 0) {
      images.push(...detailImages)
    }
    // Fallback to printAreaList images if no detailImages
    if (images.length === 0 && product.printAreaList.length > 0) {
      product.printAreaList.forEach((area) => {
        if (area.imageUrl && !images.includes(area.imageUrl)) {
          images.push(area.imageUrl)
        }
      })
    }
    // Final fallback to product.url
    if (images.length === 0 && product.url) {
      images.push(product.url)
    }
    return images
  }, [detailImages, product.printAreaList, product.url])

  // Get unique colors from all variants
  const colors = useMemo<TProductImage['color'][]>(() => {
    const uniqueColors = new Map<string, TProductImage['color']>()
    for (const img of product.images) {
      if (!uniqueColors.has(img.color.value)) {
        uniqueColors.set(img.color.value, img.color)
      }
    }
    return Array.from(uniqueColors.values())
  }, [product.images])

  // Get sizes for selected color
  const sizesForColor = useMemo<TProductSize[]>(() => {
    const sizes: TProductSize[] = []
    for (const img of product.images) {
      if (img.color.value === color.value && !sizes.includes(img.size)) {
        sizes.push(img.size)
      }
    }
    return sizes
  }, [product.images, color.value])

  const handleSizeChange = (newSize: TProductSize) => {
    const itemWithSize = productImages.find(
      (img) => img.size === newSize && img.color.value === color.value
    )
    if (itemWithSize) {
      setPickedItem(itemWithSize)
    }
  }

  const handleColorChange = (newColor: string) => {
    // Find item with new color, prefer same size or first available
    const itemWithColor =
      productImages.find((img) => img.color.value === newColor && img.size === size) ||
      productImages.find((img) => img.color.value === newColor)
    if (itemWithColor) {
      setPickedItem(itemWithColor)
    }
  }

  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => onHideShow(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full h-full md:w-[95%] md:h-[95vh] md:max-w-6xl bg-white md:rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header - Mobile & Desktop */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Chi tiết sản phẩm</h2>
          <button
            onClick={() => onHideShow(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Đóng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area - 2 Column Layout on Desktop */}
        <div className="flex-1 overflow-y-auto">
          <div className="md:grid md:grid-cols-2 lg:grid-cols-[1.2fr_1fr] md:h-full">
            {/* Left Column - Image Gallery (Desktop) / Top Section (Mobile) */}
            <div className="bg-gray-50 md:overflow-y-auto md:h-full">
              {/* Main Image */}
              <div className="bg-white p-3 md:p-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={allProductImages[selectedImageIndex]}
                    alt={name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {allProductImages.length > 1 && (
                <div className="px-3 pb-3 md:px-4 md:pb-4">
                  <div className="flex gap-2 overflow-x-auto p-2">
                    {allProductImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-pink-cl ring-2 ring-pink-cl ring-offset-1'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Product Information */}
            <div className="bg-white md:overflow-y-auto md:h-full">
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {/* Product Name */}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {name}
                  </h1>
                  {category && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-superlight-pink-cl text-pink-cl capitalize">
                      {category}
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="bg-superlight-pink-cl rounded-lg p-3 border border-light-pink-cl">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl md:text-3xl font-bold text-pink-cl">
                      {formatNumberWithCommas(priceAmountOneSide)} {currency}
                    </span>
                    {priceAfterDiscount && priceAfterDiscount !== priceAmountOneSide && (
                      <>
                        <span className="text-base md:text-lg text-gray-500 line-through">
                          {formatNumberWithCommas(priceAfterDiscount)} {currency}
                        </span>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          Tiết kiệm{' '}
                          {formatNumberWithCommas(
                            Math.abs(priceAmountOneSide - priceAfterDiscount)
                          )}{' '}
                          {currency}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-sm">
                  {stock > 0 ? (
                    <>
                      <span className="flex items-center gap-1 font-medium text-green-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Còn hàng
                      </span>
                      <span className="text-gray-500">• {stock} sản phẩm</span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-red-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Hết hàng
                    </span>
                  )}
                </div>

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Màu sắc: <span className="text-pink-cl">{color.title}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          onClick={() => handleColorChange(colorOption.value)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 transition-all ${
                            color.value === colorOption.value
                              ? 'border-pink-cl bg-superlight-pink-cl'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          title={colorOption.title}
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorOption.value }}
                          />
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            {colorOption.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizesForColor.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Kích thước: <span className="text-pink-cl">{size}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sizesForColor.map((sizeOption) => (
                        <button
                          key={sizeOption}
                          onClick={() => handleSizeChange(sizeOption)}
                          className={`min-w-[3rem] px-3 py-1.5 rounded-lg border-2 font-medium text-sm transition-all ${
                            size === sizeOption
                              ? 'border-pink-cl bg-superlight-pink-cl text-pink-cl'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          {sizeOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Information */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Người bán</span>
                    <span className="font-semibold text-gray-900">Photoism</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
                    <a
                      href="tel:0123456789"
                      className="font-semibold text-pink-cl hover:text-pink-hover-cl transition-colors"
                    >
                      0987 654 321
                    </a>
                  </div>
                </div>

                {/* Product Description */}
                {description && (
                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
