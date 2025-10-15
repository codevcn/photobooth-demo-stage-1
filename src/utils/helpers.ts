import {
  TDetectCollisionWithViewportEdgesResult,
  TMenuState,
  TPaymentType,
  TProductInCart,
  TSavedMockupData,
} from './types'

export const getNaturalSizeOfImage = (
  imgURL: string,
  onLoaded: (naturalWidth: number, naturalHeight: number) => void,
  onError: (error: ErrorEvent) => void
) => {
  const img = new Image()
  img.onload = function () {
    onLoaded(img.naturalWidth, img.naturalHeight)
  }
  img.onerror = onError
  img.src = imgURL
}

export class LocalStorageHelper {
  static menuStateName = 'menu-state'
  static mockupImageName = 'mockup-image'

  static saveMenuState(state: TMenuState) {
    localStorage.setItem(LocalStorageHelper.menuStateName, JSON.stringify(state))
  }

  static getMenuState(): TMenuState | null {
    const stateStr = localStorage.getItem(LocalStorageHelper.menuStateName)
    if (stateStr) {
      return JSON.parse(stateStr)
    }
    return null
  }

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

export class PageLayoutHelper {
  static detectCollisionWithViewportEdges(
    target: HTMLElement,
    margin: number
  ): TDetectCollisionWithViewportEdgesResult {
    const targetRect = target.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const result: TDetectCollisionWithViewportEdgesResult = {
      collidedEdge: null,
    }
    if (targetRect.left < 0) {
      target.style.left = `${margin}px`
      result.collidedEdge = 'left'
    }
    if (targetRect.right > viewportWidth) {
      target.style.left = `${viewportWidth - targetRect.width - margin}px`
      result.collidedEdge = 'right'
    }
    if (targetRect.top < 0) {
      target.style.top = `${margin}px`
      result.collidedEdge = 'top'
    }
    if (targetRect.bottom > viewportHeight) {
      target.style.top = `${viewportHeight - targetRect.height - margin}px`
      result.collidedEdge = 'bottom'
    }
    return result
  }
}

export function swapArrayItems<T>(arr: T[], indexA: number, indexB: number): void {
  if (
    indexA < 0 ||
    indexB < 0 ||
    indexA >= arr.length ||
    indexB >= arr.length ||
    indexA === indexB
  ) {
    return
  }
  const temp = arr[indexA]
  arr[indexA] = arr[indexB]
  arr[indexB] = temp
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatTime(countdownDuration: number): string {
  const minutes = Math.floor(countdownDuration / 60)
  const seconds = countdownDuration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const getColorByPaymentMethod = (method: TPaymentType): string => {
  switch (method) {
    case 'momo':
      return '#A50064'
    case 'zalo':
      return '#0144DB'
    default:
      return '#fff'
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
