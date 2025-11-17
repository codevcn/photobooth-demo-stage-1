import { TAddressProvinceList } from '@/utils/types/api'

class AddressService {
  constructor() {}

  async fetchProvinces(): Promise<TAddressProvinceList> {
    const fetchAddressApiURL = 'https://34tinhthanh.com/api/provinces'
    return fetch(fetchAddressApiURL).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch provinces')
      }
      return response.json() as Promise<TAddressProvinceList>
    })
  }
}

export const addressService = new AddressService()
