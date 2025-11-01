import { TMenuState, TProductInCart, TSavedMockupData } from './types'

export class LocalStorageHelper {
  static menuStateName = 'menu-state'
  static mockupImageName = 'mockup-image'

  static saveMockupImageAsBase64(
    productInfo: TProductInCart,
    imageDataUrl: string,
    sessionId: string
  ) {
    let existingData = this.getSavedMockupData()
    if (existingData && existingData.sessionId === sessionId) {
      const productId = productInfo.id
      let isSet: boolean = false
      for (const product of existingData.productsInfo) {
        if (product.id === productId) {
          product.mockupDataURLs[crypto.randomUUID()] = imageDataUrl
          isSet = true
          break
        }
      }
      if (!isSet) {
        existingData.productsInfo.push({
          ...productInfo,
          mockupDataURLs: {
            [crypto.randomUUID()]: imageDataUrl,
          },
        })
      }
    } else {
      existingData = {
        sessionId,
        productsInfo: [
          {
            ...productInfo,
            mockupDataURLs: {
              [crypto.randomUUID()]: imageDataUrl,
            },
          },
        ],
      }
    }
    localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(existingData))
  }

  static getSavedMockupData(): TSavedMockupData | null {
    const data = localStorage.getItem(LocalStorageHelper.mockupImageName)
    return data ? JSON.parse(data) : null
  }

  static countSavedMockupImages(): number {
    const data = this.getSavedMockupData()
    let count: number = 0
    if (data) {
      for (const product of data.productsInfo) {
        count += Object.keys(product.mockupDataURLs).length
      }
    }
    return count
  }

  static removeSavedMockupImage(sessionId: string, productId: string, imageDataUrl: string) {
    const data = this.getSavedMockupData()
    if (data && data.sessionId === sessionId) {
      for (const product of data.productsInfo) {
        if (product.id === productId) {
          delete product.mockupDataURLs[imageDataUrl]
          break
        }
      }
    }
    localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
  }

  static clearAllMockupImages() {
    localStorage.removeItem(LocalStorageHelper.mockupImageName)
  }
}
