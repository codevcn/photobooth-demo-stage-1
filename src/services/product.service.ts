import { productImages } from '@/dev/storage'
import { delay } from '@/utils/helpers'
import { TProductImage } from '@/utils/types'

class ProductService {
  async fetchProductsByPage(page: number, limit: number): Promise<TProductImage[][]> {
    await delay(1000)
    const data = productImages
    return data
  }
}

export const productService = new ProductService()
