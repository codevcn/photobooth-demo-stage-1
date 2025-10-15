import {
  capitalizeFirstLetter,
  delay,
  formatNumberWithCommas,
  formatTime,
  getColorByPaymentMethod,
} from '@/utils/helpers'
import { TPaymentType } from '@/utils/types'
import { X, Banknote, Check } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

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

  const mockPaymentResult = () => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        setPaymentStatus({ status: 'completed' })
      } else {
        setPaymentStatus({ status: 'failed', reason: 'Lỗi kết nối hoặc số dư không đủ' })
      }
    }, 8000)
  }

  useEffect(() => {
    return countdownHandler()
  }, [countdownDuration])

  useEffect(() => {
    mockPaymentResult()
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center px-6 py-6">
      <div className="relative bg-white rounded-2xl shadow flex flex-col items-center w-full p-4 border-2 border-gray-200">
        <div className="flex gap-2 justify-between items-start w-full">
          <p className="text-base text-gray-800 font-bold mb-4">Tổng tiền</p>
          <p className="text-3xl font-bold text-red-600 mb-1">
            <span>{total.toLocaleString()}</span>
            <span> VND</span>
          </p>
        </div>

        <div className="w-full bg-gray-200 h-[2px] my-2"></div>

        {status === 'completed' ? (
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
              <p className="p-1 rounded-md bg-light-pink-cl mt-1">
                Mã giao dịch của bạn là <span className="font-bold">000-XXX-XXX</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="my-4 p-6 rounded-md" style={{ backgroundColor: colorByPaymentMethod }}>
              <img src={QRCodeURL} className="w-40 h-40 object-contain" alt="QR code" />
            </div>
            <div className="text-base text-black font-bold text-center">
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
        )}
      </div>
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
}

export const PaymentModal = ({ show, paymentInfo, onHideShow }: PaymentModalProps) => {
  const { total } = paymentInfo
  const [paymentMethod, setPaymentMethod] = useState<TPaymentType>('momo')
  const [confirming, setConfirming] = useState<boolean>(false)
  const [endOfPayment, setEndOfPayment] = useState<TEndOfPaymentData>()

  const handleConfirmPayment = () => {
    setConfirming(true)
    delay(2000)
      .then(() => {
        setEndOfPayment({ countdownDuration: 600, QRCodeURL: '/images/QR.png' })
      })
      .finally(() => {
        setConfirming(false)
      })
  }

  return (
    <div
      style={{ display: show ? 'flex' : 'none' }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 animate-in fade-in duration-200"
    >
      <div className="flex flex-col pt-12 bg-white rounded-2xl overflow-hidden relative shadow-2xl w-full max-w-[420px] max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        {confirming && (
          <div className="absolute w-full h-full top-0 text-white left-0 bg-black/50 z-20">
            <div className="flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-spin border-t-4 border-white rounded-full h-12 w-12"></div>
              <p className="mt-2 font-bold">Đang tải...</p>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between rounded-t-3xl">
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
          <section className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-lg">Thông tin giao hàng</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="09xx xxx xxx"
                    className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="email@domain.com"
                    className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tỉnh/Thành phố
                  </label>
                  <select
                    id="province"
                    className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Chọn</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="hochiminh">Hồ Chí Minh</option>
                    <option value="danang">Đà Nẵng</option>
                    <option value="haiphong">Hải Phòng</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện
                  </label>
                  <select
                    id="city"
                    className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Chọn</option>
                    <option value="caugiay">Cầu Giấy</option>
                    <option value="thanhxuan">Thanh Xuân</option>
                    <option value="binhthanh">Bình Thạnh</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ chi tiết
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
                />
              </div>
            </div>
          </section>

          <div className="my-1 bg-gray-300 w-full h-[1px]"></div>

          {/* Payment Method */}
          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">Phương thức thanh toán</h3>
            <div className="space-y-2">
              {/* Momo */}
              <button
                onClick={() => setPaymentMethod('momo')}
                className={`w-full h-[50px] bg-[#A50064] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-white transition ${
                  paymentMethod === 'momo' ? 'outline-pink-cl outline outline-4' : ''
                }`}
              >
                <img src="/images/logo/momo.png" alt="Momo" className="h-8 w-8" />
                <span className="font-medium">Thanh toán với Momo</span>
              </button>

              <button
                onClick={() => setPaymentMethod('zalo')}
                className={`w-full h-[50px] bg-[#0144DB] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-white transition ${
                  paymentMethod === 'zalo' ? 'outline-pink-cl outline outline-4' : ''
                }`}
              >
                <img src="/images/logo/zalo.png" alt="Zalo" className="h-8 w-8" />
                <span className="font-medium">Thanh toán với Zalo</span>
              </button>

              {/* Cash on Delivery */}
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`w-full h-[45px] bg-white text-white flex items-center justify-center gap-2 rounded-xl border-2 border-white shadow-lg transition ${
                  paymentMethod === 'cod' ? 'outline-pink-cl outline outline-4' : ''
                }`}
              >
                <Banknote size={26} className="text-green-600" />
                <span className="font-medium text-gray-900">Thanh toán khi nhận hàng</span>
              </button>
            </div>
          </section>

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
