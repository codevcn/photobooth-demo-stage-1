class PaymentService {
  async pollingPaymentStatus(): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 1000))
  }
}

export const paymentService = new PaymentService()
