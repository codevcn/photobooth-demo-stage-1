import { forwardRef, useEffect, useState } from 'react'
import { addressService } from '@/services/address.service'
import { TAddressProvinceItem } from '@/utils/types/api'

type TFormErrors = {
  fullName?: string
  phone?: string
  email?: string
  province?: string
  city?: string
  address?: string
}

interface ShippingInfoFormProps {
  errors: TFormErrors
}

export const ShippingInfoForm = forwardRef<HTMLFormElement, ShippingInfoFormProps>(
  ({ errors }, ref) => {
    const [provinces, setProvinces] = useState<TAddressProvinceItem[]>([])
    const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false)
    const [hasFetchedOnce, setHasFetchedOnce] = useState<boolean>(false)

    // Fetch provinces function
    const fetchProvinces = async () => {
      if (isLoadingProvinces) return // Prevent duplicate fetch while loading
      setIsLoadingProvinces(true)
      try {
        const data = await addressService.fetchProvinces()
        // Remove duplicates based on province_code
        const uniqueProvinces = Array.from(
          new Map(data.map((item) => [item.province_code, item])).values()
        )
        setProvinces(uniqueProvinces)
        setHasFetchedOnce(true)
      } catch (error) {
        console.error('Failed to fetch provinces:', error)
      } finally {
        setIsLoadingProvinces(false)
      }
    }

    // Fetch on mount (ngầm)
    useEffect(() => {
      fetchProvinces()
    }, [])

    // Fetch again when user opens the select
    const handleProvinceSelectFocus = () => {
      if (hasFetchedOnce) {
        fetchProvinces() // Fetch lại cho chắc
      }
    }

    return (
      <form className="space-y-2" ref={ref}>
        <h3 className="font-semibold text-gray-900 text-lg">Thông tin giao hàng</h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="fullName-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ và tên
            </label>
            <input
              id="fullName-input"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                id="phone-input"
                name="phone"
                type="tel"
                placeholder="09xx xxx xxx"
                className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="email@domain.com"
                className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
              />
              {errors.email && <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="province-input"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tỉnh/Thành phố
              </label>
              <select
                id="province-input"
                name="province"
                onFocus={handleProvinceSelectFocus}
                className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all bg-white"
                disabled={isLoadingProvinces && provinces.length === 0}
              >
                <option value="">
                  {isLoadingProvinces && provinces.length === 0
                    ? 'Đang tải...'
                    : 'Chọn tỉnh/thành phố'}
                </option>
                {provinces.map((province) => (
                  <option key={province.province_code} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.province}</p>
              )}
            </div>

            <div>
              <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện
              </label>
              <select
                id="city-input"
                name="city"
                className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all bg-white"
              >
                <option value="">Chọn</option>
                <option value="caugiay">Cầu Giấy</option>
                <option value="thanhxuan">Thanh Xuân</option>
                <option value="binhthanh">Bình Thạnh</option>
              </select>
              {errors.city && <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.city}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ chi tiết
            </label>
            <input
              id="address-input"
              name="address"
              type="text"
              placeholder="Số nhà, tên đường, phường/xã..."
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
            />
            {errors.address && <p className="text-red-600 text-sm mt-0.5 pl-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 mb-1">
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              id="message-input"
              name="message"
              placeholder="Nhập lời nhắn của bạn..."
              rows={2}
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-cl focus:border-transparent transition-all"
            ></textarea>
          </div>
        </div>
      </form>
    )
  }
)

ShippingInfoForm.displayName = 'ShippingInfoForm'

export type { TFormErrors }
