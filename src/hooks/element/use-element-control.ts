import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useContext, useEffect, useState } from 'react'
import { ElementLayerContext } from '@/context/global-context'
import { swapArrayItems } from '@/utils/helpers'
import { getInitialContants } from '@/utils/contants'
import { TElementLayerState, TElementVisualBaseState } from '@/utils/types'

const fixedMaxZoom: number = 2
const fixedMinZoom: number = 0.3

type TInitialParams = Partial<
  TElementVisualBaseState & {
    maxZoom: number
    minZoom: number
  }
>

type TElementControlReturn = {
  forPinch: {
    ref: React.MutableRefObject<HTMLElement | null>
  }
  forRotate: {
    ref: React.MutableRefObject<HTMLElement | null>
    isRotating: boolean
    rotateButtonRef: React.MutableRefObject<HTMLButtonElement | null>
  }
  forZoom: {
    ref: React.MutableRefObject<HTMLElement | null>
    isZooming: boolean
    zoomButtonRef: React.MutableRefObject<HTMLButtonElement | null>
  }
  forDrag: {
    ref: React.MutableRefObject<HTMLElement | null>
  }
  state: TElementVisualBaseState
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => void
}

export const useElementControl = (
  elementId: string,
  initialParams?: TInitialParams
): TElementControlReturn => {
  const {
    position: { x: initialPosX, y: initialPosY } = {
      x: getInitialContants<number>('ELEMENT_X'),
      y: getInitialContants<number>('ELEMENT_Y'),
    },
    maxZoom,
    minZoom,
    angle: initialAngle = getInitialContants<number>('ELEMENT_ROTATION'),
    scale: initialZoom = getInitialContants<number>('ELEMENT_ZOOM'),
    zindex: initialZindex = getInitialContants<number>('ELEMENT_ZINDEX'),
  } = initialParams || {}
  const { elementLayers, setElementLayers } = useContext(ElementLayerContext)
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosX !== undefined ? initialPosX : getInitialContants<number>('ELEMENT_X'),
    y: initialPosY !== undefined ? initialPosY : getInitialContants<number>('ELEMENT_Y'),
  })
  const [scale, setScale] = useState<TElementVisualBaseState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementVisualBaseState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementVisualBaseState['zindex']>(initialZindex)
  const { ref: refForPinch } = usePinchElement({
    maxScale: maxZoom || fixedMaxZoom,
    minScale: minZoom || fixedMinZoom,
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
    maxZoom: maxZoom || fixedMaxZoom,
    minZoom: minZoom || fixedMinZoom,
    currentZoom: scale,
    setCurrentZoom: setScale,
  })
  const { ref: refForDrag } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })

  const handleSetElementState = (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => {
    if (posX || posX === 0) {
      setPosition((prev) => ({ ...prev, x: posX }))
    }
    if (posY || posY === 0) {
      setPosition((prev) => ({ ...prev, y: posY }))
    }
    if (scale) {
      setScale(scale)
    }
    if (angle || angle === 0) {
      setAngle(angle)
    }
    if (zindex) {
      setElementLayers((pre) => {
        // Tìm index hiện tại của element
        const currentIndex = pre.findIndex((layer) => layer.elementId === elementId)
        if (currentIndex === -1) return pre

        const isMovingUp = zindex > 0
        
        // Kiểm tra boundary
        if (isMovingUp && currentIndex === pre.length - 1) return pre // Đã ở trên cùng
        if (!isMovingUp && currentIndex === 0) return pre // Đã ở dưới cùng

        // Tạo mảng mới và swap vị trí
        const updatedLayers = [...pre]
        const targetIndex = currentIndex + (isMovingUp ? 1 : -1)
        
        // Swap
        const temp = updatedLayers[currentIndex]
        updatedLayers[currentIndex] = updatedLayers[targetIndex]
        updatedLayers[targetIndex] = temp

        // Cập nhật lại index cho tất cả layers
        return updatedLayers.map((layer, idx) => ({
          ...layer,
          index: idx * getInitialContants<number>('ELEMENT_ZINDEX_STEP') + 1,
        }))
      })
    }
  }

  const onElementLayersChange = () => {
    setZindex(
      elementLayers.findIndex((layer) => layer.elementId === elementId) *
        getInitialContants<number>('ELEMENT_ZINDEX_STEP') +
        1
    )
  }

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

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
      zindex,
    },
  }
}
