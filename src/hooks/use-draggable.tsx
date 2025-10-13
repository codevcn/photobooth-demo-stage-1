import { useState, useRef, useEffect } from 'react'

type Position = { x: number; y: number }

export default function useDraggable(initialPosition: Position = { x: 100, y: 100 }) {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [dragging, setDragging] = useState<boolean>(false)
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  // --- CHUỘT ---
  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    })
  }

  const handleMouseUp = () => setDragging(false)

  // --- CẢM ỨNG ---
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    setDragging(true)
    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging) return
    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y,
    })
  }

  const handleTouchEnd = () => setDragging(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

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
  }, [dragging, offset, position])

  return { ref, position }
}
