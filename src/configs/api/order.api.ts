import { apiClient } from '@/lib/api-client'
import { TApiResponseBody, TCreateOrderReq, TCreateOrderRes, TOrderStatusRes } from '@/utils/types/api'

export const postCreateOrder = (data: TCreateOrderReq) =>
  apiClient.post<TApiResponseBody<TCreateOrderRes>, TCreateOrderReq>('/orders', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const getOrderStatus = (hashCode: string) =>
  apiClient.get<TApiResponseBody<TOrderStatusRes>>(`/orders/hash/${hashCode}/status`)
