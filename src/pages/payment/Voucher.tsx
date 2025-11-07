import { useState, useEffect } from 'react'
import { Tag, X, Loader2 } from 'lucide-react'
import { voucherService } from '@/services/voucher.service'
import { TVoucher } from '@/utils/types'

interface VoucherSectionProps {
  orderSubtotal: number
  onVoucherApplied: (voucher: TVoucher | null, discount: number) => void
}

export const VoucherSection = ({ orderSubtotal, onVoucherApplied }: VoucherSectionProps) => {
  const [discountCode, setDiscountCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<TVoucher | null>(null)
  const [discountMessage, setDiscountMessage] = useState('')
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
      setDiscountMessage('✗ Vui lòng nhập mã giảm giá')
      return
    }

    setIsApplyingVoucher(true)
    setDiscountMessage('')

    try {
      const result = await voucherService.checkVoucherValidity(discountCode.trim(), orderSubtotal)

      if (result.success && result.voucher) {
        setAppliedVoucher(result.voucher)
        setDiscountMessage(result.message)

        // Tính discount và notify parent component
        const discount = voucherService.calculateDiscount(orderSubtotal, result.voucher)
        onVoucherApplied(result.voucher, discount)
      } else {
        setAppliedVoucher(null)
        setDiscountMessage(result.message)
        onVoucherApplied(null, 0)
      }
    } catch (error) {
      setAppliedVoucher(null)
      setDiscountMessage('✗ Có lỗi xảy ra khi kiểm tra mã giảm giá')
      onVoucherApplied(null, 0)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  // Hàm xóa voucher
  const removeVoucher = () => {
    setAppliedVoucher(null)
    setDiscountCode('')
    setDiscountMessage('')
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

      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isApplyingVoucher && applyVoucher()}
          placeholder="Nhập mã khuyến mãi"
          disabled={!!appliedVoucher || isApplyingVoucher}
          className="flex-1 h-[40px] w-[100px] px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
          className={`mt-2 text-sm ${
            discountMessage.startsWith('✓') ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {discountMessage}
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
