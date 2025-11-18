import {
  TFrameToAddPrintedImage,
  TImageSizeInfo,
  TPrintedImage,
  TPrintTemplate,
} from '@/utils/types/global'
import { useEffect, useState } from 'react'
import { PrintedImagesModal } from './element/printed-image-element/PrintedImages'
import { createPortal } from 'react-dom'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { allowPrintedImageOnTemplateType } from '@/configs/print-template'
import { toast } from 'react-toastify'

interface PrintedImagesPreviewProps {
  printedImages: TPrintedImage[]
  onAddPrintedImages: (elements: TPrintedImage[], frameId?: string) => void
  pickedTemplate: TPrintTemplate
}

export const PrintedImagesPreview = ({
  printedImages,
  onAddPrintedImages,
  pickedTemplate,
}: PrintedImagesPreviewProps) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const [frameToAddPrintedImage, setFrameToAddPrintedImage] = useState<TFrameToAddPrintedImage>()
  const [displayedImage, setDisplayedImage] = useState<TPrintedImage | null>(null)

  const handleAddImage = (newImage: TPrintedImage, imgSize: TImageSizeInfo) => {
    // if (
    //   frameToAddPrintedImage &&
    //   !allowPrintedImageOnTemplateType(frameToAddPrintedImage.rectType, imgSize)
    // ) {
    //   toast.error('Ảnh không phù hợp với khung hình đã chọn.')
    //   return
    // }
    onAddPrintedImages([newImage], frameToAddPrintedImage?.frameId)
    setShowPrintedImagesModal(false)
  }

  const handleOpenPrintedImagesModal = () => {
    setShowPrintedImagesModal((pre) => !pre)
  }

  const init = () => {
    setDisplayedImage(printedImages[0])
  }

  useEffect(() => {
    init()
    eventEmitter.on(
      EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL,
      (show, frameToAddPrintedImage, rectType) => {
        setShowPrintedImagesModal(show)
        setFrameToAddPrintedImage({ frameId: frameToAddPrintedImage, rectType })
      }
    )
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
        {displayedImage && (
          <div
            key={displayedImage.id}
            className="flex items-center h-[50px] overflow-hidden rounded"
          >
            <img
              src={displayedImage.url}
              alt="Printed image"
              className={`h-max w-max max-h-[50px] max-w-[80px] my-auto object-contain rounded`}
            />
          </div>
        )}
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
