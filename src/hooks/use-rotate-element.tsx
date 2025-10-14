import { useRef, useCallback, useState, useEffect } from 'react'

interface UseElementRotationOptions {
  sensitivity?: number // Độ nhạy xoay
  initialRotation?: number // Góc xoay ban đầu
}

interface UseElementRotationReturn {
  rotation: number
  handleRef: React.RefObject<HTMLButtonElement>
  resetRotation: () => void
}

export const useRotateElement = (
  options: UseElementRotationOptions = {}
): UseElementRotationReturn => {
  const { sensitivity = 0.5, initialRotation = 0 } = options

  // Refs
  const handleRef = useRef<HTMLButtonElement>(null)
  const isRotatingRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startRotationRef = useRef(0)

  // State
  const [rotation, setRotation] = useState(initialRotation)

  // Xử lý khi bắt đầu nhấn
  const handleStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      isRotatingRef.current = true

      // Lấy vị trí X và Y ban đầu
      if (e instanceof MouseEvent) {
        startXRef.current = e.clientX
        startYRef.current = e.clientY
      } else {
        startXRef.current = e.touches[0].clientX
        startYRef.current = e.touches[0].clientY
      }

      startRotationRef.current = rotation
      document.body.style.cursor = 'grabbing'
    },
    [rotation]
  )

  // Xử lý khi di chuyển
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isRotatingRef.current) return

      e.preventDefault()
      e.stopPropagation()

      // Lấy vị trí X và Y hiện tại
      let currentX: number
      let currentY: number
      if (e instanceof MouseEvent) {
        currentX = e.clientX
        currentY = e.clientY
      } else {
        currentX = e.touches[0].clientX
        currentY = e.touches[0].clientY
      }

      // Tính độ dịch chuyển theo cả 2 chiều
      const deltaX = currentX - startXRef.current
      const deltaY = currentY - startYRef.current

      // Tính góc xoay mới:
      // - Sang phải (+X) = xoay cùng chiều kim đồng hồ
      // - Xuống dưới (+Y) = xoay ngược chiều kim đồng hồ
      // - Lên trên (-Y) = xoay cùng chiều kim đồng hồ
      const combinedDelta = deltaX - deltaY
      const newRotation = startRotationRef.current + combinedDelta * sensitivity
      setRotation(newRotation)
    },
    [sensitivity]
  )

  // Xử lý khi thả chuột/tay
  const handleEnd = useCallback(() => {
    isRotatingRef.current = false
    document.body.style.cursor = 'default'
  }, [])

  // Reset góc xoay
  const resetRotation = useCallback(() => {
    setRotation(initialRotation)
  }, [initialRotation])

  // Effect để đăng ký/hủy sự kiện
  useEffect(() => {
    const handle = handleRef.current
    if (!handle) return

    // Đăng ký sự kiện
    handle.addEventListener('mousedown', handleStart as any)
    handle.addEventListener('touchstart', handleStart as any)

    document.addEventListener('mousemove', handleMove as any)
    document.addEventListener('touchmove', handleMove as any, { passive: false })

    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)

    // Cleanup
    return () => {
      handle.removeEventListener('mousedown', handleStart as any)
      handle.removeEventListener('touchstart', handleStart as any)

      document.removeEventListener('mousemove', handleMove as any)
      document.removeEventListener('touchmove', handleMove as any)

      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)

      document.body.style.cursor = 'default'
    }
  }, [handleStart, handleMove, handleEnd])

  return {
    rotation,
    handleRef,
    resetRotation,
  }
}
