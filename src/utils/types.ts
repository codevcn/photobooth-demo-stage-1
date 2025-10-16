export type TProductSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'

export type TProductColor = {
  title: string
  value: string
}

export interface IProductImage {
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

export interface ITextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  content: string
}

export interface IStickerElement {
  id: string
  path: string
  x: number
  y: number
  height: number
  width: number
}

export interface IPrintedImage {
  id: string
  url: string
  x: number
  y: number
  width: number
  height: number
}

export type TElementType = 'text' | 'sticker' | 'printed-image'

export type TGlobalContext = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
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
