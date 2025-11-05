export type TProductSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'

export type TProductColor = {
  title: string
  value: string
}

export type TProductImage = {
  id: string
  url: string
  name: string
  size: TProductSize[]
  color: TProductColor
  description: string
  priceInVND: number
  priceAfterDiscount?: number
  stock: number
  category: 'shirt' | 'hat' | 'cup' | 'keychain' | 'phonecase' | 'figurine' | 'totebag'
}

export type TTextElement = {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  content: string
}

export type TStickerElement = {
  id: string
  path: string
  x: number
  y: number
  height: number
  width: number
}

export type TPrintedImage = {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
}

export type TElementType = 'text' | 'sticker' | 'printed-image'

export type TElementLayerState = {
  elementId: string
}

export type TGlobalContextValue = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
  sessionId: string | null
}

export type TElementLayerContextValue = {
  elementLayers: TElementLayerState[]
  setElementLayers: React.Dispatch<React.SetStateAction<TElementLayerState[]>>
  addToElementLayers: (elementLayer: TElementLayerState) => void
}

export type TMenuState = Partial<{
  scale: number
  angle: number
  fontSize: number
  posX: number
  posY: number
  textColor: string
  textFont: string
}>

export type TDetectCollisionWithViewportEdgesResult = {
  collidedEdge: 'left' | 'right' | 'top' | 'bottom' | null
}

export type TProductInCart = {
  id: string
  color: {
    title: string
    value: string
  }
  size: TProductSize
}

export type TSavedMockupData = {
  sessionId: string
  productsInfo: (TProductInCart & {
    mockupDataURLs: {
      [key: string]: string
    }
  })[]
}

export type TPaymentType = 'momo' | 'zalo' | 'cod'

export type TBrands = 'photoism'

export type TUserInputImage = {
  url: string
  blob: Blob
}

export type TEditedImage = TPrintedImage

export type TEditedImageContextValue = {
  editedImages: TEditedImage[]
  setEditedImages: React.Dispatch<React.SetStateAction<TEditedImage[]>>
  clearAllEditedImages: () => void
}

export type TProductImageContextValue = {
  productImages: TProductImage[][]
  setProductImages: React.Dispatch<React.SetStateAction<TProductImage[][]>>
}
