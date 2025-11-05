import { TUserInputImage } from '@/utils/types'
import { TGetCustomerMediaResponse } from './types'
import { canvasToBlob, delay } from '@/utils/helpers'

type TGetImageDataProgressCallback = (
  percentage: number,
  imageDataList: TUserInputImage[] | null
) => void

let count = 0
const getLinkByCount = () => {
  return 'https://photobooth-public.s3.ap-southeast-1.amazonaws.com/d63a64aa48c6c4989dd7.jpg'
  // if (count === 1) {
  //   count++
  //   return 'https://photobooth-public.s3.ap-southeast-1.amazonaws.com/d63a64aa48c6c4989dd7.jpg'
  // }
  // if (count === 2) {
  //   count++
  //   return 'https://photobooth-public.s3.ap-southeast-1.amazonaws.com/d63a64aaa48c6c4989dd7.jpg'
  // }
  // if (count === 3) {
  //   count = 0
  //   return 'https://photobooth-public.s3.ap-southeast-1.amazonaws.com/d63a64aa48c6c49289dd7.jpg'
  // }
}

type TSendLinkToServerResponse = {
  image_part: { x: number; y: number; w: number; h: number }[]
  meta: { orig_w: number; orig_h: number; proc_w: number; proc_h: number; scale_ratio: number }
}

class QRGetter {
  private async sendLinkToServer(url: string): Promise<TSendLinkToServerResponse> {
    await delay(1000)
    return {
      image_part: [
        { x: 0, y: 289, w: 1652, h: 3363 },
        { x: 57, y: 3663, w: 1526, h: 1115 },
      ],
      meta: { orig_w: 1652, orig_h: 4920, proc_w: 800, proc_h: 2382, scale_ratio: 2.065 },
    }
  }

