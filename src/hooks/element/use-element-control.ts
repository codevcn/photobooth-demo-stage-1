import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useState } from 'react'

const maxZoom: number = 2
const minZoom: number = 0.3

type TElementState = {
  position: { x: number; y: number }
  scale: number
  angle: number
}

export const useElementControl = (initialPosX?: number, initialPosY?: number) => {
  const [position, setPosition] = useState<TElementState['position']>({
    x: initialPosX || 0,
    y: initialPosY || 0,
  })
  const [scale, setScale] = useState<TElementState['scale']>(1)
  const [angle, setAngle] = useState<TElementState['angle']>(0)
  const { ref: refForPinch } = usePinchElement({
    maxScale: maxZoom,
    minScale: minZoom,
    currentScale: scale,
    setCurrentScale: setScale,
    currentRotation: angle,
    setCurrentRotation: setAngle,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })
  const {
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useRotateElement({
    currentRotation: angle,
    setCurrentRotation: setAngle,
  })
  const {
    zoomButtonRef,
    containerRef: refForZoom,
    isZooming,
  } = useZoomElement({
    maxZoom,
    minZoom,
    currentZoom: scale,
    setCurrentZoom: setScale,
  })
  const { ref: refForDrag } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })

  const handleSetElementState = (posX?: number, posY?: number, scale?: number, angle?: number) => {
    if (posX) {
      setPosition((prev) => ({ ...prev, x: posX }))
    }
    if (posY) {
      setPosition((prev) => ({ ...prev, y: posY }))
    }
    if (scale) {
      setScale(scale)
    }
    if (angle) {
      setAngle(angle)
    }
  }

  return {
    forPinch: {
      ref: refForPinch,
    },
    forRotate: {
      ref: refForRotate,
      isRotating,
      rotateButtonRef,
    },
    forZoom: {
      ref: refForZoom,
      isZooming,
      zoomButtonRef,
    },
    forDrag: {
      ref: refForDrag,
    },
    handleSetElementState,
    state: {
      position,
      angle,
      scale,
    },
  }
}
