import { useRef, useState } from 'react'
import { IProductImage, ITextElement, IStickerElement, IPrintedImage } from '@/utils/types'
import { TextElement } from './TextElement'
import { StickerElement } from './StickerElement'
import { PrintedImagesModal } from './PrintedImages'
import { Image } from 'lucide-react'
import { PrintedImageElement } from './PrintedImageElement'

interface EditAreaProps {
  editingImage?: IProductImage
  color: string
  textElements: ITextElement[]
  stickerElements: IStickerElement[]
  onUpdateText: (elements: ITextElement[]) => void
  onUpdateStickers: (elements: IStickerElement[]) => void
  printedImages: IPrintedImage[]
  printedImageElements: IPrintedImage[]
  onUpdatePrintedImages: (elements: IPrintedImage[]) => void
}

const EditArea: React.FC<EditAreaProps> = ({
  editingImage,
  color,
  printedImages,
  textElements,
  stickerElements,
  printedImageElements,
  onUpdateText,
  onUpdateStickers,
  onUpdatePrintedImages,
}) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const editAreaRef = useRef<HTMLDivElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  const handleRemoveText = (id: string) => {
    onUpdateText(textElements.filter((el) => el.id !== id))
  }

  const handleRemoveSticker = (id: string) => {
    onUpdateStickers(stickerElements.filter((el) => el.id !== id))
  }

  const handleAddImage = (newImage: IPrintedImage) => {
    onUpdatePrintedImages([...printedImageElements, newImage])
    setShowPrintedImagesModal(false)
  }

  const handleRemovePrintedImage = (id: string) => {
    onUpdatePrintedImages(printedImageElements.filter((el) => el.id !== id))
  }

  const handleOpenPrintedImagesModal = () => {
    setShowPrintedImagesModal((pre) => !pre)
  }

  return (
    <div className="rounded-2xl relative" ref={editAreaRef}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800">Khu vực chỉnh sửa</h3>
          <p className="text-xs text-gray-500">Chạm vào các phần tử để di chuyển vị trí</p>
        </div>
        <div>
          <button
            onClick={handleOpenPrintedImagesModal}
            className="p-2 border-2 border-pink-cl border-solid text-pink-cl rounded-full bg-white active:scale-90 transition"
          >
            <Image size={20} color="currentColor" className="flex" />
          </button>
          <PrintedImagesModal
            show={showPrintedImagesModal}
            onAddImage={handleAddImage}
            onClose={() => setShowPrintedImagesModal(false)}
            printedImages={printedImages}
          />
        </div>
      </div>

      <div className="relative w-full h-fit rounded-lg overflow-hidden bg-white py-2">
        {editingImage && (
          <img
            src={editingImage.url}
            alt={editingImage.name}
            className="w-full h-full object-contain"
          />
        )}

        {/* Text Elements */}
        {textElements.map((textEl) => (
          <TextElement key={textEl.id} textEl={textEl} handleRemoveText={handleRemoveText} />
        ))}

        {/* Sticker Elements */}
        {stickerElements.map((sticker) => (
          <StickerElement
            key={sticker.id}
            sticker={sticker}
            handleRemoveSticker={handleRemoveSticker}
          />
        ))}

        {/* Printed Image Elements */}
        {printedImageElements.map((img) => (
          <PrintedImageElement
            key={img.id}
            imgEl={img}
            handleRemovePrintedImage={handleRemovePrintedImage}
            onUpdateSelectedElementId={setSelectedElementId}
            selectedElementId={selectedElementId}
          />
        ))}
      </div>
    </div>
  )
}

export default EditArea
