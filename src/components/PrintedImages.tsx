import { getNaturalSizeOfImage } from '@/utils/helpers'
import { IPrintedImage } from '@/utils/types'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ImageProps {
  imgURL: string
  imgId: string
  index: number
  imgsContainerRef: React.RefObject<HTMLDivElement>
}

const Image = ({ imgURL, index, imgsContainerRef, imgId }: ImageProps) => {
  useEffect(() => {
    getNaturalSizeOfImage(
      imgURL,
      (width, height) => {
        const imgEle = imgsContainerRef.current?.querySelector<HTMLImageElement>(
          `.NAME-image-box[data-img-box-id='${imgId}'] img`
        )
        if (imgEle) {
          imgEle.style.cssText = `width: ${width}px; height: ${height}px;`
        }
      },
      (err) => {}
    )
  }, [imgURL])

  return (
    <div data-img-box-id={imgId} className="NAME-image-box cursor-pointer">
      <img
        src={imgURL || '/placeholder.svg'}
        alt={`Printed Image ${index + 1}`}
        className="w-0 h-0 max-h-[100px] group-hover:scale-105 transition-transform duration-200"
      />
    </div>
  )
}

interface PrintedImagesProps {
  show: boolean
  onAddImage: (printedImg: IPrintedImage) => void
  onClose: () => void
  printedImages: IPrintedImage[]
}

export const PrintedImagesModal = ({
  onAddImage,
  onClose,
  printedImages,
  show,
}: PrintedImagesProps) => {
  const imgsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
      }}
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
    >
      <div
        style={{
          opacity: show ? 1 : 0,
        }}
        className="bg-background w-full max-w-[430px] rounded-t-3xl max-h-[80vh] flex flex-col transition duration-1000 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Chọn ảnh chụp tại photobooth</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2" ref={imgsContainerRef}>
            {printedImages.map((img, index) => (
              <div
                key={img.id}
                onClick={() => onAddImage(img)}
                className="relative w-fit h-fit rounded-xl overflow-hidden border-2 border-border active:border-primary hover:border-primary transition-colors group"
              >
                <Image
                  imgURL={img.url}
                  index={index}
                  imgsContainerRef={imgsContainerRef}
                  imgId={img.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
