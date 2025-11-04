import { TPrintedImage } from '@/utils/types'
import { useMemo } from 'react'

interface PrintedImagesPreviewProps {
  onOpenPrintedImagesModal: () => void
  printedImages: TPrintedImage[]
}

export const PrintedImagesPreview = ({
  onOpenPrintedImagesModal,
  printedImages,
}: PrintedImagesPreviewProps) => {
  const slicedImages = useMemo(() => printedImages.slice(0, 1), [printedImages])

  return (
    <div
      onClick={onOpenPrintedImagesModal}
      className="flex justify-center min-w-[50px] rounded border-solid text-pink-cl bg-white active:scale-90 transition relative shadow"
    >
      {slicedImages.map((img) => (
        <div key={img.id} className="h-[50px] overflow-hidden rounded">
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
