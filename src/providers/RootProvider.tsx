import { EditedImageContext, GlobalContext, ProductImageContext } from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { generateSessionId } from '@/utils/helpers'
import { TEditedImage, TElementType, TGlobalContextValue, TProductImage } from '@/utils/types'
import { useEffect, useState } from 'react'

export const AppRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [editedImages, setEditedImages] = useState<TEditedImage[]>([])
  const [productImages, setProductImages] = useState<TProductImage[][]>([])
  const [providerState, setProviderState] = useState<TGlobalContextValue>({
    pickedElementRoot: null,
    elementType: null,
    sessionId: generateSessionId(),
  })

  const listenPickElement = (element: HTMLElement | null, elementType: TElementType | null) => {
    setProviderState((pre) => ({ ...pre, pickedElementRoot: element, elementType }))
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.PICK_ELEMENT, listenPickElement)
    return () => {
      eventEmitter.off(EInternalEvents.PICK_ELEMENT, listenPickElement)
    }
  }, [])

  return (
    <GlobalContext.Provider value={providerState}>
      <EditedImageContext.Provider value={{ editedImages, setEditedImages }}>
        <ProductImageContext.Provider value={{ productImages, setProductImages }}>
          {children}
        </ProductImageContext.Provider>
      </EditedImageContext.Provider>
    </GlobalContext.Provider>
  )
}
