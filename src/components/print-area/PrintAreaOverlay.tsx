import React, { useCallback } from 'react'

type TPrintAreaOverlayProps = {
  overlayRef: React.RefObject<HTMLDivElement>
  printAreaRef: React.RefObject<HTMLDivElement>
  isOutOfBounds: boolean
  selectedColor: string
}

export const PrintAreaOverlay: React.FC<TPrintAreaOverlayProps> = ({
  overlayRef,
  printAreaRef,
  isOutOfBounds,
  selectedColor,
}) => {
  const initLineColor = useCallback((inputColor: string) => {
    const BLUE_WEAK_COLORS = new Set<string>([
      // Blue (gần #3B82F6)
      '#3b82f6',
      '#3a7ff0',
      '#4c8cf6',
      '#3375e0',
      '#2f6fd1',
      '#4b91fa',

      // Blue shades
      '#1d4ed8',
      '#1e3a8a',
      '#60a5fa',
      '#93c5fd',
      '#2563eb',

      // Cyan / Sky (tương tự hue)
      '#0ea5e9',
      '#06b6d4',
      '#0284c7',
      '#38bdf8',

      // Indigo
      '#6366f1',
      '#4f46e5',
      '#818cf8',

      // Highly saturated blues
      '#00a2ff',
      '#0090f5',
      '#0080d8',
    ])

    return BLUE_WEAK_COLORS.has(inputColor.trim().toLowerCase()) ? '#F97316' : '#3b82f6' // orange-500 : blue-500
  }, [])

  return (
    <>
      {/* Print Area Indicator */}
      <div
        ref={printAreaRef}
        className="absolute border-2 border-dashed bg-blue-50/20 pointer-events-none z-[30] transition-all duration-300"
        style={{
          opacity: isOutOfBounds ? 0.9 : 0.4,
          backgroundColor: isOutOfBounds ? 'rgba(239, 68, 68, 0.1)' : 'rgba(96, 165, 250, 0.1)',
          borderColor: isOutOfBounds ? '#ef4444' : initLineColor(selectedColor),
        }}
      >
        <div
          className="absolute -top-6 left-0 text-white text-xs px-2 py-1 rounded font-medium transition-colors duration-300 pointer-events-none z-5"
          style={{
            backgroundColor: isOutOfBounds ? '#ef4444' : '#3b82f6',
          }}
        >
          {isOutOfBounds ? 'Ngoài vùng in!' : 'Vùng in'}
        </div>
      </div>

      {/* Overlay for out of bounds warning */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none z-[20] transition-all duration-500"
        style={{
          opacity: 0,
          backgroundColor: isOutOfBounds
            ? `
            linear-gradient(135deg, 
              rgba(239, 68, 68, 0.15) 0%, 
              rgba(239, 68, 68, 0.08) 25%,
              rgba(239, 68, 68, 0.15) 50%,
              rgba(239, 68, 68, 0.08) 75%,
              rgba(239, 68, 68, 0.15) 100%
            )
          `
            : 'transparent',
          backgroundSize: '40px 40px',
          animation: isOutOfBounds ? 'print-area-warning 3s ease-in-out infinite' : 'none',
        }}
      >
        {/* Dimming effect for areas outside print zone */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: `
              radial-gradient(
                ellipse at center,
                transparent 20%,
                rgba(0, 0, 0, 0.1) 40%,
                rgba(0, 0, 0, 0.3) 70%,
                rgba(0, 0, 0, 0.5) 100%
              )
            `,
            opacity: isOutOfBounds ? 0.8 : 0,
          }}
        />
      </div>
    </>
  )
}
