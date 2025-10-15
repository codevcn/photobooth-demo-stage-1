import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Edit2, Tag, Banknote, X, ArrowBigLeft } from 'lucide-react'
import { formatNumberWithCommas, LocalStorageHelper } from '@/utils/helpers'
import { productImages } from '@/lib/storage'
import { IProductImage } from '@/utils/types'
import { PaymentModal } from '@/components/PaymentModal'
import { useNavigate } from 'react-router-dom'

type TProductItem = {
  id: string
  name: string
  size: string
  color: {
    title: string
    value: string
  }
  quantity: number
  originalPrice: number
  discountedPrice?: number
  mockupData: {
    id: string
    image: string
  }
}

const PaymentPage = () => {
  const [sessionId] = useState<string>('12331-5465464-1321311-hththt')
  const [cartItems, setCartItems] = useState<TProductItem[]>([])
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountMessage, setDiscountMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }

  const applyDiscount = () => {
    if (discountCode.toLowerCase() === 'save20') {
      setDiscountApplied(true)
      setDiscountMessage('✓ Mã giảm giá đã được áp dụng thành công! Giảm 20%')
    } else {
      setDiscountApplied(false)
      setDiscountMessage('✗ Mã giảm giá không hợp lệ')
    }
  }

  const findProductInfoInMainProducts = (id: string): IProductImage | null => {
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
      for (const product of savedItems.productsInfo) {
        const productInfo = findProductInfoInMainProducts(product.id)
        if (!productInfo) continue
        const { mockupDataURLs } = product
        for (const key in mockupDataURLs) {
          productItems.push({
            id: productInfo.id,
            name: productInfo.description,
            size: product.size,
            color: product.color,
            quantity: 1,
            originalPrice: productInfo.priceInVND,
            discountedPrice: productInfo.priceAfterDiscount,
            mockupData: { id: key, image: mockupDataURLs[key] },
          })
        }
      }
      if (productItems.length > 0) {
        setCartItems(productItems)
      }
    }
  }

  const removeProductFromCart = (idAsImageDataURL: string) => {
    setCartItems((items) =>
      items.filter((item) => {
        const matching = item.id === idAsImageDataURL
        if (matching) {
          LocalStorageHelper.removeSavedMockupImage(sessionId, idAsImageDataURL, item.mockupData.id)
          return false
        } else {
          return true
        }
      })
    )
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => (sum + (item.discountedPrice || 0)) * item.quantity, 0)
  }, [cartItems])
  const discount = discountApplied ? subtotal * 0.2 : 0
  const total = subtotal - discount

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
      <div className="flex flex-col gap-2 max-w-md mx-auto px-2 pt-4 pb-6">
        {/* Product List */}
        <section className="flex flex-col gap-2">
          {cartItems.map(
            ({ id, mockupData, name, size, color, originalPrice, discountedPrice, quantity }) => (
              <div
                key={id}
                className="bg-white rounded-2xl shadow-sm p-4 transition-all duration-200"
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={mockupData.image}
                      alt={name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                      <button
                        onClick={() => console.log(`Edit product ${id}`)}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-pink-cl transition-colors rounded-lg hover:bg-superlight-pink-cl active:scale-95"
                        aria-label="Chỉnh sửa sản phẩm"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{size}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{color.title}</span>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      {discountedPrice ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">
                            <span>{formatNumberWithCommas(originalPrice)}</span>
                            <span> VND</span>
                          </span>
                          <span className="text-lg font-bold text-primary">
                            <span>{formatNumberWithCommas(discountedPrice)}</span>
                            <span> VND</span>
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-lg font-bold text-primary">
                            <span>{formatNumberWithCommas(originalPrice)}</span>
                            <span> VND</span>
                          </span>
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-75 transition-transform"
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={14} className="text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-75 transition-transform"
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={14} className="text-gray-600" />
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => removeProductFromCart(id)}
                            className="p-1 rounded-full bg-red-600 hover:scale-90 transition"
                          >
                            <X size={22} strokeWidth={3} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </section>

        {/* Discount Code Section */}
        <section className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} className="text-pink-cl" />
            <h2 className="font-semibold text-gray-900">Mã giảm giá</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Nhập mã khuyến mãi"
              className="flex-1 h-[40px] px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
            />
            <button
              onClick={applyDiscount}
              className="h-[40px] px-6 bg-pink-cl text-white font-medium rounded-xl active:scale-95 transition shadow-sm"
            >
              Áp dụng
            </button>
          </div>
          {discountMessage && (
            <p className={`mt-2 text-sm ${discountApplied ? 'text-green-600' : 'text-red-500'}`}>
              {discountMessage}
            </p>
          )}
        </section>

        {/* Order Summary */}
        <section className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-medium text-gray-900">
              <span>{formatNumberWithCommas(subtotal)}</span>
              <span> VND</span>
            </span>
          </div>
          {discountApplied && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Giảm giá (20%)</span>
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
          onClick={() => navigate("/")}
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
