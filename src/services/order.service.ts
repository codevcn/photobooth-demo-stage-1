import { apiClient } from '@/lib/api-client'
import { TProductInCart } from '@/utils/types/global'

// Request body types based on Postman collection
export type CreateOrderRequest = {
  store_code: string
  items: {
    variant_id: number
    surface_id: number
    quantity: number
    editor_state_json: Record<string, unknown>
    file_url: string
  }[]
  shipping_amount: number
  customer: {
    name: string
    email: string
    phone: string
  }
  shipping_address: {
    address1: string
    city: string
    province: string
    postcode: string
    country: string
  }
  voucher_code?: string
  note?: string
  domain_snapshot: string
  payment_method: 'momo' | 'zalo' | 'cod'
}

export type CreateOrderResponse = {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
}

class OrderService {
  /**
   * Create order - Send cart items + shipping info to server
   */
  async createOrder(
    productsInCart: TProductInCart[],
    shippingInfo: CreateOrderRequest['customer'] & {
      address: string
      province: string
      city: string
      message?: string
    },
    paymentMethod: 'momo' | 'zalo' | 'cod',
    voucherCode?: string
  ): Promise<CreateOrderResponse> {
    // Transform cart data to API format
    const items = productsInCart.flatMap((product) =>
      product.mockupDataList.map((mockup) => ({
        variant_id: parseInt(product.id) || 1, // Fallback to 1 if not number
        surface_id: 1, // Default surface
        quantity: 1,
        editor_state_json: mockup.elementsVisualState as Record<string, unknown>,
        file_url: mockup.dataURL, // Base64 image data URL
      }))
    )

    const requestBody: CreateOrderRequest = {
      store_code: 'photoism-hn', // Default store
      items,
      shipping_amount: 30000, // Fixed shipping fee
      customer: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
      shipping_address: {
        address1: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        postcode: '100000', // Default postcode
        country: 'VN',
      },
      voucher_code: voucherCode || '',
      note: shippingInfo.message || '',
      domain_snapshot: window.location.hostname,
      payment_method: paymentMethod,
    }

    const response = await apiClient.post<CreateOrderResponse, CreateOrderRequest>(
      '/orders',
      requestBody
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create order')
    }

    return response.data
  }

  async mockCreateOrder(...p: any): Promise<CreateOrderResponse> {
    await new Promise((resolve) => setTimeout(() => resolve(true), 500)) // Simulate delay
    return {
      id: 12345,
      order_number: 'PSHOP-67890',
      total_amount: 250000,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
  }

  async submitOrder(): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 1000))
  }
}

export const orderService = new OrderService()
