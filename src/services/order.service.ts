import { postCreateOrder } from '@/configs/api/order.api'
import { TCreateOrderReq, TOrderResponse } from '@/utils/types/api'
import { TPaymentProductItem, TShippingInfo } from '@/utils/types/global'

class OrderService {
  /**
   * Create order - Convert cart items to API format and submit
   */
  async createOrder(
    cartItems: TPaymentProductItem[],
    shippingInfo: TShippingInfo,
    voucherCode?: string
  ): Promise<TOrderResponse> {
    // Transform cart data to API format
    const items: TCreateOrderReq['items'] = []
    for (const item of cartItems) {
      if (!item.preSentImageLink) {
        throw new Error('Thiếu đường dẫn hình ảnh đã gửi trước cho dữ liệu mockup')
      }
      items.push({
        variant_id: item.productImageId,
        quantity: item.quantity, // Each mockup is 1 item
        surfaces: [
          {
            surface_id: item.surface.id,
            editor_state_json: item.elementsVisualState,
            file_url: item.preSentImageLink,
            width_px: item.mockupData.widthPx,
            height_px: item.mockupData.heightPx,
          },
        ],
      })
    }

    const requestBody: TCreateOrderReq = {
      store_code: import.meta.env.VITE_STORE_CODE,
      customer: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
      shipping_address: {
        address1: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        postcode: '000000',
        country: 'VN',
      },
      items,
      voucher_code: voucherCode,
      note: shippingInfo.message,
    }

    const response = await postCreateOrder(requestBody)

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể tạo đơn hàng')
    }

    return response.data.data
  }
}

export const orderService = new OrderService()
