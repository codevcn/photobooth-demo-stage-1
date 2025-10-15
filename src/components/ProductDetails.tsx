import { IProductImage } from '@/utils/types'
import { useEffect, useRef, useState } from 'react'

interface ProductImageProps {
  image: IProductImage
  imgsContainerRef: React.RefObject<HTMLDivElement>
}

const ProductImage: React.FC<ProductImageProps> = ({ image, imgsContainerRef }) => {
  const { url, id, name } = image

  return (
    <div className="NAME-image-box h-96 p-3 min-w-full" data-img-box-id={id}>
      <img
        key={id}
        src={url}
        alt={name}
        className="object-contain snap-center flex-shrink-0 h-full max-h-full w-full max-w-full"
      />
    </div>
  )
}

function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface ProductDetailsProps {
  show: boolean
  onHideShow: (show: boolean) => void
  productDetails: IProductImage
  peerProducts: IProductImage[]
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  show,
  onHideShow,
  productDetails,
  peerProducts,
}) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)
  const [pickedIndex, setPickedIndex] = useState<number>(0)
  const [pickedItem, setPickedItem] = useState<IProductImage>(productDetails)
  const { name, description, priceInVND, priceAfterDiscount, id: pickedItemId } = pickedItem

  const pickItem = (imgId: string) => {
    const index = peerProducts.findIndex(({ id }) => id === imgId)
    if (index < 0) return
    setPickedIndex(index)
    setPickedItem(peerProducts[index])
  }

  const swipeProductImages = () => {
    const imgsContainer = imgsContainerRef.current
    if (!imgsContainer) return
    const scrollPosition = (imgsContainer.children[pickedIndex] as HTMLElement).offsetLeft
    imgsContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' })
  }

  useEffect(() => {
    swipeProductImages()
  }, [pickedIndex])

  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [show])

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
      }}
      className="fixed inset-0 transition duration-200 max-w-md min-h-screen z-[999] mx-auto"
    >
      <div className="bg-black/50 absolute inset-0 z-10" onClick={() => onHideShow(false)}></div>
      <div className="bg-white overflow-y-auto rounded-lg relative z-20 w-[90%] h-full max-h-[75vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        {/* <!-- Image Gallery Section --> */}
        <section className="relative">
          {/* <!-- Promotion Badge - Prominent --> */}
          <div className="absolute opacity-30 active:opacity-100 hover:opacity-100 top-2 left-2 z-10 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
            <span className="text-xs">FLASH SALE</span>
            <span className="block text-lg">-35% OFF</span>
          </div>

          {/* <!-- Main Image Gallery (Swipeable) --> */}
          <div className="relative overflow-hidden bg-gray-100">
            <div
              ref={imgsContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
              {peerProducts.map((product) => (
                <ProductImage
                  key={product.id}
                  image={product}
                  imgsContainerRef={imgsContainerRef}
                />
              ))}
            </div>
          </div>

          {/* <!-- Thumbnail Gallery --> */}
          <div
            className="thumbnail-scroll flex gap-2 p-3 overflow-x-auto bg-white border-b"
            role="tablist"
          >
            {peerProducts.map(({ url, id, name }) => (
              <button
                key={id}
                className="thumbnail flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 transition-all"
                style={{ outline: id === pickedItemId ? '3px solid var(--vcn-pink-cl)' : 'none' }}
                onClick={() => pickItem(id)}
              >
                <img src={url} alt={name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* <!-- Product Information Section --> */}
        <section className="p-4 space-y-4">
          {/* <!-- Product Name & Stock Status --> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{name}</h1>

            {/* <!-- Stock Status --> */}
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-gray-500">• 247 sản phẩm có sẵn</span>
            </div>
          </div>

          {/* <!-- Pricing Section - Prominent --> */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-baseline gap-3">
              {/* <!-- Discounted Price - Large & Prominent --> */}
              <span className="text-3xl font-bold text-blue-600">
                {formatNumberWithCommas(priceInVND) + ' VND'}
              </span>

              {/* <!-- Original Price - Struck Through --> */}
              {priceAfterDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  {formatNumberWithCommas(priceAfterDiscount) + ' VND'}
                </span>
              )}
            </div>
            {/* <!-- Savings Badge --> */}
            {priceAfterDiscount && (
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                <span>Tiết kiệm </span>
                <span>{formatNumberWithCommas(priceInVND - priceAfterDiscount)}</span>
                <span> VND</span>
              </span>
            )}
            {priceAfterDiscount && (
              <p className="text-xs text-gray-600 mt-1">Ưu đãi có thời hạn • Kết thúc sau 2 ngày</p>
            )}
          </div>

          {/* <!-- Seller & Origin Information --> */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Người bán</span>
              <span className="text-sm font-semibold text-gray-900">AudioTech Store</span>
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
            {/* <!-- Các tính năng nổi bật --> */}
            {/* <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span></span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Thời lượng pin 40 giờ, sạc nhanh</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Đệm tai bằng mút hoạt tính cao cấp</span>
              </li>
            </ul> */}
          </div>
        </section>
      </div>
    </div>
  )
}
