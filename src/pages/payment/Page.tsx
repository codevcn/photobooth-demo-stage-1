import { useEffect, useMemo, useState } from 'react'
import { Banknote, ArrowBigLeft, ArrowLeft } from 'lucide-react'
import { formatNumberWithCommas } from '@/utils/helpers'
import { TProductImage, TVoucher } from '@/utils/types'
import { PaymentModal } from '@/pages/payment/PaymentModal'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { LocalStorageHelper } from '@/utils/localstorage'
import { useGlobalContext, useProductImageContext } from '@/context/global-context'
import { VoucherSection } from '@/pages/payment/Voucher'
import { ProductList, TProductItem } from '@/pages/payment/ProductList'

interface IPaymentModalProps {
  imgSrc?: string
  onClose: () => void
}

const ProductImageModal = ({ imgSrc, onClose }: IPaymentModalProps) => {
  if (!imgSrc) return null
  return (
    <div className="flex fixed inset-0">
      <div onClick={onClose} className="absolute w-full h-full bg-black/50 z-10"></div>
      <div className="relative z-20 flex items-center justify-center m-auto">
        <img src={imgSrc} alt="Product image" className="max-h-[90vh] max-w-[90vw] object-contai" />
      </div>
    </div>
  )
}

const PaymentPage = () => {
  const { sessionId } = useGlobalContext()
  const [cartItems, setCartItems] = useState<TProductItem[]>([])
  const [appliedVoucher, setAppliedVoucher] = useState<TVoucher | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState<string>()
  const { productImages } = useProductImageContext()

  // Hàm tính subtotal (tổng tiền trước giảm giá voucher)
  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (sum, item) => sum + (item.discountedPrice || item.originalPrice) * item.quantity,
      0
    )
  }

  // Handler khi voucher được apply/remove
  const handleVoucherApplied = (voucher: TVoucher | null, discount: number) => {
    setAppliedVoucher(voucher)
    setVoucherDiscount(discount)
  }

  const updateQuantity = (idAsImageDataURL: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.mockupData.id === idAsImageDataURL
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const findProductInfoInMainProducts = (id: string): TProductImage | null => {
    for (const product of productImages.flat()) {
      if (product.id === id) {
        return product
      }
    }
    return null
  }

  const loadCartItems = () => {
    const savedItems = LocalStorageHelper.getSavedMockupData()
    if (savedItems) {
      const productItems: TProductItem[] = []
      for (const product of savedItems.productsInCart) {
        const productInfo = findProductInfoInMainProducts(product.id)
        if (!productInfo) continue

        // Duyệt qua danh sách mockup data
        for (const mockupData of product.mockupDataList) {
          productItems.push({
            id: productInfo.id,
            name: productInfo.description,
            size: product.size,
            color: product.color,
            quantity: 1,
            originalPrice: productInfo.priceInVND,
            discountedPrice: productInfo.priceAfterDiscount,
            mockupData: {
              id: mockupData.id,
              image: mockupData.dataURL,
            },
            elementsVisualState: mockupData.elementsVisualState,
          })
        }
      }
      if (productItems.length > 0) {
        setCartItems(productItems)
      }
    }
  }

  const removeProductFromCart = (idAsImageDataURL: string, productId: string) => {
    if (!sessionId) return
    setCartItems((items) =>
      items.filter((item) => {
        const matching = item.mockupData.id === idAsImageDataURL
        if (matching) {
          LocalStorageHelper.removeSavedMockupImage(sessionId, productId, idAsImageDataURL)
          return false
        } else {
          return true
        }
      })
    )
  }

  const handleShowProductImageModal = (imgSrc: string) => {
    setSelectedImage(imgSrc)
  }

  const handleCloseProductImageModal = () => {
    setSelectedImage(undefined)
  }

  const backToEditPage = () => {
    navigate('/edit')
  }

  const handleEditMockup = (mockupDataId: string) => {
    navigate(`/edit?mockupId=${mockupDataId}`)
  }

  const [subtotal, discount, total] = useMemo(() => {
    const subtotalValue = calculateSubtotal()
    const totalValue = subtotalValue - voucherDiscount

    return [subtotalValue, voucherDiscount, totalValue]
  }, [cartItems, voucherDiscount])

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto'
  }, [showModal])

  useEffect(() => {
    loadCartItems()
  }, [])

  return cartItems && cartItems.length > 0 ? (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-1">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-2 max-w-md mx-auto px-2 pt-2 pb-6">
        <div>
          <button
            onClick={backToEditPage}
            className="flex items-center gap-2 py-1 px-2 text-sm bg-pink-cl rounded-md text-white font-bold active:scale-95 transition"
          >
            <ArrowLeft size={20} color="currentColor" />
            <span>Quay về</span>
          </button>
        </div>

        {/* Product List */}
        <ProductList
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveProduct={removeProductFromCart}
          onShowProductImage={handleShowProductImageModal}
          onEditMockup={handleEditMockup}
        />

        {/* Discount Code Section */}
        <VoucherSection
          orderSubtotal={calculateSubtotal()}
          onVoucherApplied={handleVoucherApplied}
        />

        {/* Order Summary */}
        <section className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-medium text-gray-900">
              <span>{formatNumberWithCommas(subtotal)}</span>
              <span> VND</span>
            </span>
          </div>
          {appliedVoucher && discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Giảm giá ({appliedVoucher.code})</span>
              <span className="font-medium text-green-600">
                <span>-</span>
                <span>{formatNumberWithCommas(discount)}</span>
                <span> VND</span>
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Tổng cộng</span>
              <span className="text-xl font-bold text-primary">
                <span>{formatNumberWithCommas(total)}</span>
                <span> VND</span>
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-2">
        <div className="w-full mx-auto px-2 py-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 w-full h-[45px] bg-pink-cl text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition duration-200"
          >
            <Banknote size={28} className="text-white" strokeWidth={2} />
            <span>Tiến hành thanh toán</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={showModal}
        paymentInfo={{
          total,
        }}
        onHideShow={setShowModal}
      />

      {createPortal(
        <ProductImageModal imgSrc={selectedImage} onClose={handleCloseProductImageModal} />,
        document.body
      )}
    </div>
  ) : (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-12">
      <header className="bg-white shadow-sm top-0 z-10">
        <div className="px-4 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-1">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>
      </header>
      <div className="flex justify-center w-full pt-4">
        <button
          onClick={() => navigate('/edit')}
          className="flex justify-center items-center bg-pink-cl rounded-md p-2 active:scale-95 transition text-white font-bold"
        >
          <ArrowBigLeft size={24} color="currentColor" strokeWidth={3} />
          <span>Quay về trang chỉnh sửa</span>
        </button>
      </div>
    </div>
  )
}

export default PaymentPage
