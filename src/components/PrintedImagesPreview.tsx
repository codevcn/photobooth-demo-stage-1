import { IPrintedImage } from '@/utils/types'
import { useMemo } from 'react'

interface PrintedImagesPreviewProps {
  onOpenPrintedImagesModal: () => void
  printedImages: IPrintedImage[]
}

export const PrintedImagesPreview = ({
  onOpenPrintedImagesModal,
  printedImages,
}: PrintedImagesPreviewProps) => {
  const slicedImages = useMemo(() => printedImages.slice(0, 2), [printedImages])

  return (
    <div
      onClick={onOpenPrintedImagesModal}
      className="p-2 h-10 border-solid text-pink-cl bg-white active:scale-90 transition relative translate-y-1"
    >
      {slicedImages.map((img, index) => (
        <div key={img.id}>
          <img
            src={img.url}
            alt="Printed image"
            className={`${
              index === 0 ? '-translate-x-2 -translate-y-2' : ''
            } h-max w-max max-h-[80px] max-w-[80px] rounded absolute top-0 right-0 origin-right`}
          />
        </div>
      ))}
    </div>
  )
}
