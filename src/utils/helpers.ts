import { TDetectCollisionWithViewportEdgesResult, TMenuState, TMockupImageData } from './types'

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

  static saveMockupImageAsBase64(productId: string, imageDataUrl: string) {
    let existingData = this.getMockupImageAsBase64()
    if (existingData) {
      existingData.productInfo.mockups[crypto.randomUUID()] = imageDataUrl
    } else {
      existingData = {
        sessionId: crypto.randomUUID(),
        productInfo: {
          id: productId,
          mockups: {
            [crypto.randomUUID()]: imageDataUrl,
          },
        },
      }
    }
    localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(existingData))
  }

  static getMockupImageAsBase64(): TMockupImageData | null {
    const data = localStorage.getItem(LocalStorageHelper.mockupImageName)
    return data ? JSON.parse(data) : null
  }

  static countSavedMockupImages(): number {
    const data = this.getMockupImageAsBase64()
    return data ? Object.keys(data.productInfo.mockups).length : 0
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
