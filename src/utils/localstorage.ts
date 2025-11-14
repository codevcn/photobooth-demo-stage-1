import {
  TElementsVisualState,
  TMockupData,
  TMockupDataId,
  TMockupImageData,
  TProductCartInfo,
  TSavedMockupData,
} from './types/global'

export class LocalStorageHelper {
  private static mockupImageName = 'mockup-data'

  private static generateMockupId(): string {
    return crypto.randomUUID()
  }

  private static createMockupData(
    elementsVisualState: TElementsVisualState,
    imageData: TMockupImageData,
    surfaceInfo: TMockupData['surfaceInfo']
  ): TMockupData {
    return {
      id: this.generateMockupId(),
      elementsVisualState,
      imageData,
      surfaceInfo,
    }
  }

  static saveMockupImageAtLocal(
    elementsVisualState: TElementsVisualState,
    productInfo: TProductCartInfo,
    imageData: TMockupImageData,
    sessionId: string,
    surfaceInfo: TMockupData['surfaceInfo']
  ): TMockupDataId {
    let existingData = this.getSavedMockupData()

    // Tạo mockup data mới
    const newMockupData = this.createMockupData(elementsVisualState, imageData, surfaceInfo)

    if (existingData && existingData.sessionId === sessionId) {
      const productId = productInfo.productImageId
      let productFound = false

      // Tìm sản phẩm đã tồn tại
      for (const product of existingData.productsInCart) {
        if (
          product.productImageId === productId &&
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
    return newMockupData.id
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

  static removeSavedMockupImage(sessionId: string, productId: number, mockupDataId: string) {
    const data = this.getSavedMockupData()
    if (data && data.sessionId === sessionId) {
      for (const product of data.productsInCart) {
        if (product.productImageId === productId) {
          product.mockupDataList = product.mockupDataList.filter(
            (mockup) => mockup.id !== mockupDataId
          )
          break
        }
      }
      localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
    }
  }

  static updateMockupQuantity(
    sessionId: string,
    productId: number,
    mockupDataId: string,
    amount: number
  ) {
    const data = this.getSavedMockupData()
    if (!data || data.sessionId !== sessionId) return

    for (const product of data.productsInCart) {
      if (product.productImageId === productId) {
        const mockupIndex = product.mockupDataList.findIndex((m) => m.id === mockupDataId)
        if (mockupIndex === -1) return

        const mockup = product.mockupDataList[mockupIndex]

        if (amount > 0) {
          // Thêm mockup: tạo bản sao với originalMockupId trỏ về mockup gốc
          for (let i = 0; i < amount; i++) {
            const duplicatedMockup: TMockupData = {
              ...mockup,
              id: this.generateMockupId(),
            }
            product.mockupDataList.push(duplicatedMockup)
          }
        } else if (amount < 0) {
          // Bớt mockup: chỉ bớt 1 bản gốc
          product.mockupDataList.splice(mockupIndex, 1)
        }

        localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
        break
      }
    }
  }

  static clearAllMockupImages() {
    localStorage.removeItem(LocalStorageHelper.mockupImageName)
  }
}
