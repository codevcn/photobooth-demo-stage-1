import { apiClient } from '@/lib/api-client'
import {
  TApiResponseBody,
  TListProductsCatalogRes,
  TPreSentMockupImageRes,
} from '@/utils/types/api'

export const getFetchProductsCatalog = (page: number, pageSize: number) =>
  apiClient.get<TApiResponseBody<TListProductsCatalogRes>>(
    `/products/catalog?page=${page}&page_size=${pageSize}`
  )

export const postPreSendMockupImage = (formData: FormData) =>
  apiClient.post<TApiResponseBody<TPreSentMockupImageRes>, FormData>('/files/upload', formData)
