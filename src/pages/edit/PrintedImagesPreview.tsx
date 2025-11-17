import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useMemo, useState } from 'react'
import { PrintedImagesModal } from './element/printed-image-element/PrintedImages'
import { createPortal } from 'react-dom'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'

interface PrintedImagesPreviewProps {
  printedImages: TPrintedImage[]
  onAddPrintedImages: (elements: TPrintedImage[], frameId?: string) => void
}

export const PrintedImagesPreview = ({
  printedImages,
  onAddPrintedImages,
}: PrintedImagesPreviewProps) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const [frameIdToAddPrintedImage, setFrameIdToAddPrintedImage] = useState<string>()

  const slicedImages = useMemo(() => printedImages.slice(0, 1), [printedImages])

  const handleAddImage = (newImage: TPrintedImage) => {
    onAddPrintedImages([newImage], frameIdToAddPrintedImage)
    setShowPrintedImagesModal(false)
  }

  const handleOpenPrintedImagesModal = () => {
    setShowPrintedImagesModal((pre) => !pre)
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, (show, frameId) => {
      setShowPrintedImagesModal(show)
      setFrameIdToAddPrintedImage(frameId)
    })
    return () => {
      eventEmitter.off(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL)
    }
  }, [])

  return (
    <>
      <div
        onClick={handleOpenPrintedImagesModal}
        className="flex justify-center min-w-[50px] rounded border-solid text-pink-cl bg-white active:scale-90 transition relative outline outline-2 outline-gray-200"
      >
        {slicedImages.map((img) => (
          <div key={img.id} className="flex items-center h-[50px] overflow-hidden rounded">
            <img
              src={img.url}
              alt="Printed image"
              className={`h-max w-max max-h-[50px] max-w-[80px] my-auto object-contain rounded`}
            />
          </div>
        ))}
      </div>

      {showPrintedImagesModal &&
        createPortal(
          <PrintedImagesModal
            onAddImage={handleAddImage}
            onClose={() => setShowPrintedImagesModal(false)}
            printedImages={printedImages}
          />,
          document.body
        )}
    </>
  )
}
