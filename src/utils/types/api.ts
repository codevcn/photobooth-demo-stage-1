export type TProductCatalogResponse = TProduct[]

export type TProduct = {
  id: number
  name: string
  slug: string
  base_image_url: string
  description: string
  status: 'active' | 'inactive'
  attributes_json: Record<string, any>
  created_at: string
  updated_at: string
  variants: TProductVariant[]
  surfaces: TProductSurface[]
}

export type TProductVariant = {
  id: number
  product_id: number
  sku: string
  size: string
  color: string
  price_amount_oneside: string
  price_amount_bothside: string
  currency: string
  stock_qty: number
  attributes_json: Record<string, any>
  created_at: string
  updated_at: string
}

export type TProductSurface = {
  id: number
  product_id: number
  code: string
  display_name: string
  preview_image_url: string
  order_index: number
  created_at: string
  updated_at: string
  print_areas: TPrintArea
}

export type TPrintArea = {
  width_px: number
  height_px: number
  x_px: number
  y_px: number
  width_real_px: number
  height_real_px: number
}
