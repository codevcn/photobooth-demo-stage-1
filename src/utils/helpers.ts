import { getInitialContants } from './contants'
import { TImgMimeType, TPaymentType, TSurfaceType } from './types/global'

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

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Kiểm tra xem chuỗi có phải là số điện thoại Việt Nam hợp lệ không.
 * Hỗ trợ các dạng:
 * - 0912345678
 * - 84912345678
 * - +84912345678
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false

  const regex = /^(?:\+84|84|0)(3|5|7|8|9)\d{8}$/
  return regex.test(phone.trim())
}

/**
 * Kiểm tra xem chuỗi có phải là địa chỉ email hợp lệ không.
 * Hỗ trợ các định dạng phổ biến: user@example.com
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

export const ativateFullScreen = () => {
  const docElm = document.documentElement
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if ((docElm as any).mozRequestFullScreen) {
    ;(docElm as any).mozRequestFullScreen()
  } else if ((docElm as any).webkitRequestFullScreen) {
    ;(docElm as any).webkitRequestFullScreen()
  } else if ((docElm as any).msRequestFullscreen) {
    ;(docElm as any).msRequestFullscreen()
  }
}

export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    ;(document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
    ;(document as any).msExitFullscreen()
  } else if ((document as any).mozCancelFullScreen) {
    ;(document as any).mozCancelFullScreen()
  }
}

export const roundZooming = (zoomValue: number): number => {
  return parseFloat(zoomValue.toFixed(getInitialContants<number>('ELEMENT_ROUND_ZOOMING_FIXED')))
}

export const typeToObject = <Type>(objectInput: Type): Type => objectInput

export const generateSessionId = (): string => crypto.randomUUID()

/**
 * Chuyển canvas thành Blob
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  callback: (blob: Blob | null) => void,
  type: string = 'image/png'
): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      callback(blob)
    } else {
      callback(null)
    }
  }, type)
}

export const labelToSurfaceType = (surfaceType: TSurfaceType): string => {
  switch (surfaceType) {
    case 'front':
      return 'mặt trước'
    case 'back':
      return 'mặt sau'
    case 'both':
      return 'cả hai mặt'
  }
}

export const convertMimeTypeToExtension = (mimeType: TImgMimeType): string => {
  switch (mimeType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpeg'
    case 'image/webp':
      return 'webp'
    default:
      return ''
  }
}

export const resizeImage = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.95
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }
    img.onload = () => {
      // Set canvas size
      canvas.width = targetWidth
      canvas.height = targetHeight

      // Draw image lên canvas với kích thước mới
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      // Convert canvas sang blob
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        quality
      ) // 0.95 là quality (95%)
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const resizeCanvas = (
  sourceCanvas: HTMLCanvasElement,
  newWidth: number,
  newHeight: number
): HTMLCanvasElement | undefined => {
  // Tạo canvas mới với kích thước mong muốn
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = newWidth
  resizedCanvas.height = newHeight

  const ctx = resizedCanvas.getContext('2d')
  if (!ctx) {
    return undefined
  }

  // Vẽ canvas cũ lên canvas mới với kích thước mới
  ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight)

  return resizedCanvas
}
