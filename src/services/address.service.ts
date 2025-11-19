import { getFetchProvinces, getFetchDistricts, getFetchWards } from '@/configs/api/address.api'
import { TAddressProvince, TAddressDistrict, TAddressWard } from '@/utils/types/api'

class AddressService {
  constructor() {}

  async fetchProvinces(): Promise<TAddressProvince[]> {
    const response = await getFetchProvinces()
    return response.data?.data || []
  }

  async fetchDistricts(provinceId: number): Promise<TAddressDistrict[]> {
    const response = await getFetchDistricts(provinceId)
    return response.data?.data || []
  }

  async fetchWards(districtId: number): Promise<TAddressWard[]> {
    const response = await getFetchWards(districtId)
    return response.data?.data || []
  }
}

export const addressService = new AddressService()
