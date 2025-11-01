import { roundZooming } from '@/utils/helpers'
import { useRef, useCallback, useState, useEffect } from 'react'

interface UseElementZoomOptions {
  minZoom?: number // Scale tối thiểu (mặc định 0.3)
  maxZoom?: number // Scale tối đa (mặc định 2)
  sensitivity?: number // Độ nhạy zoom (mặc định 0.01)
  onZoomStart?: () => void // Callback khi bắt đầu zoom
  onZoomEnd?: () => void // Callback khi kết thúc zoom
  currentZoom: number
  setCurrentZoom: React.Dispatch<React.SetStateAction<number>>
}

interface UseElementZoomReturn {
  zoomButtonRef: React.MutableRefObject<HTMLButtonElement | null>
  containerRef: React.MutableRefObject<HTMLElement | null>
  resetZoom: () => void
  isZooming: boolean
}

export const useZoomElement = (options: UseElementZoomOptions): UseElementZoomReturn => {
  const {
    minZoom,
    maxZoom,
    sensitivity = 0.01,
    onZoomStart,
    onZoomEnd,
    currentZoom,
    setCurrentZoom,
  } = options

  // Refs
  const zoomButtonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const isZoomingRef = useRef(false)
  const startXRef = useRef(0)
  const startScaleRef = useRef(1)

  // State
  const [isZooming, setIsZooming] = useState<boolean>(false)

  // Xử lý khi bắt đầu nhấn vào nút zoom
  const handleStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isZoomingRef.current = true
      setIsZooming(true)

      // Gọi callback để thông báo đang zoom
      onZoomStart?.()

      // Lấy vị trí X ban đầu
      if (e instanceof MouseEvent) {
        startXRef.current = e.clientX
      } else {
        startXRef.current = e.touches[0].clientX
      }

      startScaleRef.current = currentZoom

      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    },
    [currentZoom, onZoomStart]
  )

  // Xử lý khi di chuyển
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isZoomingRef.current) return

      e.preventDefault()
      e.stopPropagation()

      // Lấy vị trí X hiện tại
      let currentX: number
      if (e instanceof MouseEvent) {
        currentX = e.clientX
      } else {
        currentX = e.touches[0].clientX
      }

      // Tính độ chênh lệch theo trục X
      const deltaX = currentX - startXRef.current

      // Tính scale mới:
      // - Kéo sang phải (+deltaX) = zoom in (phóng to)
      // - Kéo sang trái (-deltaX) = zoom out (thu nhỏ)
      const newScale = startScaleRef.current + deltaX * sensitivity

      // Giới hạn scale trong khoảng min/max và cập nhật
      let adjustedScale = newScale
      if (minZoom && newScale < minZoom) {
        adjustedScale = minZoom
      }
      if (maxZoom && newScale > maxZoom) {
        adjustedScale = maxZoom
      }
      setCurrentZoom(adjustedScale)
    },
    [sensitivity, minZoom, maxZoom]
  )

  // Xử lý khi thả chuột/tay
  const handleEnd = useCallback(() => {
    isZoomingRef.current = false
    setIsZooming(false)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'

    // Gọi callback để thông báo kết thúc zoom
    onZoomEnd?.()
  }, [onZoomEnd])

  // Reset zoom
  const resetZoom = useCallback(() => {
    setCurrentZoom(currentZoom)
  }, [currentZoom])

  // Effect để đăng ký/hủy sự kiện
  useEffect(() => {
    const button = zoomButtonRef.current
    if (!button) return

    // Đăng ký sự kiện chỉ trên nút zoom
    button.addEventListener('mousedown', handleStart)
    button.addEventListener('touchstart', handleStart, { passive: false })

    // Sự kiện move và end trên document để xử lý khi kéo ra ngoài
    document.body.addEventListener('mousemove', handleMove)
    document.body.addEventListener('touchmove', handleMove, { passive: false })

    document.body.addEventListener('mouseup', handleEnd)
    document.body.addEventListener('touchend', handleEnd)

    // Cleanup
    return () => {
      button.removeEventListener('mousedown', handleStart)
      button.removeEventListener('touchstart', handleStart)

      document.body.removeEventListener('mousemove', handleMove)
      document.body.removeEventListener('touchmove', handleMove)

      document.body.removeEventListener('mouseup', handleEnd)
      document.body.removeEventListener('touchend', handleEnd)

      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [handleStart, handleMove, handleEnd])

  return {
    zoomButtonRef,
    containerRef,
    resetZoom,
    isZooming,
  }
}
