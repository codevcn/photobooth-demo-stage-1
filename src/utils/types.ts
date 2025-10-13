export interface IProductImage {
  id: string
  url: string
  name: string
}

export interface ITextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
}

export interface IStickerElement {
  id: string
  emoji: string
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
