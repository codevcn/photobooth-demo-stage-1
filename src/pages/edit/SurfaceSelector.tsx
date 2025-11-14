import { DropdownMenu } from '@/components/common/DropdownMenu'
import { labelToSurfaceType } from '@/utils/helpers'
import { TPrintAreaInfo, TSurfaceType } from '@/utils/types/global'
import { useMemo } from 'react'

type TSurfaceSelectorProps = {
  selectedSurface: TSurfaceType
  onSurfaceChange: (surfaceType: TSurfaceType) => void
  productPrintAreaList?: TPrintAreaInfo[]
}

export const SurfaceSelector = ({
  selectedSurface,
  onSurfaceChange,
  productPrintAreaList,
}: TSurfaceSelectorProps) => {
  const options = useMemo(() => {
    return (
      productPrintAreaList?.map((printAreaInfo) => ({
        label: labelToSurfaceType(printAreaInfo.surfaceType),
        value: printAreaInfo.surfaceType,
        leftIcon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-image-icon lucide-image"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        ),
      })) || []
    )
  }, [productPrintAreaList])

  return (
    <div className="bg-white rounded-lg p-3 mt-3 border border-gray-300">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Chọn mặt in:</label>
        <div className="flex-1">
          <DropdownMenu options={options} value={selectedSurface} onChange={onSurfaceChange} />
        </div>
      </div>
    </div>
  )
}
