import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { getInitialContants } from '@/utils/contants'
import { formatNumberWithCommas, formatTime } from '@/utils/helpers'
import { TEndOfPaymentData, TPaymentType } from '@/utils/types/global'
import { X, Check, TruckElectric, ArrowLeft } from 'lucide-react'
import { paymentService } from '@/services/payment.service'
import { TOrderStatusRes } from '@/utils/types/api'
import { toast } from 'react-toastify'

interface TQRCanvasProps {
  value: string
  size?: number
}

const QRCanvas = ({ value, size = 200 }: TQRCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(canvasRef.current, value, { width: size }, (error) => {
      if (error) console.error(error)
    })
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}

const getColorByPaymentMethod = (method: TPaymentType): string => {
  switch (method) {
    case 'momo':
      return getInitialContants<string>('PAYMENT_MOMO_COLOR')
    case 'zalo':
      return getInitialContants<string>('PAYMENT_ZALO_COLOR')
    default:
      return getInitialContants<string>('PAYMENT_COD_COLOR')
  }
}

type TPaymentStatus = {
  status: 'pending' | 'completed' | 'failed'
  reason?: string
}

interface EndOfPaymentProps {
  data: TEndOfPaymentData
}

export const EndOfPayment: React.FC<EndOfPaymentProps> = ({ data }) => {
  const { total, countdownInSeconds, QRCode, paymentMethod, orderHashCode } = data
  const { method, title } = paymentMethod
  const colorByPaymentMethod = getColorByPaymentMethod(method)
  const containerRef = useRef<HTMLDivElement>(null)
  const [paymentStatus, setPaymentStatus] = useState<TPaymentStatus>({ status: 'pending' })
  const { status, reason } = paymentStatus
  const [transactionCode, setTransactionCode] = useState<string>('')

  const countdownHandler = () => {
    if (!containerRef.current) return

    const countdownEl = containerRef.current.querySelector<HTMLElement>('.NAME-countdown')
    if (!countdownEl) return

    let remaining = countdownInSeconds
    countdownEl.textContent = formatTime(remaining)

    const interval = setInterval(() => {
      remaining -= 1

      if (remaining <= 0) {
        countdownEl.textContent = '00:00'
        clearInterval(interval)
        return
      }

      countdownEl.textContent = formatTime(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }

  const backToEditPage = () => {
    window.location.href = '/edit'
  }

  const handlePaymentStatusUpdate = (statusData: TOrderStatusRes) => {
    console.log('>>> Payment status update:', statusData)

    if (statusData.is_paid) {
      setPaymentStatus({ status: 'completed' })
      setTransactionCode(statusData.id.toString())
    } else if (statusData.status === 'cancelled') {
      setPaymentStatus({
        status: 'failed',
        reason: 'Đơn hàng đã bị hủy',
      })
    }
  }

  const handlePaymentStatusError = (error: Error) => {
    console.error('>>> Payment status error:', error)
    toast.error('Có lỗi xảy ra khi kiểm tra trạng thái thanh toán')
    // Optionally show error to user or retry
  }

  useEffect(() => {
    return countdownHandler()
  }, [countdownInSeconds])

  // Start payment status polling for online payment methods
  useEffect(() => {
    if ((method === 'momo' || method === 'zalo') && orderHashCode) {
      const stopPolling = paymentService.startPaymentStatusPolling(
        orderHashCode,
        handlePaymentStatusUpdate,
        handlePaymentStatusError
      )

      // Cleanup: stop polling when component unmounts
      return () => {
        stopPolling()
      }
    }
  }, [method, orderHashCode])

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center px-2 py-4">
      <div className="relative bg-white rounded-2xl shadow flex flex-col items-center w-full p-4 border-2 border-gray-200">
        <div className="flex gap-2 justify-between items-start w-full min-w-[280px]">
          <p className="text-base text-gray-800 font-bold mb-4">Tổng tiền</p>
          <p className="text-3xl font-bold text-red-600 mb-1">
            <span>{formatNumberWithCommas(total)}</span>
            <span> VND</span>
          </p>
        </div>

        <div className="w-full bg-gray-200 h-[2px] my-2"></div>

        {method === 'momo' || method === 'zalo' ? (
          status === 'completed' ? (
            <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
              <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-green-600">
                <Check size={50} className="text-white" strokeWidth={6} />
              </div>
              <div className="text-gray-800 mt-4 w-full text-center">
                <p>
                  <span>Đã hoàn tất thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                <p>Cám ơn bạn đã sử dụng dịch vụ!</p>
                {transactionCode && (
                  <p className="p-1 rounded-md bg-light-pink-cl mt-1">
                    Mã giao dịch của bạn là <span className="font-bold">{transactionCode}</span>
                  </p>
                )}
                {orderHashCode && (
                  <p className="p-1 rounded-md bg-superlight-pink-cl mt-1">
                    Mã đơn hàng: <span className="font-bold">{orderHashCode}</span>
                  </p>
                )}
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
              <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-red-600">
                <X size={50} className="text-white" strokeWidth={6} />
              </div>
              <div className="text-red-600 mt-4 w-full text-center">
                <p>
                  <span>Thanh toán không thành công với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                {reason && (
                  <p>
                    Lý do: <span>{reason}</span>.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div
                className="my-4 p-6 rounded-md"
                style={{ backgroundColor: colorByPaymentMethod }}
              >
                <QRCanvas value={QRCode} size={160} />
              </div>
              <div className="text-base text-black font-bold text-center">
                <p className="mb-1">
                  <span>Mã QR hết hạn sau </span>
                  <span className="NAME-countdown">{formatTime(countdownInSeconds)}</span>
                </p>
                <p className="text-center">
                  <span>Quét mã QR để thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
              </div>
            </>
          )
        ) : (
          <div className="flex flex-col items-center pt-4 pb-2 px-4 w-full">
            <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full">
              <TruckElectric size={50} className="text-pink-cl" strokeWidth={3} />
            </div>
            <div className="text-center text-gray-800 text-base font-medium mt-4">
              <p>Cám ơn bạn đã sử dụng dịch vụ!</p>
              <p>Đơn hàng hiện đang được xử lý và sẽ được giao đến bạn trong thời gian sớm nhất.</p>
            </div>
          </div>
        )}
      </div>

      {(method === 'cod' || status === 'completed' || status === 'failed') && (
        <button
          onClick={backToEditPage}
          className="flex items-center gap-2 mt-4 text-pink-cl font-bold active:underline"
        >
          <ArrowLeft size={20} color="currentColor" />
          <span>Quay về trang chỉnh sửa</span>
        </button>
      )}
    </div>
  )
}
