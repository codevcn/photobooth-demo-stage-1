import { apiClient } from '@/lib/api-client'
import {
  TAddressProvince,
  TAddressDistrict,
  TAddressWard,
  TApiResponseBody,
} from '@/utils/types/api'

export const getFetchProvinces = () =>
  apiClient.get<TApiResponseBody<TAddressProvince[]>>('/locations/provinces')

export const getFetchDistricts = (provinceId: number) =>
  apiClient.get<TApiResponseBody<TAddressDistrict[]>>(
    `/locations/districts?province_id=${provinceId}`
  )

export const getFetchWards = (districtId: number) =>
  apiClient.get<TApiResponseBody<TAddressWard[]>>(`/locations/wards?district_id=${districtId}`)
