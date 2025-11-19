import {
  TBaseProduct,
  TPrintAreaInfo,
  TProductImage,
  TProductSize,
  TSurfaceType,
} from '@/utils/types/global'
import { getFetchProductsCatalog, postPreSendMockupImage } from '@/configs/api/product.api'
import { TPreSentMockupImageRes } from '@/utils/types/api'

class ProductService {
  /**
   * Fetch products from API and convert to TBaseProduct format
   */
  private async fetchProducts(page: number, pageSize: number): Promise<TBaseProduct[]> {
    const response = await getFetchProductsCatalog(page, pageSize)

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể lấy danh sách sản phẩm từ server')
    }

    const apiProducts = response.data.data

    // Convert API products to TBaseProduct format
    const convertedProducts: TBaseProduct[] = []
    for (const product of apiProducts) {
      if (product.status !== 'active') continue
      if (product.variants.length === 0) continue
      if (product.surfaces.length === 0) continue
      // Get category from attributes or default to 'cup'
      const category = product.attributes_json.category as TProductImage['category']

      // Build printAreaList from surfaces, sorted with 'front' first
      const printAreaList: TPrintAreaInfo[] = []
      const surfaces = product.surfaces.sort((a, b) =>
        a.code === 'front' ? -1 : b.code === 'front' ? 1 : 0
      )
      for (const surface of surfaces) {
        if (surface.code !== 'front' && surface.code !== 'back') continue
        printAreaList.push({
          id: surface.id,
          area: {
            printX: surface.print_areas.x_px,
            printY: surface.print_areas.y_px,
            printW: surface.print_areas.width_px,
            printH: surface.print_areas.height_px,
            widthRealPx: surface.print_areas.width_real_px,
            heightRealPx: surface.print_areas.height_real_px,
          },
          surfaceType: surface.code as TSurfaceType,
          imageUrl: surface.preview_image_url || product.base_image_url,
        })
      }

      // Convert each variant to TProductImage (without printAreaInfo)
      const images: TProductImage[] = product.variants.map(
        ({ id, color, size, price_amount_oneside, price_amount_bothside, currency, stock_qty }) => {
          return {
            id,
            name: product.name,
            size: size.toUpperCase() as TProductSize,
            color: {
              title: color,
              value: color,
            },
            priceAmountOneSide: parseFloat(price_amount_oneside),
            priceAmountBothSide: parseFloat(price_amount_bothside),
            currency,
            stock: stock_qty,
            category,
          }
        }
      )

      const mockups: TBaseProduct['mockups'] = product.mockups.map((mockup) => ({
        variantId: mockup.variant_id,
        surfaceId: mockup.surface_id,
        mockupUrl: mockup.mockup_url,
      }))

      convertedProducts.push({
        id: product.id,
        url: product.base_image_url,
        name: product.name,
        description: product.description,
        detailImages: product.detail_img,
        images,
        inNewLine: false,
        printAreaList,
        mockups: mockups, // Mockups can be populated later if needed
      })
    }
    return convertedProducts
  }

  /**
   * Main method - fetch from API with fallback to mock on error
   */
  async fetchProductsByPage(page: number, limit: number): Promise<TBaseProduct[]> {
    return await this.fetchProducts(page, limit)
    // return await this.fetchProductsMock(page, limit)
  }

  async preSendMockupImage(image: Blob, filename: string): Promise<TPreSentMockupImageRes> {
    console.log('>>> image:', { image, filename })
    const formData = new FormData()
    formData.append('file', image, filename)
    const response = await postPreSendMockupImage(formData)
    console.log('>>> res:', response)
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể gửi mockup image đến server')
    }
    return response.data.data
  }
}

export const productService = new ProductService()
