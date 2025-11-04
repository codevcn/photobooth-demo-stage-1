import { TBrands, TUserInputImage } from '@/utils/types'
import { TGetCustomerMediaResponse } from './photoism/types'
import { delay } from '@/utils/helpers'

type TGetImageDataProgressCallback = (percentage: number, imageData: TUserInputImage | null) => void

class QRGetter {
  private async getImageDataOnPhotoism(url: string, onProgress: TGetImageDataProgressCallback) {
    const getFileId = async (url: string): Promise<string> => {
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
      await delay(100)
      // return uParam
      return 'test-uuid'
    }
    const getFileInfo = async (uuid: string): Promise<TGetCustomerMediaResponse> => {
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
      // onProgress(50, null)
      // return (await a.json()) as TGetCustomerMediaResponse
      await delay(1000)
      return {
        content: {
          fileInfo: {
            picFile: {
              path: 'https://photobooth-public.s3.ap-southeast-1.amazonaws.com/Pic+(1).jpg',
            },
          },
        },
      } as TGetCustomerMediaResponse
    }
    const fetchImageData = async (url: string): Promise<void> => {
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
          onProgress(50 + Math.round((loaded / total) * 100) / 2, null)
        }
      }

      // Ghép các chunks thành Blob
      const blob = new Blob(chunks)
      onProgress(100, { blob, url })
    }
    onProgress(10, null)
    try {
      const fileId = await getFileId(url)
      const data = await getFileInfo(fileId)
      await fetchImageData(data.content.fileInfo.picFile.path)
    } catch (err) {
      console.error('>>> Lỗi lấy dữ liệu hình ảnh:', err)
    }
  }

  async getImageData(
    url: string,
    onProgress: TGetImageDataProgressCallback,
    brand: TBrands
  ): Promise<void> {
    switch (brand) {
      case 'photoism':
        await this.getImageDataOnPhotoism(url, onProgress)
    }
  }
}
export const qrGetter = new QRGetter()
