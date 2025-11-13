import { useElementControl } from '@/hooks/element/use-element-control'
import { useEffect, useState } from 'react'
import { roundZooming } from '@/utils/helpers'
import { getInitialContants } from '@/utils/contants'
import { TTextVisualState } from '@/utils/types/global'

type TInitialTextParams = Partial<
  TTextVisualState & {
    maxFontSize: number
    minFontSize: number
  }
>

type TTextElementControlReturn = {
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
  state: Omit<TTextVisualState, 'id'>
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    fontSize?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string,
    fontWeight?: number
  ) => void
}

export const useTextElementControl = (
  elementId: string,
  initialParams?: TInitialTextParams
): TTextElementControlReturn => {
  const {
    position: { x: initialPosX, y: initialPosY } = {
      x: getInitialContants<number>('ELEMENT_X'),
      y: getInitialContants<number>('ELEMENT_Y'),
    },
    fontSize: initialFontSize = getInitialContants<number>('ELEMENT_TEXT_FONT_SIZE'),
    maxFontSize,
    minFontSize,
    textColor: initialColor = getInitialContants<string>('ELEMENT_TEXT_COLOR'),
    content: initialContent = '',
    fontFamily: initialFontFamily = getInitialContants<string>('ELEMENT_TEXT_FONT_FAMILY'),
    fontWeight: initialFontWeight = getInitialContants<number>('ELEMENT_TEXT_FONT_WEIGHT'),
    angle: initialAngle = getInitialContants<number>('ELEMENT_ROTATION'),
    zindex: initialZindex = getInitialContants<number>('ELEMENT_ZINDEX'),
  } = initialParams || {}

  const {
    forPinch,
    forDrag,
    forRotate,
    forZoom,
    state: baseState,
    handleSetElementState: baseHandleSetElementState,
  } = useElementControl(elementId, {
    position: { x: initialPosX, y: initialPosY },
    angle: initialAngle,
    zindex: initialZindex,
  })

  const [content, setContent] = useState<TTextVisualState['content']>(initialContent)
  const [fontSize, setFontSize] = useState<TTextVisualState['fontSize']>(initialFontSize)
  const [textColor, setTextColor] = useState<TTextVisualState['textColor']>(initialColor)
  const [fontFamily, setFontFamily] = useState<TTextVisualState['fontFamily']>(initialFontFamily)
  const [fontWeight, setFontWeight] = useState<TTextVisualState['fontWeight']>(initialFontWeight)

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
    fontSize?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string,
    fontWeight?: number
  ) => {
    baseHandleSetElementState(posX, posY, scale, angle, zindex)
    if (fontSize) {
      handleSetFontSize(fontSize)
    }
    if (textColor) {
      setTextColor(textColor)
    }
    if (fontFamily) {
      setFontFamily(fontFamily)
    }
    if (fontWeight) {
      setFontWeight(fontWeight)
    }
    if (content) {
      setContent(content)
    }
  }

  useEffect(() => {
    handleSetFontSize(
      roundZooming(baseState.scale * getInitialContants<number>('ELEMENT_TEXT_FONT_SIZE'))
    )
  }, [baseState.scale])

  return {
    forPinch,
    forDrag,
    forRotate,
    forZoom,
    handleSetElementState,
    state: {
      fontSize,
      textColor,
      content,
      fontFamily,
      fontWeight,
      angle: baseState.angle,
      position: baseState.position,
      zindex: baseState.zindex,
    },
  }
}
