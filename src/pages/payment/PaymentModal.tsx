import { orderService } from '@/services/order.service'
import { paymentService } from '@/services/payment.service'
import { getInitialContants } from '@/utils/contants'
import {
  capitalizeFirstLetter,
  formatNumberWithCommas,
  formatTime,
  isValidEmail,
  isValidPhoneNumber,
} from '@/utils/helpers'
import { TPaymentType } from '@/utils/types'
import { X, Check, TruckElectric, ArrowLeft } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { PaymentMethodSelector } from './PaymentMethod'
import { ShippingInfoForm, TFormErrors } from './ShippingInfo'
import { LocalStorageHelper } from '@/utils/localstorage'

const getColorByPaymentMethod = (method: TPaymentType): string => {
  switch (method) {
    case 'momo':
      return getInitialContants<string>('PAYMENT_MOMO_COLOR')
    case 'zalo':
      return getInitialContants<string>('PAYMENT_ZALO_COLOR')
    default:
      return getInitialContants<string>('PAYMENT_COD_COLOR')
  }
}

type TPaymentStatus = {
  status: 'pending' | 'completed' | 'failed'
  reason?: string
}

interface EndOfPaymentProps {
  total: number
  countdownDuration: number
  QRCodeURL: string
  paymentMethod: {
    method: TPaymentType
    title: string
  }
}

