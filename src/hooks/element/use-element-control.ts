import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useContext, useEffect, useState } from 'react'
import { ElementLayerContext, useGlobalContext } from '@/context/global-context'
import { swapArrayItems } from '@/utils/helpers'
import { ELEMENT_ZINDEX_STEP } from '@/utils/contants'
import { TElementVisualBaseState } from '@/utils/types'

const fixedMaxZoom: number = 2
const fixedMinZoom: number = 0.3
const initialZindex: number = 1
const initialZoom: number = 1
const initialAngle: number = 0

type TInitialParams = Partial<{
  initialPosX: number
  initialPosY: number
  maxZoom: number
  minZoom: number
}>

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

type TElementType = 'printedImage' | 'sticker'

export const useElementControl = (
  elementId: string,
  elementType: TElementType,
  initialParams?: TInitialParams
): TElementControlReturn => {
  const { initialPosX, initialPosY, maxZoom, minZoom } = initialParams || {}
  const { elementLayers, setElementLayers } = useContext(ElementLayerContext)
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosX || 0,
    y: initialPosY || 0,
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
  const { visualStatesManager } = useGlobalContext()

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
        const copiedArray = [...pre]
        const currentIndex = copiedArray.findIndex((item) => item.elementId === elementId)
        if (currentIndex === -1) return pre
        const isPositiveZindex = zindex > 0
        if (isPositiveZindex && currentIndex === copiedArray.length - 1) return pre
        if (!isPositiveZindex && currentIndex === 0) return pre
        swapArrayItems(copiedArray, currentIndex, currentIndex + (isPositiveZindex ? 1 : -1))
        return copiedArray
      })
    }
  }

  const onElementLayersChange = () => {
    setZindex(
      elementLayers.findIndex((layer) => layer.elementId === elementId) * ELEMENT_ZINDEX_STEP + 1
    )
  }

  const handleUpdateElementVisualState = () => {
    queueMicrotask(() => {
      const visualStates: TElementVisualBaseState = {
        position,
        scale,
        angle,
        zindex,
      }
      switch (elementType) {
        case 'printedImage': {
          visualStatesManager.updateElementVisualStates({
            printedImage: visualStates,
          })
          break
        }
        case 'sticker': {
          visualStatesManager.updateElementVisualStates({
            sticker: visualStates,
          })
          break
        }
      }
    })
  }

  useEffect(() => {
    handleUpdateElementVisualState()
  }, [position, angle, zindex, scale])

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

  useEffect(() => {
    handleUpdateElementVisualState()
  }, [scale])

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
