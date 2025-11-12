import { TPaymentType } from '@/utils/types'
import { Banknote, Check } from 'lucide-react'

interface PaymentMethodSelectorProps {
  selectedMethod: TPaymentType
  onSelectMethod: (method: TPaymentType) => void
}

export const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) => {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold text-gray-900 text-lg">Phương thức thanh toán</h3>

      <div className="grid-cols-1 grid smd:grid-cols-2 gap-x-2 gap-y-2 smd:gap-y-1">
        {/* Momo */}
        {selectedMethod === 'momo' ? (
          <div className="smd:row-span-2 flex items-center bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-[#A50064] rounded-lg p-2">
                  <img src="/images/logo/momo.png" alt="Momo" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang chọn</p>
                  <p className="font-bold text-gray-900">Thanh toán Momo</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <Check size={18} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('momo')}
            className="w-full h-[50px] bg-[#A50064] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-transparent transition hover:border-pink-200 active:scale-95"
          >
            <img src="/images/logo/momo.png" alt="Momo" className="h-8 w-8" />
            <span className="font-medium">Thanh toán với Momo</span>
          </button>
        )}

        {/* Zalo */}
        {selectedMethod === 'zalo' ? (
          <div className="smd:row-span-2 flex items-center bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-[#0144DB] rounded-lg p-2">
                  <img src="/images/logo/zalo.png" alt="Zalo" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang chọn</p>
                  <p className="font-bold text-gray-900">Thanh toán Zalo</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <Check size={18} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('zalo')}
            className="w-full h-[50px] bg-[#0144DB] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-transparent transition hover:border-pink-200 active:scale-95"
          >
            <img src="/images/logo/zalo.png" alt="Zalo" className="h-8 w-8" />
            <span className="font-medium">Thanh toán với Zalo</span>
          </button>
        )}

        {/* Cash on Delivery */}
        {selectedMethod === 'cod' ? (
          <div className="smd:col-span-2 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-lg p-2">
                  <Banknote size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang chọn</p>
                  <p className="font-bold text-gray-900">Thanh toán khi nhận hàng</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <Check size={18} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('cod')}
            className="w-full h-[45px] bg-white text-gray-900 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 shadow-sm transition hover:border-pink-200 active:scale-95"
          >
            <Banknote size={26} className="text-green-600" />
            <span className="font-medium">Thanh toán khi nhận hàng</span>
          </button>
        )}
      </div>
    </section>
  )
}
