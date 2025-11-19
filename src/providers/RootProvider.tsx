import {
  EditedImageContext,
  GlobalContext,
  LoadedTextFontContext,
  ProductContext,
} from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { generateSessionId } from '@/utils/helpers'
import {
  TBaseProduct,
  TEditedImage,
  TElementType,
  TPreSentMockupImageLink,
} from '@/utils/types/global'
import { useEffect, useState } from 'react'

type TGlobalState = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
  sessionId: string | null
  preSentMockupImageLinks: TPreSentMockupImageLink[]
}

export const AppRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [editedImages, setEditedImages] = useState<TEditedImage[]>([])
  const [products, setProducts] = useState<TBaseProduct[]>([])
  const [globalState, setGlobalState] = useState<TGlobalState>({
    pickedElementRoot: null,
    elementType: null,
    sessionId: generateSessionId(),
    preSentMockupImageLinks: [],
  })
  const [availableFonts, setAvailableFonts] = useState<string[]>([])

  const addPreSentMockupImageLink = (imageUrl: string, mockupId: string) => {
    setGlobalState((pre) => ({
      ...pre,
      preSentMockupImageLinks: [...pre.preSentMockupImageLinks, { mockupId, imageUrl }],
    }))
  }

  const clearAllEditedImages = () => {
    setEditedImages([])
  }

  const listenPickElement = (element: HTMLElement | null, elementType: TElementType | null) => {
    setGlobalState((pre) => ({ ...pre, pickedElementRoot: element, elementType }))
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.PICK_ELEMENT, listenPickElement)
    return () => {
      eventEmitter.off(EInternalEvents.PICK_ELEMENT, listenPickElement)
    }
  }, [])

  return (
    <GlobalContext.Provider value={{ ...globalState, addPreSentMockupImageLink }}>
      <LoadedTextFontContext.Provider value={{ availableFonts, setAvailableFonts }}>
        <EditedImageContext.Provider
          value={{ editedImages, setEditedImages, clearAllEditedImages }}
        >
          <ProductContext.Provider value={{ products, setProducts }}>
            {children}
          </ProductContext.Provider>
        </EditedImageContext.Provider>
      </LoadedTextFontContext.Provider>
    </GlobalContext.Provider>
  )
}
