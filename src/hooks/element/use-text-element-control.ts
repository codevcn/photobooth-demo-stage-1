import { useElementControl } from '@/hooks/element/use-element-control'
import { useEffect, useState } from 'react'
import { useGlobalContext } from '@/context/global-context'
import { roundZooming } from '@/utils/helpers'
import { INITIAL_TEXT_FONT_SIZE } from '@/utils/contants'
import { TTextVisualState } from '@/utils/types'

type TInitialTextParams = Partial<{
  initialPosX: number
  initialPosY: number
  initialFontSize: number
  maxFontSize: number
  minFontSize: number
  initialColor: string
  initialContent: string
  initialFontFamily: string
  initialFontWeight: number
}>

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
  state: TTextVisualState
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
    initialPosX,
    initialPosY,
    initialFontSize,
    maxFontSize,
    minFontSize,
    initialColor,
    initialContent,
    initialFontFamily,
    initialFontWeight,
  } = initialParams || {}

  const {
    forPinch,
    forDrag,
    forRotate,
    forZoom,
    state: baseState,
    handleSetElementState: baseHandleSetElementState,
  } = useElementControl(elementId, 'printedImage', {
    initialPosX,
    initialPosY,
  })

  const [content, setContent] = useState<TTextVisualState['content']>(initialContent || '')
  const [fontSize, setFontSize] = useState<TTextVisualState['fontSize']>(
    initialFontSize || INITIAL_TEXT_FONT_SIZE
  )
  const [textColor, setTextColor] = useState<TTextVisualState['textColor']>(
    initialColor || '#000000'
  )
  const [fontFamily, setFontFamily] = useState<TTextVisualState['fontFamily']>(
    initialFontFamily || 'Arial'
  )
  const [fontWeight, setFontWeight] = useState<TTextVisualState['fontWeight']>(
    initialFontWeight || 400
  )

  const { visualStatesManager } = useGlobalContext()

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

  const handleUpdateElementVisualState = () => {
    queueMicrotask(() => {
      visualStatesManager.updateElementVisualStates({
        text: {
          ...baseState,
          fontSize,
          textColor,
          content,
          fontFamily,
          fontWeight,
        },
      })
    })
  }

  useEffect(() => {
    handleUpdateElementVisualState()
  }, [baseState, fontSize, textColor, content, fontFamily, fontWeight])

  useEffect(() => {
    handleSetFontSize(roundZooming(baseState.scale * INITIAL_TEXT_FONT_SIZE))
  }, [baseState.scale])

  return {
    forPinch,
    forDrag,
    forRotate,
    forZoom,
    handleSetElementState,
    state: {
      ...baseState,
      fontSize,
      textColor,
      content,
      fontFamily,
      fontWeight,
    },
  }
}
