import { delay } from '@/utils/helpers'

export type PaymentQRResponse = {
  qr_code_url: string
  expires_in: number // seconds
  transaction_id: string
}

class PaymentService {
  async pollingPaymentStatus(): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 1000))
  }

  /**
   * Get payment QR code for Momo/Zalo
   * Mock implementation - should call real API in production
   */
  async getPaymentQR(
    orderId: string,
    paymentMethod: 'momo' | 'zalo',
    amount: number
  ): Promise<PaymentQRResponse> {
    // Simulate API call delay
    await delay(1500)

    // Mock QR code response
    return {
      qr_code_url: '/images/QR.png', // Mock QR code image
      expires_in: 600, // 10 minutes
      transaction_id: `TXN-${Date.now()}`,
    }

    // Real implementation would be:
    // const response = await apiClient.post<PaymentQRResponse>('/payment/qr', {
    //   order_id: orderId,
    //   payment_method: paymentMethod,
    //   amount,
    // })
    // if (!response.success || !response.data) {
    //   throw new Error(response.error || 'Failed to get payment QR')
    // }
    // return response.data
  }
}

export const paymentService = new PaymentService()
