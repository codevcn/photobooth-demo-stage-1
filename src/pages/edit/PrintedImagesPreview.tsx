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
  const slicedImages = useMemo(() => printedImages.slice(0, 1), [printedImages])

  return (
    <div
      onClick={onOpenPrintedImagesModal}
      className="border-solid text-pink-cl bg-white active:scale-90 transition relative"
    >
      {slicedImages.map((img, index) => (
        <div key={img.id} className="h-[50px] overflow-hidden border-2 border-pink-cl rounded">
          <img
            src={img.url}
            alt="Printed image"
            className={`h-max w-max max-h-[80px] max-w-[80px] object-cover rounded`}
          />
        </div>
      ))}
    </div>
  )
}
