import { useState, useRef, useEffect } from 'react'

type TPosition = { x: number; y: number }

interface UseDraggableOptions {
  initialPosition?: TPosition
  disabled?: boolean // Thêm option để disable dragging
}

export const useDragElement = (options: UseDraggableOptions = {}) => {
  const { initialPosition = { x: 100, y: 100 }, disabled = false } = options

  const [position, setPosition] = useState<TPosition>(initialPosition)
  const [dragging, setDragging] = useState<boolean>(false)
  const [offset, setOffset] = useState<TPosition>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  // --- CHUỘT ---
  const handleMouseDown = (e: MouseEvent) => {
    if (disabled) return // Chặn nếu disabled

    e.stopPropagation()
    setDragging(true)
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && !disabled) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      })
    }
  }

  const handleMouseUp = () => {
    if (!disabled) {
      setDragging(false)
    }
  }

  // --- CẢM ỨNG ---
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return // Chặn nếu disabled

    const touch = e.touches[0]
    setDragging(true)
    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (dragging && !disabled) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      })
    }
  }

  const handleTouchEnd = () => {
    if (!disabled) {
      setDragging(false)
    }
  }

  useEffect(() => {
    const el = ref.current
    if (el) {
      el.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      el.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        el.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)

        el.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [dragging, offset, position, disabled])

  return { ref, position }
}
