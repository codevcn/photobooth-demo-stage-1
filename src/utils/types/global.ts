export type IntersectSameFields<A, B> = {
  [K in keyof A & keyof B as A[K] extends B[K] ? (B[K] extends A[K] ? K : never) : never]: A[K]
}

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
  printArea: {
    print_x?: number
    print_y?: number
    print_w?: number
    print_h?: number
  }
  frontImageUrl: string
  backImageUrl: string
}

export type TPrintedImage = {
  id: string
  url: string
}

export type TElementType = 'text' | 'sticker' | 'printed-image'

export type TElementLayerState = {
  elementId: string
  index: number
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
  removeFromElementLayers: (elementId: string[]) => void
}

export type TDetectCollisionWithViewportEdgesResult = {
  collidedEdge: 'left' | 'right' | 'top' | 'bottom' | null
}

export type TProductInfo = {
  id: string
  color: {
    title: string
    value: string
  }
  size: TProductSize
}

export type TSavedMockupData = {
  sessionId: string
  productsInCart: TProductInCart[]
}

export type TPaymentType = 'momo' | 'zalo' | 'cod'

export type TBrands = 'photoism'

export type TUserInputImage = {
  url: string
  blob: Blob
  isOriginalImageUrl?: boolean
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

export type TVoucher = {
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number // percentage: 0-100, fixed: số tiền
  minOrderValue?: number // Giá trị đơn hàng tối thiểu
  maxDiscount?: number // Giảm tối đa (cho percentage)
}

export type VoucherValidationResult = {
  success: boolean
  message: string
  voucher?: TVoucher
}

export type TElementVisualBaseState = {
  position: {
    x: number
    y: number
  }
  scale: number
  angle: number
  zindex: number
}

export type TTextVisualState = Omit<TElementVisualBaseState, 'scale'> & {
  id: string
  fontSize: number
  textColor: string
  content: string
  fontFamily: string
  fontWeight: number
}

export type TStickerVisualState = TElementVisualBaseState & {
  id: string
  path: string
}

export type TPrintedImageVisualState = TElementVisualBaseState & {
  id: string
  url: string
}

export type TElementsVisualState = Partial<{
  stickers: TStickerVisualState[]
  printedImages: TPrintedImageVisualState[]
  texts: TTextVisualState[]
}>

export type TMockupData = {
  id: string
  elementsVisualState: TElementsVisualState
  dataURL: string
  surfaceType: TSurfaceType
}

export type TProductInCart = TProductInfo & {
  mockupDataList: TMockupData[]
}

export type TSurfaceType = 'front' | 'back'
