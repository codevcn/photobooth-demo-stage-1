import { EditedImageContext, GlobalContext, ProductContext } from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { generateSessionId } from '@/utils/helpers'
import { TBaseProduct, TEditedImage, TElementType } from '@/utils/types/global'
import { useEffect, useState } from 'react'

type TGlobalState = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
  sessionId: string | null
}

export const AppRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [editedImages, setEditedImages] = useState<TEditedImage[]>([])
  const [products, setProducts] = useState<TBaseProduct[]>([])
  const [globalState, setGlobalState] = useState<TGlobalState>({
    pickedElementRoot: null,
    elementType: null,
    sessionId: generateSessionId(),
  })

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
    <GlobalContext.Provider value={{ ...globalState }}>
      <EditedImageContext.Provider value={{ editedImages, setEditedImages, clearAllEditedImages }}>
        <ProductContext.Provider value={{ products, setProducts }}>
          {children}
        </ProductContext.Provider>
      </EditedImageContext.Provider>
    </GlobalContext.Provider>
  )
}
