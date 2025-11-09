import React, { useEffect, useRef, useState } from 'react'

interface AaState {
  x: number
  y: number
  scale: number
  width: number
  height: number
  visible: boolean
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const aaImageRef = useRef<HTMLImageElement | null>(null)

  const [aaState, setAaState] = useState<AaState>({
    x: 80,
    y: 80,
    scale: 1,
    width: 200,
    height: 200,
    visible: false,
  })

  // flag resize + vị trí chạm trước đó
  const isResizingRef = useRef<boolean>(false)
  const lastTouchXRef = useRef<number>(0)

  // load ảnh nền 1 lần
  useEffect(() => {
    const bg = new Image()
    bg.src = '/bg.jpg' // đổi đường dẫn nếu bạn để chỗ khác
    bg.onload = () => {
      bgImageRef.current = bg
      draw()
    }
  }, [])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // setup size + scale để không mờ
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    // clear
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // vẽ ảnh nền
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, displayWidth, displayHeight)
    } else {
      ctx.fillStyle = '#ddd'
      ctx.fillRect(0, 0, displayWidth, displayHeight)
    }

    // vẽ ảnh AA
    if (aaState.visible && aaImageRef.current) {
      const { x, y, scale, width, height } = aaState
      const drawW = width * scale
      const drawH = height * scale

      ctx.drawImage(aaImageRef.current, x, y, drawW, drawH)

      // vẽ handle
      const handleSize = 22
      const handleX = x + drawW - handleSize
      const handleY = y + drawH - handleSize
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(handleX, handleY, handleSize, handleSize)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.strokeRect(handleX, handleY, handleSize, handleSize)

      // đường chéo
      ctx.beginPath()
      ctx.moveTo(handleX + 5, handleY + handleSize - 5)
      ctx.lineTo(handleX + handleSize - 5, handleY + 5)
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    }
  }

  // vẽ lại khi aaState đổi
  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aaState])

  // chọn ảnh từ thiết bị
  const handleChooseImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      aaImageRef.current = img

      const baseW = 200
      const ratio = img.width ? baseW / img.width : 1

      setAaState((prev) => ({
        ...prev,
        width: img.width,
        height: img.height,
        scale: ratio,
        visible: true,
      }))

      draw()
    }
    img.src = URL.createObjectURL(file)
  }

  // kiểm tra có chạm vào handle không
  const isOnHandle = (clientX: number, clientY: number): boolean => {
    const { x, y, scale, width, height, visible } = aaState
    if (!visible) return false

    const canvas = canvasRef.current
    if (!canvas) return false

    const rect = canvas.getBoundingClientRect()
    const localX = clientX - rect.left
    const localY = clientY - rect.top

    const drawW = width * scale
    const drawH = height * scale
    const handleSize = 22
    const handleX = x + drawW - handleSize
    const handleY = y + drawH - handleSize

    return (
      localX >= handleX &&
      localX <= handleX + handleSize &&
      localY >= handleY &&
      localY <= handleY + handleSize
    )
  }

  // TOUCH
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    const { clientX, clientY } = touch

    if (isOnHandle(clientX, clientY)) {
      isResizingRef.current = true
      lastTouchXRef.current = clientX
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isResizingRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    const { clientX } = touch

    const deltaX = clientX - lastTouchXRef.current
    lastTouchXRef.current = clientX

    setAaState((prev) => {
      let newScale = prev.scale + deltaX * 0.005
      if (newScale < 0.1) newScale = 0.1
      if (newScale > 5) newScale = 5
      return { ...prev, scale: newScale }
    })

    e.preventDefault()
  }

  const handleTouchEnd = () => {
    isResizingRef.current = false
  }

  // MOUSE (test PC)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isOnHandle(e.clientX, e.clientY)) {
      isResizingRef.current = true
      lastTouchXRef.current = e.clientX
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isResizingRef.current) return
    const deltaX = e.clientX - lastTouchXRef.current
    lastTouchXRef.current = e.clientX

    setAaState((prev) => {
      let newScale = prev.scale + deltaX * 0.005
      if (newScale < 0.1) newScale = 0.1
      if (newScale > 5) newScale = 5
      return { ...prev, scale: newScale }
    })
  }

  const handleMouseUp = () => {
    isResizingRef.current = false
  }

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: '#111',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>📷 Mobile Image Editor (TSX - bước 1)</h2>

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          color: '#111',
          padding: '8px 14px',
          borderRadius: 999,
          width: 'fit-content',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        + Chọn ảnh AA
        <input
          type="file"
          accept="image/*"
          onChange={handleChooseImage}
          style={{ display: 'none' }}
        />
      </label>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: '1px solid #333',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '70vh',
            touchAction: 'none',
            background: '#222',
            display: 'block',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <p style={{ fontSize: 12, opacity: 0.6 }}>
        👉 Chọn ảnh, chạm góc phải dưới và kéo sang phải/trái để zoom.
      </p>
    </div>
  )
}

export default App
