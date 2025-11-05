import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useContext, useEffect, useState } from 'react'
import { ElementLayerContext } from '@/context/global-context'
import { roundZooming, swapArrayItems } from '@/utils/helpers'
import { ELEMENT_ZINDEX_STEP, INITIAL_TEXT_FONT_SIZE } from '@/utils/contants'

const fixedMaxZoom: number = 2
const fixedMinZoom: number = 0.3
const initialZindex: number = 1
const initialZoom: number = 1
const initialAngle: number = 0

type TElementState = {
  position: { x: number; y: number }
  scale: number
  angle: number
  zindex: number
  fontSize: number
}

type TInitialParams = {
  initialPosX?: number
  initialPosY?: number
  maxZoom?: number
  minZoom?: number
  initialFontSize?: number
  maxFontSize?: number
  minFontSize?: number
}

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
  state: TElementState
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    fontSize?: number
  ) => void
}

export const useElementControl = (
  elementId: string,
  initialParams?: TInitialParams,
  isTextElement?: boolean
): TElementControlReturn => {
  const { initialPosX, initialPosY, maxZoom, minZoom, initialFontSize, maxFontSize, minFontSize } =
    initialParams || {}
  const { elementLayers, setElementLayers } = useContext(ElementLayerContext)
  console.log('>>> element layers:', elementLayers)
  const [position, setPosition] = useState<TElementState['position']>({
    x: initialPosX || 0,
    y: initialPosY || 0,
  })
  const [scale, setScale] = useState<TElementState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementState['zindex']>(initialZindex)
  const [fontSize, setFontSize] = useState<number>(initialFontSize || INITIAL_TEXT_FONT_SIZE)
  const { ref: refForPinch } = usePinchElement({
    maxScale: isTextElement ? undefined : maxZoom || fixedMaxZoom,
    minScale: isTextElement ? undefined : minZoom || fixedMinZoom,
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
    maxZoom: isTextElement ? undefined : maxZoom || fixedMaxZoom,
    minZoom: isTextElement ? undefined : minZoom || fixedMinZoom,
    currentZoom: scale,
    setCurrentZoom: setScale,
  })
  const { ref: refForDrag } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })

  const handleSetFontSize = (newFontSize: number) => {
    let adjustedFontSize = newFontSize
    if (minFontSize && minFontSize > newFontSize) {
      adjustedFontSize = minFontSize
    }
    if (maxFontSize && maxFontSize < adjustedFontSize) {
      adjustedFontSize = maxFontSize
    }
    setFontSize(adjustedFontSize)
  }

  const handleSetElementState = (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    fontSize?: number
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
    if (fontSize) {
      handleSetFontSize(fontSize)
      setScale(roundZooming(fontSize / INITIAL_TEXT_FONT_SIZE))
    }
  }

  const onElementLayersChange = () => {
    setZindex(
      elementLayers.findIndex((layer) => layer.elementId === elementId) * ELEMENT_ZINDEX_STEP + 1
    )
  }

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

  useEffect(() => {
    if (isTextElement) {
      handleSetFontSize(roundZooming(scale * INITIAL_TEXT_FONT_SIZE))
    }
  }, [scale, isTextElement])

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
      fontSize,
    },
  }
}
