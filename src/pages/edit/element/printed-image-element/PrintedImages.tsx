import { getNaturalSizeOfImage } from '@/utils/helpers'
import { TPrintedImage } from '@/utils/types'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ImageProps {
  img: TPrintedImage
  index: number
  imgsContainerRef: React.RefObject<HTMLDivElement>
  onAddImage: (printedImg: TPrintedImage) => void
}

const Image = ({ img, index, imgsContainerRef, onAddImage }: ImageProps) => {
  const { url, id } = img

  const handleAddImage = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const imgInfo = target.getAttribute('data-img-info')
    if (!imgInfo) return
    const { naturalWidth, naturalHeight } = JSON.parse(imgInfo)
    onAddImage({ ...img, width: naturalWidth, height: naturalHeight })
  }

  useEffect(() => {
    getNaturalSizeOfImage(
      url,
      (width, height) => {
        const imgBox = imgsContainerRef.current?.querySelector<HTMLDivElement>(
          `.NAME-image-box[data-img-box-id='${id}']`
        )
        if (imgBox) {
          imgBox.setAttribute(
            'data-img-info',
            JSON.stringify({ naturalWidth: width, naturalHeight: height })
          )
          const imgEle = imgBox.querySelector<HTMLImageElement>('img')
          if (imgEle) {
            imgEle.style.cssText = `width: ${width}px; aspect-ratio: ${width} / ${height};`
          }
        }
      },
      (err) => {}
    )
  }, [url])

  return (
    <div
      onClick={handleAddImage}
      className="NAME-image-box cursor-pointer relative w-fit h-fit rounded-xl overflow-hidden border-2 border-border active:border-primary hover:border-primary transition-colors group"
      data-img-info=""
      data-img-box-id={id}
    >
      <img
        src={url || '/placeholder.svg'}
        alt={`Printed Image ${index + 1}`}
        className="max-w-full group-hover:scale-105 transition-transform duration-200"
      />
    </div>
  )
}

interface PrintedImagesProps {
  show: boolean
  onAddImage: (printedImg: TPrintedImage) => void
  onClose: () => void
  printedImages: TPrintedImage[]
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
      className="fixed inset-0 z-[999] flex items-center justify-center"
    >
      <div onClick={onClose} className="bg-black/70 absolute inset-0 z-10"></div>
      <div className="relative z-20 bg-background w-full max-w-[430px] rounded-lg max-h-[80vh] flex flex-col transition duration-500 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Chọn ảnh bạn đã chụp</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2" ref={imgsContainerRef}>
            {printedImages.map((img, index) => (
              <Image
                key={img.id}
                img={img}
                index={index}
                imgsContainerRef={imgsContainerRef}
                onAddImage={onAddImage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
