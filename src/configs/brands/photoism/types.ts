export type TMediaType = 'IMAGE' | 'VIDEO'

export type TGetCustomerMediaResponse = {
  content: {
    fileInfo: {
      picFile: {
        id: number
        name: string
        alterName: string
        path: string
        del: boolean
        fileType: TMediaType
      }
      vidFile: {
        id: number
        name: string
        alterName: string
        path: string
        del: boolean
        fileType: TMediaType
      }
    }
  }
}
