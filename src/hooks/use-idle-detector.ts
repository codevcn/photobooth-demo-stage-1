import { isHomePage } from '@/utils/helpers'
import { useEffect, useRef, useState } from 'react'

type TUseIdleDetectorOptions = {
  idleTimeout: number // Thời gian không hoạt động (ms)
  warningTimeout: number // Thời gian cảnh báo (ms)
  onIdle: () => void // Callback khi hết thời gian cảnh báo
}

/**
 * Hook phát hiện user không hoạt động (toàn cục)
 * - Đếm ngược từ idleTimeout, reset khi user chạm màn hình
 * - Khi hết thời gian, hiện modal cảnh báo trong warningTimeout
 * - Nếu không xác nhận, gọi onIdle callback
 */
export const useIdleDetector = ({
  idleTimeout,
  warningTimeout,
  onIdle,
}: TUseIdleDetectorOptions) => {
  const [showWarning, setShowWarning] = useState(false)
  const [warningCountdown, setWarningCountdown] = useState(0)

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const showWarningRef = useRef(false)

  // Reset idle timer
  const resetIdleTimer = () => {
    // Clear existing timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    if (warningCountdownIntervalRef.current) {
      clearInterval(warningCountdownIntervalRef.current)
    }

    // Reset states
    setShowWarning(false)
    showWarningRef.current = false
    setWarningCountdown(0)

    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      showWarningRef.current = true
      const initialCountdown = Math.floor(warningTimeout / 1000)
      setWarningCountdown(initialCountdown)

      // Start countdown interval
      let countdown = initialCountdown
      warningCountdownIntervalRef.current = setInterval(() => {
        countdown -= 1
        setWarningCountdown(countdown)
        if (countdown <= 0) {
          if (warningCountdownIntervalRef.current) {
            clearInterval(warningCountdownIntervalRef.current)
          }
        }
      }, 1000)

      // Start warning timer
      warningTimerRef.current = setTimeout(() => {
        onIdle()
        setShowWarning(false)
      }, warningTimeout)
    }, idleTimeout)
  }

  // User confirms they are still active
  const confirmActive = () => {
    resetIdleTimer()
  }

  // Setup event listeners - chỉ chạy 1 lần khi mount
  useEffect(() => {
    if (isHomePage()) {
      return
    }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleUserActivity = () => {
      // Không reset nếu đang hiển thị warning
      if (showWarningRef.current) return
      resetIdleTimer()
    }

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity)
    })

    // Start initial timer
    resetIdleTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current)
    }
  }, []) // Chỉ chạy 1 lần khi mount

  return {
    showWarning,
    warningCountdown,
    confirmActive,
  }
}
