import { formatNumberWithCommas } from '@/utils/helpers'
import { TBaseProduct, TProductImage, TProductSize, TSurfaceType } from '@/utils/types/global'
import { useEffect, useMemo, useRef, useState } from 'react'

interface ProductImageProps {
  imageUrl: string
  name: string
  id: number
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, name, id }) => {
  return (
    <div className="NAME-image-box h-96 p-3 min-w-full" data-img-box-id={id}>
      <img
        key={id}
        src={imageUrl}
        alt={name}
        className="object-contain snap-center flex-shrink-0 h-full max-h-full w-full max-w-full"
      />
    </div>
  )
}

interface ProductDetailsProps {
  show: boolean
  onHideShow: (show: boolean) => void
  product: TBaseProduct
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ show, onHideShow, product }) => {
  const { images: productImages, description, printAreaList } = product
  const imgsContainerRef = useRef<HTMLDivElement>(null)
  const [pickedItem, setPickedItem] = useState<TProductImage>(productImages[0])
  const [selectedSurface, setSelectedSurface] = useState<TSurfaceType>('front')
  const { name, priceAmountOneSide, priceAfterDiscount, size, color, stock, category, currency } =
    pickedItem

  // Get unique sizes from all variants
  const sizes = useMemo<TProductSize[]>(() => {
    const uniqueSizes = new Set<TProductSize>()
    for (const img of product.images) {
      uniqueSizes.add(img.size)
    }
    return Array.from(uniqueSizes)
  }, [product.images])

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

  // Get available surfaces from printAreaList
  const availableSurfaces = useMemo(() => {
    const surfaceTypes = new Set<TSurfaceType>()
    for (const area of printAreaList) {
      surfaceTypes.add(area.surfaceType)
    }
    return Array.from(surfaceTypes)
  }, [printAreaList])

  // Get surfaces list for current variant (for thumbnail gallery)
  const surfacesForCurrentVariant = useMemo(() => {
    return printAreaList.filter((area) => availableSurfaces.includes(area.surfaceType))
  }, [printAreaList, availableSurfaces])

  const handleSizeChange = (newSize: TProductSize) => {
    const itemWithSize = productImages.find(
      (img) => img.size === newSize && img.color.value === color.value
    )
    if (itemWithSize) {
      setPickedItem(itemWithSize)
    }
  }

  const handleColorChange = (newColor: string) => {
    const itemWithColor = productImages.find(
      (img) => img.color.value === newColor && img.size === size
    )
    if (itemWithColor) {
      setPickedItem(itemWithColor)
    }
  }

  const handleSurfaceClick = (surfaceId: number) => {
    const surface = printAreaList.find((area) => area.id === surfaceId)
    if (surface) {
      setSelectedSurface(surface.surfaceType)
    }
  }

  const scrollToSurface = () => {
    const imgsContainer = imgsContainerRef.current
    if (!imgsContainer) return

    const surfaceIndex = surfacesForCurrentVariant.findIndex(
      (area) => area.surfaceType === selectedSurface
    )

    if (surfaceIndex >= 0) {
      const scrollPosition = imgsContainer.children[surfaceIndex] as HTMLElement
      if (scrollPosition) {
        scrollPosition.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
      }
    }
  }

  useEffect(() => {
    scrollToSurface()
  }, [selectedSurface])

  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  return (
    <div className="fixed inset-0 transition duration-200 min-h-screen z-[999] mx-auto">
      <div className="bg-black/50 absolute inset-0 z-10" onClick={() => onHideShow(false)}></div>
      <div className="bg-white overflow-y-auto rounded-lg relative z-20 w-[90%] h-full max-h-[90vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        {/* Header Section with Title and Close Button */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-1 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết sản phẩm</h2>
          <button
            onClick={() => onHideShow(false)}
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Đóng"
          >
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
              className="lucide lucide-x-icon lucide-x text-gray-600"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* <!-- Image Gallery Section --> */}
        <section className="relative">
          {/* <!-- Main Image Gallery (Swipeable) --> */}
          <div className="relative overflow-hidden bg-gray-100">
            <div
              ref={imgsContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
              {surfacesForCurrentVariant.map((area) => (
                <ProductImage
                  key={area.id}
                  imageUrl={area.imageUrl}
                  name={product.name}
                  id={area.id}
                />
              ))}
            </div>
          </div>

          {/* <!-- Thumbnail Gallery - Surfaces --> */}
          <div
            className="thumbnail-scroll flex gap-2 p-3 overflow-x-auto bg-white border-b"
            role="tablist"
          >
            {surfacesForCurrentVariant.map((area) => (
              <button
                key={area.id}
                className="thumbnail flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative"
                style={{
                  borderColor:
                    area.surfaceType === selectedSurface ? 'var(--vcn-pink-cl)' : '#e5e7eb',
                  outline:
                    area.surfaceType === selectedSurface ? '3px solid var(--vcn-pink-cl)' : 'none',
                }}
                onClick={() => handleSurfaceClick(area.id)}
              >
                <img
                  src={area.imageUrl}
                  alt={`${product.name} - ${area.surfaceType}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-0.5 text-center font-medium">
                  {area.surfaceType === 'front' ? 'Trước' : 'Sau'}
                </div>
              </button>
            ))}
          </div>

          {/* Surface, Size & Color Selection */}
          <div className="bg-white p-4 border-b space-y-4">
            {/* Surface Selection */}
            {availableSurfaces.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Các mặt in</h3>
                <div className="flex gap-2">
                  {availableSurfaces.map((surface) => (
                    <button
                      key={surface}
                      onClick={() => setSelectedSurface(surface)}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-all ${
                        selectedSurface === surface
                          ? 'border-pink-cl bg-pink-50 text-pink-cl'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {surface === 'front' ? 'Mặt trước' : 'Mặt sau'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size & Color Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Size */}
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Kích thước</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sizeOption) => (
                      <div
                        key={sizeOption}
                        onClick={() => handleSizeChange(sizeOption)}
                        className={`border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg border-2 font-medium text-sm transition-all`}
                      >
                        {sizeOption}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color */}
              {colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Màu sắc</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((colorOption) => (
                      <div
                        key={colorOption.value}
                        onClick={() => handleColorChange(colorOption.value)}
                        className={`border-gray-200 bg-white flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all`}
                        title={colorOption.title}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: colorOption.value }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {colorOption.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* <!-- Product Information Section --> */}
        <section className="p-4 space-y-4">
          {/* <!-- Product Name & Stock Status --> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{name}</h1>

            {/* <!-- Stock Status --> */}
            <div className="flex items-center gap-2">
              {stock > 0 ? (
                <>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Còn hàng</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    • <span>{stock}</span> sản phẩm có sẵn
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Hết hàng</span>
                </span>
              )}
            </div>

            {/* Category Badge */}
            {category && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                  {category}
                </span>
              </div>
            )}
          </div>

          {/* <!-- Pricing Section - Prominent --> */}
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
            <div className="flex items-baseline gap-3">
              {/* <!-- Discounted Price - Large & Prominent --> */}
              <span className="text-3xl font-bold text-pink-cl">
                {formatNumberWithCommas(priceAmountOneSide) + ' ' + currency}
              </span>

              {/* <!-- Original Price - Struck Through --> */}
              {priceAfterDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  {formatNumberWithCommas(priceAfterDiscount) + ' ' + currency}
                </span>
              )}
            </div>
            {/* <!-- Savings Badge --> */}
            {priceAfterDiscount && (
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                <span>Tiết kiệm </span>
                <span>{formatNumberWithCommas(priceAmountOneSide - priceAfterDiscount)}</span>
                <span> {currency}</span>
              </span>
            )}
            {priceAfterDiscount && (
              <p className="text-xs text-gray-600 mt-1">Ưu đãi có thời hạn • Kết thúc sau 2 ngày</p>
            )}
          </div>

          {/* <!-- Seller & Origin Information --> */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Người bán</span>
              <span className="text-sm font-semibold text-gray-900">F-mon Fashion</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Xuất xứ</span>
              <span className="text-sm font-semibold text-gray-900">Đức</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bảo hành</span>
              <span className="text-sm font-semibold text-gray-900">2 Năm</span>
            </div>
          </div>

          {/* <!-- Product Description --> */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
