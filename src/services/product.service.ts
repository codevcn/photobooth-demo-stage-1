import { apiClient } from '@/lib/api-client'
import { productImages } from '@/dev/storage'
import { delay } from '@/utils/helpers'
import { TProductImage } from '@/utils/types/global'
import { TProductCatalogResponse } from '@/utils/types/api'

class ProductService {
  /**
   * Fetch products from API
   * Note: The API doesn't have pagination, so we'll fetch all and slice locally
   */
  async fetchProducts(page: number, limit: number): Promise<TProductImage[][]> {
    const response = await apiClient.get<TProductCatalogResponse>('/products')

    if (!response.success || !response.data) {
      console.error('Failed to fetch products from API:', response.error)
      // Fallback to mock data
      return this.fetchProductsMock(page, limit)
    }

    // Transform API data to TProductImage format
    // Note: API doesn't provide full product details, so we use default values
    const products: TProductImage[] = response.data
      .filter((p) => p.status === 'active')
      .map((product) => ({
        id: product.id.toString(),
        url: product.base_image_url,
        name: product.name,
        size: ['M', 'L'] as const, // Default sizes
        color: {
          title: 'White',
          value: '#FFFFFF',
        },
        description: product.description || '',
        priceInVND: 170000, // Default price - should come from API variants
        stock: 100, // Default stock
        category: 'cup' as const, // Default category
        printArea: {
          print_x: 100,
          print_y: 150,
          print_w: 2000,
          print_h: 1400,
        },
      }))

    // Group products by limit items per page
    const grouped: TProductImage[][] = []
    for (let i = 0; i < products.length; i += limit) {
      grouped.push(products.slice(i, i + limit))
    }

    return grouped
  }

  /**
   * Mock data for development/testing
   */
  async fetchProductsMock(page: number, limit: number): Promise<TProductImage[][]> {
    await delay(1000)
    return productImages
  }

  /**
   * Main method - switch between API and mock
   * Set USE_API = true to use real API, false for mock data
   */
  async fetchProductsByPage(page: number, limit: number): Promise<TProductImage[][]> {
    return this.fetchProductsMock(page, limit)
  }
}

export const productService = new ProductService()
