import { useCallback, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { qrGetter } from '@/configs/brands/qr-getter'
import { toast } from 'react-toastify'
import { TUserInputImage } from '@/utils/types'

interface QRScannerProps {
  onScanSuccess: (result: TUserInputImage[]) => void
  showCropper: boolean
}

export default function QRScanner({ onScanSuccess, showCropper }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')

  const initializeScanner = useCallback(() => {
    if (!videoRef.current) return
    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (!isScanning) {
          setIsScanning(true)
          qrScanner.stop()
          qrGetter.getImageData(
            result.data,
            (percentage, imageData) => {
              setProgress(percentage)
              if (imageData) {
                onScanSuccess(imageData)
              }
            },
            'photoism'
          )
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    )
    scannerRef.current = qrScanner
    qrScanner.start().catch((error) => {
      console.log('>>> error:', error)
      setError('Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera.')
      toast.error('Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera.')
    })
    return () => {
      qrScanner.stop()
      qrScanner.destroy()
    }
  }, [isScanning, onScanSuccess])

  const stopCamera = useCallback(() => {
    const scanner = scannerRef.current
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }

    // Dừng hẳn stream media (tắt camera vật lý)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    console.log('>>> Camera đã được tắt hoàn toàn.')
  }, [])

  useEffect(() => {
    if (showCropper) {
      stopCamera()
    } else {
      initializeScanner()
    }
  }, [showCropper])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-lg group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          playsInline
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in-down">
            <p className="text-white text-center">{error}</p>
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in-down">
            <div className="w-4/5">
              <div className="bg-white rounded-full h-4 overflow-hidden mb-4 shadow-lg">
                <div
                  className="bg-pink-400 h-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white text-center font-medium animate-pulse">
                <span>Đang xử lý ảnh của bạn...</span>
                <span> {progress}</span>
                <span>%</span>
              </p>
            </div>
          </div>
        )}
        {!isScanning && !error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-pink-400 rounded-lg opacity-30 animate-pulse"></div>
          </div>
        )}
      </div>
      {!isScanning && !error && (
        <p
          className="text-center mt-4 text-gray-600 text-sm animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Hãy đưa mã QR vào khung để quét
        </p>
      )}
    </div>
  )
}
