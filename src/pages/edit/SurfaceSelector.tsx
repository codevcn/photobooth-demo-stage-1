import { labelToSurfaceType } from '@/utils/helpers'
import { TPrintAreaInfo, TSurfaceType } from '@/utils/types/global'

type TPickButtonProps = {
  printAreaInfo?: TPrintAreaInfo
  isSelected: boolean
  onSurfaceChange: (surfaceType: TSurfaceType) => void
  isBothSides?: boolean
}

const PickButton = ({
  printAreaInfo,
  isSelected,
  onSurfaceChange,
  isBothSides,
}: TPickButtonProps) => {
  const finalSurfaceType: TSurfaceType = isBothSides ? 'both' : printAreaInfo!.surfaceType
  return (
    <button
      key={finalSurfaceType}
      onClick={() => onSurfaceChange(finalSurfaceType)}
      className={`
        flex items-center justify-center gap-2 px-4 py-1 rounded-md font-medium transition-all duration-200 active:scale-95
        ${
          isSelected
            ? 'bg-pink-cl text-white shadow-md border-2 border-pink-cl'
            : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
        }${isBothSides ? 'grid col-span-2 sm:col-span-1' : ''}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isSelected ? 'text-white' : 'text-gray-600'}
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <span className="text-sm">
        {(isBothSides ? 'Xem trước ' : 'Edit ') + labelToSurfaceType(finalSurfaceType)}
      </span>
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white ml-auto"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  )
}

type TSurfaceSelectorProps = {
  selectedSurface: TSurfaceType
  onSurfaceChange: (surfaceType: TSurfaceType) => void
  productPrintAreaList?: TPrintAreaInfo[]
  onShowBothSidesPreview?: () => void
}

export const SurfaceSelector = ({
  selectedSurface,
  onSurfaceChange,
  productPrintAreaList,
  onShowBothSidesPreview,
}: TSurfaceSelectorProps) => {
  if (!productPrintAreaList || productPrintAreaList.length === 0) {
    return null
  }

  // Nếu chỉ có 1 surface thì không cần hiển thị selector
  if (productPrintAreaList.length === 1) {
    return null
  }

  const handleClickOnBothSides = () => {
    if (onShowBothSidesPreview) {
      onShowBothSidesPreview()
    } else {
      onSurfaceChange('both')
    }
  }

  return (
    <div className="bg-white rounded-lg p-1 mt-2 border border-gray-200 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 grow">
        {productPrintAreaList.map((printAreaInfo) => {
          return (
            <PickButton
              key={printAreaInfo.surfaceType}
              printAreaInfo={printAreaInfo}
              isSelected={printAreaInfo.surfaceType === selectedSurface}
              onSurfaceChange={onSurfaceChange}
            />
          )
        })}
        <PickButton
          isSelected={selectedSurface === 'both'}
          onSurfaceChange={handleClickOnBothSides}
          isBothSides
        />
      </div>
    </div>
  )
}
