import { TElementsVisualState, TMockupData, TProductInfo, TSavedMockupData } from './types'

export class LocalStorageHelper {
  static menuStateName = 'menu-state'
  static mockupImageName = 'mockup-image'

  private static generateMockupId(): string {
    return crypto.randomUUID()
  }

  private static createMockupData(
    elementsVisualState: TElementsVisualState,
    imageDataUrl: string
  ): TMockupData {
    return {
      id: this.generateMockupId(),
      elementsVisualState,
      dataURL: imageDataUrl,
    }
  }

  static saveMockupImageAtLocal(
    elementsVisualState: TElementsVisualState,
    productInfo: TProductInfo,
    imageDataUrl: string,
    sessionId: string
  ) {
    let existingData = this.getSavedMockupData()

    // Tạo mockup data mới
    const newMockupData = this.createMockupData(elementsVisualState, imageDataUrl)

    if (existingData && existingData.sessionId === sessionId) {
      const productId = productInfo.id
      let productFound = false

      // Tìm sản phẩm đã tồn tại
      for (const product of existingData.productsInCart) {
        if (
          product.id === productId &&
          product.color.value === productInfo.color.value &&
          product.size === productInfo.size
        ) {
          // Thêm mockup data mới vào danh sách
          product.mockupDataList.push(newMockupData)
          productFound = true
          break
        }
      }

      // Nếu chưa có sản phẩm này, tạo mới
      if (!productFound) {
        existingData.productsInCart.push({
          ...productInfo,
          mockupDataList: [newMockupData],
        })
      }
    } else {
      // Tạo data mới hoàn toàn
      existingData = {
        sessionId,
        productsInCart: [
          {
            ...productInfo,
            mockupDataList: [newMockupData],
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
      for (const product of data.productsInCart) {
        count += product.mockupDataList.length
      }
    }
    return count
  }

  static removeSavedMockupImage(sessionId: string, productId: string, mockupDataId: string) {
    const data = this.getSavedMockupData()
    if (data && data.sessionId === sessionId) {
      for (const product of data.productsInCart) {
        if (product.id === productId) {
          product.mockupDataList = product.mockupDataList.filter(
            (mockup) => mockup.id !== mockupDataId
          )
          break
        }
      }
      localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
    }
  }

  static clearAllMockupImages() {
    localStorage.removeItem(LocalStorageHelper.mockupImageName)
  }
}
