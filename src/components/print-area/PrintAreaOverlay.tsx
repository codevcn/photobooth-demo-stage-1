import React from 'react'

type TPrintAreaOverlayProps = {
  overlayRef: React.RefObject<HTMLDivElement>
  printAreaRef: React.RefObject<HTMLDivElement>
  isOutOfBounds: boolean
}

export const PrintAreaOverlay: React.FC<TPrintAreaOverlayProps> = ({
  overlayRef,
  printAreaRef,
  isOutOfBounds,
}) => {
  return (
    <>
      {/* Print Area Indicator */}
      <div
        ref={printAreaRef}
        className="absolute border-2 border-dashed border-blue-400 bg-blue-50/20 pointer-events-none z-5 transition-all duration-300"
        style={{
          opacity: isOutOfBounds ? 0.9 : 0.4,
          borderColor: isOutOfBounds ? '#ef4444' : '#60a5fa',
          backgroundColor: isOutOfBounds ? 'rgba(239, 68, 68, 0.1)' : 'rgba(96, 165, 250, 0.1)',
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
        className="absolute inset-0 pointer-events-none z-2 transition-all duration-500"
        style={{
          opacity: 0,
          background: isOutOfBounds
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
            background: `
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
