import { useCallback } from 'react'
import { TElementsVisualState } from '@/utils/types/global'

type TUseVisualStatesCollectorReturn = {
  collectMockupVisualStates: (mockupmockupContainerRef?: HTMLElement) => TElementsVisualState
}

/**
 * Hook để thu thập visual state của tất cả elements trong edit area
 * Sử dụng data attributes để lấy state trực tiếp từ DOM
 */
export const useVisualStatesCollector = (): TUseVisualStatesCollectorReturn => {
  const collectMockupVisualStates = useCallback(
    (mockupContainerRef?: HTMLElement): TElementsVisualState => {
      const allElements = (
        mockupContainerRef || document.body.querySelector('.NAME-canvas-editor')
      )?.querySelectorAll<HTMLElement>('.NAME-root-element')
      if (!allElements) return {}

      const elementsVisualState: TElementsVisualState = {
        texts: [],
        stickers: [],
        printedImages: [],
      }

      for (const element of allElements) {
        const elementType = element.className.includes('NAME-element-type-text')
          ? 'texts'
          : element.className.includes('NAME-element-type-sticker')
          ? 'stickers'
          : element.className.includes('NAME-element-type-printed-image')
          ? 'printedImages'
          : null

        if (!elementType) continue

        const visualState = element.getAttribute('data-visual-state')
        if (!visualState) continue

        elementsVisualState[elementType]?.push(JSON.parse(visualState))
      }

      // Clean up empty arrays
      if (elementsVisualState.texts?.length === 0) delete elementsVisualState.texts
      if (elementsVisualState.stickers?.length === 0) delete elementsVisualState.stickers
      if (elementsVisualState.printedImages?.length === 0) delete elementsVisualState.printedImages

      return elementsVisualState
    },
    []
  )

  return {
    collectMockupVisualStates,
  }
}
