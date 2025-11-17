import { TVoucher, VoucherValidationResult } from '@/utils/types/global'

class VoucherService {
  // Danh sách voucher mẫu
  private readonly SAMPLE_VOUCHERS: TVoucher[] = [
    {
      code: 'SAVE10',
      description: 'Giảm 10% cho đơn hàng',
      discountType: 'percentage',
      discountValue: 10,
    },
    {
      code: 'SAVE20',
      description: 'Giảm 20% cho đơn hàng từ 100,000 VND',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 30000,
      maxDiscount: 50000,
    },
    {
      code: 'SAVE50K',
      description: 'Giảm 50,000 VND cho đơn hàng từ 200,000 VND',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 30000,
    },
    {
      code: 'FREESHIP',
      description: 'Giảm 30,000 VND phí vận chuyển',
      discountType: 'fixed',
      discountValue: 30000,
    },
  ]

  // Hàm kiểm tra tính hợp lệ của voucher
  async checkVoucherValidity(
    code: string,
    orderSubtotal: number
  ): Promise<VoucherValidationResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Tìm voucher
    const voucher = this.SAMPLE_VOUCHERS.find((v) => v.code.toLowerCase() === code.toLowerCase())

    if (!voucher) {
      return {
        success: false,
        message: 'Mã giảm giá không hợp lệ',
      }
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (voucher.minOrderValue && orderSubtotal < voucher.minOrderValue) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${this.formatNumber(
          voucher.minOrderValue
        )} VND để sử dụng mã này`,
      }
    }

    // Tính số tiền giảm
    const discount = this.calculateDiscount(orderSubtotal, voucher)

    return {
      success: true,
      message: `Áp dụng thành công! Giảm ${this.formatNumber(discount)} VND - ${
        voucher.description
      }`,
      voucher,
    }
  }

  // Hàm tính discount từ voucher
  calculateDiscount(subtotal: number, voucher: TVoucher | null): number {
    if (!voucher) return 0

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
      return 0
    }

    let discount = 0

    if (voucher.discountType === 'percentage') {
      discount = (subtotal * voucher.discountValue) / 100
      // Áp dụng giảm tối đa nếu có
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount
      }
    } else if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue
      // Không cho giảm quá tổng tiền
      if (discount > subtotal) {
        discount = subtotal
      }
    }

    return discount
  }

  // Lấy một số voucher mẫu
  async getSomeVouchers(): Promise<TVoucher[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...this.SAMPLE_VOUCHERS]
  }

  // Format number helper
  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export const voucherService = new VoucherService()
