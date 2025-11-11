import { EditedImageContext, GlobalContext, ProductImageContext } from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { generateSessionId } from '@/utils/helpers'
import { TEditedImage, TElementType, TGlobalContextValue, TProductImage } from '@/utils/types'
import { useEffect, useState } from 'react'

type TGlobalState = Omit<TGlobalContextValue, 'visualStatesManager'>

export const AppRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [editedImages, setEditedImages] = useState<TEditedImage[]>([])
  const [productImages, setProductImages] = useState<TProductImage[][]>([])
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
    <GlobalContext.Provider value={globalState}>
      <EditedImageContext.Provider value={{ editedImages, setEditedImages, clearAllEditedImages }}>
        <ProductImageContext.Provider value={{ productImages, setProductImages }}>
          {children}
        </ProductImageContext.Provider>
      </EditedImageContext.Provider>
    </GlobalContext.Provider>
  )
}
