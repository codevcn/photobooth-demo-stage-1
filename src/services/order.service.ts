import { postCreateOrder } from '@/configs/api/order.api'
import { TCreateOrderReq, TCreateOrderRes, TOrderResponse } from '@/utils/types/api'
import { TProductInCart, TShippingInfo } from '@/utils/types/global'

class OrderService {
  async mockCreateOrder(): Promise<TCreateOrderRes> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      order: {
        domain_snapshot: null,
        id: 138,
        partner_id: 1,
        store_id: 1,
        hash_code: 'UL67NSEAPG',
        external_order_id: 'EXT-1762998222660',
        customer_name: 'Nguyễn Anh Tuấn',
        customer_email: 'customer@example.com',
        customer_phone: '+84987794267',
        status: 'pending_payment',
        subtotal_amount: '980000',
        discount_amount: '98000',
        shipping_amount: '15000',
        total_amount: '897000',
        currency: 'VND',
        note: 'Gọi trước khi giao',
        created_at: '2025-11-13T01:43:42.665Z',
        updated_at: '2025-11-13T01:43:42.665Z',
        store: {
          id: 1,
          name: 'Photoism Hanoi',
        },
        items_count: 0,
      },
      store: {
        id: 1,
        code: 'photoism-hn',
        name: 'Photoism Hanoi',
        routes: [
          {
            id: 1,
            path_alias: '/s/photoism-hn',
            custom_domain: 'shop.photoism.vn',
          },
        ],
      },
      address: {
        id: 138,
        order_id: 138,
        address1: '17/21, Lã Xuân Oai, Tăng Nhơn Phú A',
        city: 'Tăng Nhơn Phú A',
        province: 'Thủ Đức',
        postcode: '10000',
        country: 'VN',
        created_at: '2025-11-13T01:43:42.681Z',
      },
      items: [
        {
          id: 155,
          order_id: 138,
          product_id: 1,
          variant_id: 1,
          design_id: 155,
          quantity: 1,
          unit_price_amount: 180000,
          item_note: null,
          created_at: '2025-11-13T01:43:42.695Z',
          product: {
            id: 1,
            name: 'Classic Photobooth Mug',
          },
          variant: {
            id: 1,
            size: '11oz',
            color: 'white',
          },
          design: {
            id: 155,
            surfaces: [
              {
                id: 167,
                surface_id: 1,
                editor_state_json: {
                  text: 'Front',
                },
                file_url: 'https://example.com/design-front.png',
                width_px: 2000,
                height_px: 1400,
                generated_at: '2025-11-13T01:43:42.689Z',
              },
            ],
          },
        },
      ],
      payments: [],
      shipments: [],
      discounts: [
        {
          id: 88,
          order_id: 138,
          discount_id: 1,
          code_snapshot: 'DEMO-VOUCHER',
          type_snapshot: 'percent',
          value_snapshot: 10,
          amount_amount: 98000,
          currency: 'VND',
          applied_at: '2025-11-13T01:43:42.715Z',
        },
      ],
      payment_instructions: [
        {
          id: 135,
          order_id: 138,
          bin: '970422',
          account_number: 'VQRQAFGHB3790',
          account_name: 'LUONG THANH LOI',
          amount: '897000',
          description: 'EXT1762998222660',
          order_code: '1762998222723138',
          currency: 'VND',
          payment_link_id: 'e53d91d508d8460e8fa229e6654b51e5',
          status: 'PENDING',
          checkout_url: 'https://pay.payos.vn/web/e53d91d508d8460e8fa229e6654b51e5',
          qr_code:
            '00020101021238570010A000000727012700069704220113VQRQAFGHB37900208QRIBFTTA530370454068970005802VN62200816EXT17629982226606304E403',
          created_at: '2025-11-13T01:43:43.412Z',
          updated_at: '2025-11-13T01:43:43.412Z',
        },
      ],
    }
  }

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
        if (!mockupData.preSentImageLink) {
          throw new Error('Thiếu đường dẫn hình ảnh đã gửi trước cho dữ liệu mockup')
        }
        const mockupImageSize = mockupData.imageData.size
        items.push({
          variant_id: product.productImageId,
          quantity: 1, // Each mockup is 1 item
          surfaces: [
            {
              surface_id: mockupData.surfaceInfo.id,
              editor_state_json: mockupData.elementsVisualState,
              file_url: mockupData.preSentImageLink,
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