  /**
   * Helper function: Load ảnh từ URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Helper function: Chuyển canvas thành Blob
   */
  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvasToBlob(
        canvas,
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Chuyển canvas thành Blob thất bại'))
          }
        },
        'image/png'
      )
    })
  }

  /**
   * Crop ảnh từ Blob theo danh sách các vùng crop
   * @param imageBlob - Blob chứa ảnh gốc
   * @param cropAreas - Mảng các vùng cần crop
   * @returns Promise chứa mảng các Blob đã được crop
   */
  private async cropImageFromBlob(
    imageBlob: Blob,
    cropAreas: TSendLinkToServerResponse['image_part']
  ): Promise<Blob[]> {
    // Tạo URL từ Blob để load ảnh
    const imageUrl = URL.createObjectURL(imageBlob)

    try {
      // Load ảnh vào Image object
      const img = await this.loadImage(imageUrl)

      // Tạo canvas để crop
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Không thể tạo canvas context')
      }

      // Crop từng vùng và chuyển thành Blob
      const croppedBlobs: Blob[] = []

      for (const area of cropAreas) {
        // Set kích thước canvas bằng kích thước vùng crop
        canvas.width = area.w
        canvas.height = area.h

        // Clear canvas trước khi vẽ
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Vẽ phần ảnh cần crop lên canvas
        ctx.drawImage(
          img,
          area.x,
          area.y,
          area.w,
          area.h, // Source: vị trí và kích thước trên ảnh gốc
          0,
          0,
          area.w,
          area.h // Destination: vẽ lên canvas từ (0,0)
        )

        // Chuyển canvas thành Blob
        const blob = await this.canvasToBlob(canvas)
        croppedBlobs.push(blob)
      }

      return croppedBlobs
    } finally {
      // Giải phóng URL object
      URL.revokeObjectURL(imageUrl)
    }
  }

  private async getFileId(url: string, onProgress: TGetImageDataProgressCallback): Promise<string> {
    // const browserHeaders = {
    //   accept:
    //     'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    //   'accept-language': 'en-US,en;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,zh-TW;q=0.5,zh;q=0.4',
    //   'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    //   'sec-ch-ua-mobile': '?0',
    //   'sec-ch-ua-platform': '"Windows"',
    //   'upgrade-insecure-requests': '1',
    //   // pass CloudFront
    //   'user-agent':
    //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    // }
    // const res1 = await fetch(url, {
    //   method: 'GET',
    //   redirect: 'manual',
    //   headers: browserHeaders,
    // })
    await delay(1000)
    onProgress(30, null)
    // const redirectLocation = res1.headers.get('location')
    // if (!redirectLocation) throw new Error('No redirect location found')
    // // console.log("redirectLocation:", redirectLocation);
    // const urlObj = new URL(redirectLocation)
    // const uParam = urlObj.searchParams.get('u')
    // if (!uParam) throw new Error('No u parameter found in redirect URL')
    // return uParam
    return 'test-uuid'
  }

  private async getFileInfo(
    uuid: string,
    onProgress: TGetImageDataProgressCallback
  ): Promise<TGetCustomerMediaResponse> {
    // let a = await fetch('https://cmsapi-apse.seobuk.kr/v1/etc/seq/resource', {
    //   headers: {
    //     accept: 'application/json, text/plain, */*',
    //     'accept-language': 'en-US,en;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,zh-TW;q=0.5,zh;q=0.4',
    //     'content-type': 'application/json',
    //     priority: 'u=1, i',
    //     'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    //     'sec-ch-ua-mobile': '?0',
    //     'sec-ch-ua-platform': '"Windows"',
    //     'sec-fetch-dest': 'empty',
    //     'sec-fetch-mode': 'cors',
    //     'sec-fetch-site': 'same-site',
    //     Referer: 'https://qr.seobuk.kr/',
    //   },
    //   body: `{\"uid\":\"${uuid}\",\"appUserId\":null}`,
    //   method: 'POST',
    // })
    // return (await a.json()) as TGetCustomerMediaResponse
    await delay(1000)
    onProgress(50, null)
    return {
      content: {
        fileInfo: {
          picFile: {
            path: getLinkByCount(),
          },
        },
      },
    } as TGetCustomerMediaResponse
  }

  private async fetchImageData(
    url: string,
    onProgress: TGetImageDataProgressCallback
  ): Promise<void> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Lấy total size từ Content-Length header
    const contentLength = response.headers.get('Content-Length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array<ArrayBuffer>[] = []
    let loaded = 0

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      chunks.push(value)
      loaded += value.length

      // Gọi callback progress
      if (onProgress && total > 0) {
        onProgress(50 + Math.round(((loaded / total) * 100) / 4) - 1, null) // trừ 1 để không đạt tới 75%
      }
    }

    // Ghép các chunks thành Blob
    const blob = new Blob(chunks)
    onProgress(75, [{ blob, url }])
  }

  private async extractImageDataAtLocal(
    url: string,
    onProgress: TGetImageDataProgressCallback
  ): Promise<void> {
    onProgress(10, null)
    try {
      const fileId = await this.getFileId(url, onProgress)
      const data = await this.getFileInfo(fileId, onProgress)
      await this.fetchImageData(data.content.fileInfo.picFile.path, onProgress)
    } catch (err) {
      console.error('>>> Lỗi lấy dữ liệu hình ảnh:', err)
      throw err
    }
  }

  private async extractImageDataAtServer(
    totalImageToExtractAtServer: number,
    imageIndex: number,
    imageURL: string,
    imageBlob: Blob,
    onProgress: TGetImageDataProgressCallback
  ): Promise<void> {
    const result = await this.sendLinkToServer(imageURL)
    onProgress(90, null)
    const croppedImages = await this.cropImageFromBlob(imageBlob, result.image_part)
    onProgress(
      90 + Math.round(10 / (imageIndex + 1 / totalImageToExtractAtServer)),
      croppedImages.map((blob) => ({ blob, url: imageURL }))
    )
  }

  async handleImageData(url: string, onProgress: TGetImageDataProgressCallback): Promise<void> {
    const finalImageDataList: TUserInputImage[] = []
    await this.extractImageDataAtLocal(url, async (percentage, imgList) => {
      onProgress(percentage, null)
      if (imgList) {
        finalImageDataList.push(...imgList)
        await Promise.allSettled(
          imgList.map((img, index) =>
            this.extractImageDataAtServer(
              imgList.length,
              index,
              img.url,
              img.blob,
              (percentage, imgList) => {
                onProgress(percentage, null)
                if (imgList) {
                  finalImageDataList.push(...imgList)
                }
              }
            )
          )
        )
        onProgress(100, finalImageDataList)
      }
    })
  }
}
export const qrGetter = new QRGetter()