export const EndOfPayment: React.FC<EndOfPaymentProps> = ({
  total,
  countdownDuration,
  QRCodeURL,
  paymentMethod,
}) => {
  const { method, title } = paymentMethod
  const colorByPaymentMethod = getColorByPaymentMethod(method)
  const containerRef = useRef<HTMLDivElement>(null)
  const [paymentStatus, setPaymentStatus] = useState<TPaymentStatus>({ status: 'pending' })
  const { status, reason } = paymentStatus

  const countdownHandler = () => {
    if (!containerRef.current) return

    const countdownEl = containerRef.current.querySelector<HTMLElement>('.NAME-countdown')
    if (!countdownEl) return

    let remaining = countdownDuration
    countdownEl.textContent = formatTime(remaining)

    const interval = setInterval(() => {
      remaining -= 1

      if (remaining <= 0) {
        countdownEl.textContent = '00:00'
        clearInterval(interval)
        return
      }

      countdownEl.textContent = formatTime(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }

  const mockPaymentResult = (success: boolean) => {
    if (success) {
      setPaymentStatus({ status: 'completed' })
    } else {
      setPaymentStatus({ status: 'failed', reason: 'Lỗi kết nối hoặc số dư không đủ' })
    }
  }

  const backToEditPage = () => {
    window.location.href = '/edit'
  }

  useEffect(() => {
    return countdownHandler()
  }, [countdownDuration])

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center px-6 py-6">
      <div className="relative bg-white rounded-2xl shadow flex flex-col items-center w-full p-4 border-2 border-gray-200">
        <div className="flex gap-2 justify-between items-start w-full">
          <p className="text-base text-gray-800 font-bold mb-4">Tổng tiền</p>
          <p className="text-3xl font-bold text-red-600 mb-1">
            <span>{formatNumberWithCommas(total)}</span>
            <span> VND</span>
          </p>
        </div>

        <div className="w-full bg-gray-200 h-[2px] my-2"></div>

        {method === 'momo' || method === 'zalo' ? (
          status === 'completed' ? (
            <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
              <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-green-600">
                <Check size={50} className="text-white" strokeWidth={6} />
              </div>
              <div className="text-gray-800 mt-4 w-full text-center">
                <p>
                  <span>Đã hoàn tất thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                <p>Cám ơn bạn đã sử dụng dịch vụ!</p>
                <p className="p-1 rounded-md bg-light-pink-cl mt-1">
                  Mã giao dịch của bạn là <span className="font-bold">000-XXX-XXX</span>
                </p>
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
              <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-red-600">
                <X size={50} className="text-white" strokeWidth={6} />
              </div>
              <div className="text-red-600 mt-4 w-full text-center">
                <p>
                  <span>Thanh toán không thành công với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                {reason && (
                  <p>
                    Lý do: <span>{reason}</span>.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div
                className="my-4 p-6 rounded-md"
                style={{ backgroundColor: colorByPaymentMethod }}
                onClick={() => mockPaymentResult(true)}
              >
                <img src={QRCodeURL} className="w-40 h-40 object-contain" alt="QR code" />
              </div>
              <div
                className="text-base text-black font-bold text-center"
                onClick={() => mockPaymentResult(false)}
              >
                <p className="mb-1">
                  <span>Mã QR hết hạn sau </span>
                  <span className="NAME-countdown">{formatTime(countdownDuration)}</span>
                </p>
                <p className="text-center">
                  <span>Quét mã QR để thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
              </div>
            </>
          )
        ) : (
          <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full">
              <TruckElectric size={50} className="text-pink-cl" strokeWidth={3} />
            </div>
            <div className="text-center text-gray-800 text-base font-medium mt-4">
              <p>Cám ơn bạn đã sử dụng dịch vụ!</p>
              <p>Đơn hàng hiện đang được xử lý và sẽ được giao đến bạn trong thời gian sớm nhất.</p>
            </div>
          </div>
        )}
      </div>

      {(method === 'cod' || status === 'completed' || status === 'failed') && (
        <button
          onClick={backToEditPage}
          className="flex items-center gap-2 mt-4 text-pink-cl font-bold active:underline"
        >
          <ArrowLeft size={20} color="currentColor" />
          <span>Quay về trang chỉnh sửa</span>
        </button>
      )}
    </div>
  )
}

type TEndOfPaymentData = {
  countdownDuration: number
  QRCodeURL: string
}

interface PaymentModalProps {
  show: boolean
  paymentInfo: {
    total: number
  }
  onHideShow: (show: boolean) => void
  voucherCode?: string
}

export const PaymentModal = ({ show, paymentInfo, onHideShow, voucherCode }: PaymentModalProps) => {
  const { total } = paymentInfo
  const [paymentMethod, setPaymentMethod] = useState<TPaymentType>('momo')
  const [confirming, setConfirming] = useState<boolean>(false)
  const [confirmingMessage, setConfirmingMessage] = useState<string>('Đang xử lý...')
  const [endOfPayment, setEndOfPayment] = useState<TEndOfPaymentData>()
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<TFormErrors>({})

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

    // Get cart items from LocalStorage
    const savedData = LocalStorageHelper.getSavedMockupData()
    if (!savedData || savedData.productsInCart.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    setConfirming(true)

    try {
      // Step 1: Create order
      setConfirmingMessage('Đang tạo đơn hàng...')
      const orderResponse = await orderService.createOrder(
        savedData.productsInCart,
        shippingInfo,
        paymentMethod,
        voucherCode
      )

      toast.success(`Đơn hàng ${orderResponse.order_number} đã được tạo`)

      // Step 2: Get payment QR (only for Momo/Zalo)
      if (paymentMethod === 'momo' || paymentMethod === 'zalo') {
        setConfirmingMessage('Đang tạo mã QR thanh toán...')
        const qrResponse = await paymentService.getPaymentQR(
          orderResponse.order_number,
          paymentMethod,
          total
        )

        setEndOfPayment({
          countdownDuration: qrResponse.expires_in,
          QRCodeURL: qrResponse.qr_code_url,
        })
      } else {
        // COD: No QR needed, just show success
        setEndOfPayment({
          countdownDuration: 0,
          QRCodeURL: '',
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý thanh toán')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div
      style={{ display: show ? 'flex' : 'none' }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-50 animate-in fade-in duration-200"
    >
      <div className="flex flex-col pt-12 bg-white rounded-2xl overflow-hidden relative shadow-2xl w-full max-w-[420px] max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {confirming && (
          <div className="absolute w-full h-full top-0 text-white left-0 bg-black/50 z-20">
            <div className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-spin border-t-4 border-pink-cl rounded-full h-12 w-12"></div>
              <p className="mt-2 font-bold">{confirmingMessage}</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="absolute top-0 left-0 w-full z-20 bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Hoàn tất thanh toán</h2>
          <button
            onClick={() => onHideShow(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            aria-label="Đóng hộp thoại"
          >
            <X size={24} className="text-gray-500" />
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

        <div style={{ display: endOfPayment ? 'block' : 'none' }}>
          <EndOfPayment
            total={total}
            countdownDuration={endOfPayment?.countdownDuration || 0}
            QRCodeURL={endOfPayment?.QRCodeURL || ''}
            paymentMethod={{ method: paymentMethod, title: capitalizeFirstLetter(paymentMethod) }}
          />
        </div>
      </div>
    </div>
  )
}
