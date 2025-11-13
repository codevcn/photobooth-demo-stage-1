import { postCreateOrder } from '@/configs/api/order.api'
import { TCreateOrderReq, TOrderResponse } from '@/utils/types/api'
import { TProductInCart, TShippingInfo } from '@/utils/types/global'

class OrderService {
  /**
   * Create order - Convert cart items to API format and submit
   */
  async createOrder(
    productsInCart: TProductInCart[],
    shippingInfo: TShippingInfo,
    voucherCode?: string
  ): Promise<TOrderResponse> {
    // Transform cart data to API format
    const items: TCreateOrderReq['items'] = []
    for (const product of productsInCart) {
      for (const mockupData of product.mockupDataList) {
        const mockupImageSize = mockupData.imageData.size
        items.push({
          variant_id: product.productImageId,
          quantity: 1, // Each mockup is 1 item
          surfaces: [
            {
              surface_id: mockupData.surfaceInfo.id,
              editor_state_json: mockupData.elementsVisualState,
              file_url: mockupData.imageData.dataUrl, // Base64 data URL of the mockup image
              width_px: mockupImageSize.width,
              height_px: mockupImageSize.height,
            },
          ],
        })
      }
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
