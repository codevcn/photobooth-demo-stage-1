import { apiClient } from '@/lib/api-client'
import { TApiResponseBody, TCreateOrderReq, TCreateOrderRes } from '@/utils/types/api'

export const postCreateOrder = (data: TCreateOrderReq) =>
  apiClient.post<TApiResponseBody<TCreateOrderRes>, TCreateOrderReq>('/orders', data)
