import { getOrderStatus } from '@/configs/api/order.api'
import { TOrderStatusRes } from '@/utils/types/api'

type TPaymentPollingCallback = (status: TOrderStatusRes) => void

class PaymentService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Start polling payment status every 2 seconds
   * @param orderHashCode - Order hash code to check
   * @param onStatusUpdate - Callback when status is updated
   * @param onError - Callback when error occurs
   * @returns Function to stop polling
   */
  startPaymentStatusPolling(
    orderHashCode: string,
    onStatusUpdate: TPaymentPollingCallback,
    onError?: (error: Error) => void
  ): () => void {
    // Clear existing polling if any
    this.stopPaymentStatusPolling(orderHashCode)

    // Polling function
    const poll = async () => {
      try {
        const response = await getOrderStatus(orderHashCode)
        
        if (!response.success || !response.data?.data) {
          throw new Error(response.error || 'Không thể kiểm tra trạng thái thanh toán')
        }

        const statusData = response.data.data
        onStatusUpdate(statusData)

        // Stop polling if payment is completed or failed
        if (statusData.is_paid || statusData.status === 'cancelled') {
          this.stopPaymentStatusPolling(orderHashCode)
        }
      } catch (error) {
        console.error('>>> Payment status polling error:', error)
        if (onError) {
          onError(error as Error)
        }
      }
    }

    // Start polling every 2 seconds
    const intervalId = setInterval(poll, 2000)
    this.pollingIntervals.set(orderHashCode, intervalId)

    // Initial call
    poll()

    // Return cleanup function
    return () => this.stopPaymentStatusPolling(orderHashCode)
  }

  /**
   * Stop polling for a specific order
   */
  stopPaymentStatusPolling(orderHashCode: string): void {
    const intervalId = this.pollingIntervals.get(orderHashCode)
    if (intervalId) {
      clearInterval(intervalId)
      this.pollingIntervals.delete(orderHashCode)
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((intervalId) => clearInterval(intervalId))
    this.pollingIntervals.clear()
  }
}

export const paymentService = new PaymentService()
