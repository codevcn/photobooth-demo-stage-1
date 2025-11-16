import { orderService } from '@/services/order.service'
import { getCommonContants } from '@/utils/contants'
import {
  capitalizeFirstLetter,
  formatNumberWithCommas,
  isValidEmail,
  isValidPhoneNumber,
} from '@/utils/helpers'
import {
  TEndOfPaymentData,
  TPaymentProductItem,
  TPaymentType,
  TProductInCart,
} from '@/utils/types/global'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { PaymentMethodSelector } from './PaymentMethod'
import { ShippingInfoForm, TFormErrors } from './ShippingInfo'
import { LocalStorageHelper } from '@/utils/localstorage'
import { SectionLoading } from '@/components/custom/Loading'
import { useGlobalContext } from '@/context/global-context'
import { EndOfPayment } from './EndOfPayment'

interface PaymentModalProps {
  show: boolean
  paymentInfo: {
    total: number
  }
  onHideShow: (show: boolean) => void
  voucherCode?: string
  cartItems: TPaymentProductItem[]
}

export const PaymentModal = ({
  show,
  paymentInfo,
  onHideShow,
  voucherCode,
  cartItems,
}: PaymentModalProps) => {
  const { total } = paymentInfo
  const [paymentMethod, setPaymentMethod] = useState<TPaymentType>('momo')
  const [confirming, setConfirming] = useState<boolean>(false)
  const [confirmingMessage, setConfirmingMessage] = useState<string>('Đang xử lý...')
  const [endOfPayment, setEndOfPayment] = useState<TEndOfPaymentData>()
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<TFormErrors>({})
  const { preSentMockupImageLinks } = useGlobalContext()

  const validateForm = (formEle: HTMLFormElement) => {
    let isValid: boolean = true
    setErrors({})
    const formData = new FormData(formEle)
    const fullName = formData.get('fullName')?.toString().trim()
    const phone = formData.get('phone')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const province = formData.get('province')?.toString().trim()
    const city = formData.get('city')?.toString().trim()
    const address = formData.get('address')?.toString().trim()
    if (!fullName || !phone || !email || !province || !city || !address) {
      setErrors({
        fullName: fullName ? undefined : 'Họ và tên là bắt buộc',
        phone: phone ? undefined : 'Số điện thoại là bắt buộc',
        email: email ? undefined : 'Email là bắt buộc',
        province: province ? undefined : 'Tỉnh/Thành phố là bắt buộc',
        city: city ? undefined : 'Quận/Huyện là bắt buộc',
        address: address ? undefined : 'Địa chỉ là bắt buộc',
      })
      isValid = false
    }
    if (phone && !isValidPhoneNumber(phone)) {
      setErrors((pre) => ({
        ...pre,
        phone: 'Số điện thoại không hợp lệ',
      }))
      isValid = false
    }
    if (email && !isValidEmail(email)) {
      setErrors((pre) => ({
        ...pre,
        email: 'Email không hợp lệ',
      }))
      isValid = false
    }
    return isValid
  }

  const mapProductsInCartToOrderItems = (): TPaymentProductItem[] | null => {
    // Get cart items from LocalStorage
    const savedData = LocalStorageHelper.getSavedMockupData()
    if (!savedData || savedData.productsInCart.length === 0) {
      toast.error('Giỏ hàng trống')
      return null
    }
    const productsInCart: TPaymentProductItem[] = [...cartItems]
    for (const item of cartItems) {
      item.preSentImageLink = preSentMockupImageLinks.find(
        (link) => link.mockupId === item.mockupData.id
      )?.imageUrl
    }
    return productsInCart
  }

  const handleConfirmPayment = async () => {
    const form = formRef.current
    if (!form) return

    // Validate form
    if (!validateForm(form)) {
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng')
      return
    }

    // Get form data
    const formData = new FormData(form)
    const shippingInfo = {
      name: formData.get('fullName')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      province: formData.get('province')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim() || '',
      address: formData.get('address')?.toString().trim() || '',
      message: formData.get('message')?.toString().trim(),
    }

    setConfirming(true)
    // Step 1: Create order
    setConfirmingMessage('Đang tạo đơn hàng...')

    const productsInCart = mapProductsInCartToOrderItems()
    if (!productsInCart || productsInCart.length === 0) return
    try {
      const orderResponse = await orderService.createOrder(cartItems, shippingInfo, voucherCode)

      const { order, payment_instructions } = orderResponse

      toast.success(`Đơn hàng đã được tạo`)

      // Step 2: Handle payment based on method
      if (paymentMethod === 'momo' || paymentMethod === 'zalo') {
        // Use payment instructions from order response
        if (payment_instructions && payment_instructions.length > 0) {
          const paymentInstruction = payment_instructions[0]

          setEndOfPayment({
            countdownInSeconds: getCommonContants<number>('FIXED_COUNTDOWN_PAYMENT_SECONDS'), // 15 minutes default
            QRCode: paymentInstruction.qr_code,
            paymentMethod: {
              method: paymentMethod,
              title: capitalizeFirstLetter(paymentMethod),
            },
            total,
            orderHashCode: order.hash_code,
          })
        } else {
          throw new Error('Không nhận được thông tin thanh toán từ server')
        }
      } else {
        // COD: No QR needed, just show success
        setEndOfPayment({
          countdownInSeconds: 0,
          QRCode: '',
          paymentMethod: {
            method: paymentMethod,
            title: capitalizeFirstLetter(paymentMethod),
          },
          total,
          orderHashCode: order.hash_code,
        })
      }
    } catch (error) {
      console.error('>>> Payment error:', error)
      toast.error('Có lỗi xảy ra khi xử lý thanh toán')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div
      style={{ display: show ? 'flex' : 'none' }}
      className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4"
    >
      <div onClick={() => onHideShow(false)} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="flex flex-col pt-12 bg-white rounded-2xl z-20 overflow-hidden relative shadow-2xl w-fit max-w-[95vw] max-h-[95vh] animate-in slide-in-from-bottom duration-200">
        {confirming && (
          <div className="absolute flex justify-center items-center w-full h-full top-0 text-white left-0 bg-black/50 z-30">
            <SectionLoading
              message={confirmingMessage}
              classNames={{
                container: 'text-white',
                message: 'text-white',
                shapesContainer: 'text-white',
              }}
            />
          </div>
        )}

        {/* Modal Header */}
        <div className="absolute top-0 left-0 w-full z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Hoàn tất thanh toán</h2>
          <button
            onClick={() => onHideShow(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            aria-label="Đóng hộp thoại"
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
              className="lucide lucide-x-icon lucide-x text-gray-500"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div
          style={{
            display: endOfPayment ? 'none' : 'block',
          }}
          className="px-6 pt-6 pb-4 space-y-4 relative z-10 overflow-y-auto grow"
        >
          {/* Total Summary */}
          <section className="bg-superlight-pink-cl rounded-2xl p-5 border border-indigo-100">
            <p className="text-sm text-gray-800 mb-1">Tổng số tiền cần thanh toán</p>
            <p className="text-3xl font-bold text-red-600 mb-1">
              <span>{formatNumberWithCommas(total)}</span>
              <span> VND</span>
            </p>
            <p className="text-sm text-gray-800">Đã bao gồm VAT</p>
          </section>

          {/* Shipping Information */}
          <ShippingInfoForm ref={formRef} errors={errors} />

          <div className="my-1 bg-gray-300 w-full h-[1px]"></div>

          {/* Payment Method */}
          <PaymentMethodSelector selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmPayment}
              className="w-full h-[50px] bg-pink-cl text-white font-bold text-lg rounded-lg shadow-lg active:scale-90 transition"
            >
              Xác nhận thanh toán
            </button>
            <button
              onClick={() => onHideShow(false)}
              className="w-full h-[45px] text-lg text-gray-800 font-bold active:scale-90 transition"
            >
              Hủy
            </button>
          </div>
        </div>
        {endOfPayment && <EndOfPayment data={endOfPayment} />}
      </div>
    </div>
  )
}
