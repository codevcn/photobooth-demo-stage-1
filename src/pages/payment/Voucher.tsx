import { useState, useEffect } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { voucherService } from '@/services/voucher.service'
import { TVoucher } from '@/utils/types/global'

interface VoucherSectionProps {
  orderSubtotal: number
  onVoucherApplied: (voucher: TVoucher | null, discount: number) => void
}

type TDiscountMessage = {
  message: string
  status: 'success' | 'error'
}

export const VoucherSection = ({ orderSubtotal, onVoucherApplied }: VoucherSectionProps) => {
  const [discountCode, setDiscountCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<TVoucher | null>(null)
  const [discountMessage, setDiscountMessage] = useState<TDiscountMessage>()
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [isFetchingVouchers, setIsFetchingVouchers] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<TVoucher[]>([])

  // Fetch danh sách voucher có sẵn
  const fetchSomeVouchers = async () => {
    setIsFetchingVouchers(true)
    try {
      const vouchers = await voucherService.getSomeVouchers()
      setAvailableVouchers(vouchers)
    } catch (error) {
      console.error('Error fetching vouchers:', error)
      setAvailableVouchers([])
    } finally {
      setIsFetchingVouchers(false)
    }
  }

  // Hàm áp dụng voucher
  const applyVoucher = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage({ message: 'Vui lòng nhập mã giảm giá', status: 'error' })
      return
    }

    setIsApplyingVoucher(true)
    setDiscountMessage(undefined)

    try {
      const result = await voucherService.checkVoucherValidity(discountCode.trim(), orderSubtotal)

      if (result.success && result.voucher) {
        setAppliedVoucher(result.voucher)
        setDiscountMessage({ message: result.message, status: 'success' })

        // Tính discount và notify parent component
        const discount = voucherService.calculateDiscount(orderSubtotal, result.voucher)
        onVoucherApplied(result.voucher, discount)
      } else {
        setAppliedVoucher(null)
        setDiscountMessage({ message: result.message, status: 'error' })
        onVoucherApplied(null, 0)
      }
    } catch (error) {
      setAppliedVoucher(null)
      setDiscountMessage({ message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá', status: 'error' })
      onVoucherApplied(null, 0)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  // Hàm xóa voucher
  const removeVoucher = () => {
    setAppliedVoucher(null)
    setDiscountCode('')
    setDiscountMessage(undefined)
    onVoucherApplied(null, 0)
  }

  useEffect(() => {
    fetchSomeVouchers()
  }, [])

  // Update discount khi orderSubtotal thay đổi (nếu đã apply voucher)
  useEffect(() => {
    if (appliedVoucher) {
      const discount = voucherService.calculateDiscount(orderSubtotal, appliedVoucher)
      onVoucherApplied(appliedVoucher, discount)
    }
  }, [orderSubtotal, appliedVoucher])

  return (
    <section className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={18} className="text-pink-cl" />
        <h2 className="font-semibold text-gray-900">Mã giảm giá</h2>
      </div>

      {/* Applied Voucher Display */}
      {appliedVoucher && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-green-700">{appliedVoucher.code}</span>
                <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
                  Đã áp dụng
                </span>
              </div>
              <p className="text-sm text-green-600">{appliedVoucher.description}</p>
            </div>
            <button
              onClick={removeVoucher}
              className="p-1 text-green-600 hover:text-green-800 transition"
              aria-label="Xóa voucher"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 w-full md:flex-col md:items-end">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isApplyingVoucher && applyVoucher()}
          placeholder="Nhập mã khuyến mãi"
          disabled={!!appliedVoucher || isApplyingVoucher}
          className="flex-1 h-[40px] w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={applyVoucher}
          disabled={!!appliedVoucher || isApplyingVoucher}
          className="h-[40px] px-6 bg-pink-cl text-white font-medium rounded-xl active:scale-95 transition shadow-sm w-max disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isApplyingVoucher ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <span>Áp dụng</span>
          )}
        </button>
      </div>
      {discountMessage && !appliedVoucher && (
        <p
          className={`mt-2 text-sm flex items-center gap-1 ${
            discountMessage.status === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {discountMessage.status === 'success' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-circle-icon lucide-check-circle"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-triangle-alert-icon lucide-triangle-alert"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          )}
          <span>{discountMessage.message}</span>
        </p>
      )}

      {/* Voucher Suggestions */}
      {!appliedVoucher && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Mã khuyến mãi có sẵn:</p>

          {isFetchingVouchers ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={20} className="animate-spin text-pink-cl" />
              <span className="text-sm text-gray-500">Đang tải mã giảm giá...</span>
            </div>
          ) : availableVouchers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableVouchers.map((voucher) => (
                <button
                  key={voucher.code}
                  onClick={() => {
                    setDiscountCode(voucher.code)
                  }}
                  disabled={isApplyingVoucher}
                  className="text-xs px-2 py-1 bg-pink-50 text-pink-cl border border-pink-200 rounded-md hover:bg-pink-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {voucher.code}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">Không có mã giảm giá nào</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
