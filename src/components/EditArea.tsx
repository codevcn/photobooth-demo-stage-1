import { useRef, useState } from 'react'
import { IProductImage, ITextElement, IStickerElement, IPrintedImage } from '@/utils/types'
import { TextElement } from './TextElement'
import { StickerElement } from './StickerElement'
import { PrintedImagesModal } from './PrintedImages'
import { Image } from 'lucide-react'
import { PrintedImageElement } from './PrintedImageElement'
import { usePinch } from '@use-gesture/react'
import { PrintedImageElementMenu } from './printed-image-element/menu'
import { TextElementMenu } from './text-element/menu'

const maxZoom: number = 1
const minZoom: number = 0.3

type TSelectingType = 'text' | 'sticker' | 'printed-image' | null

interface EditAreaProps {
  editingProduct?: IProductImage
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
  editingProduct,
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
  const [selectingType, setSelectingType] = useState<TSelectingType>(null)

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

  const adjustElementForPinch = (scale: number, angle: number) => {
    const root = editAreaRef.current
    if (root) {
      const productImage = root.querySelector<HTMLDivElement>(`.NAME-product-image`)
      if (productImage) {
        productImage.style.transform = `scale(${scale}) rotate(${angle}deg)`
      }
    }
  }

  const bindForPinch = usePinch(
    ({ offset: [scale, angle] }) => adjustElementForPinch(scale, angle),
    {
      scaleBounds: { min: minZoom, max: maxZoom },
      rubberband: true,
      eventOptions: { passive: false },
    }
  )

  const handleUpdateSelectedElementId = (id: string | null, type: TSelectingType) => {
    setSelectedElementId(id)
    setSelectingType(type)
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

      <div className="relative w-full h-fit rounded-lg bg-white py-2">
        {editingProduct && (
          <img
            {...bindForPinch()}
            src={editingProduct.url}
            alt={editingProduct.name}
            className="NAME-product-image touch-none w-full h-full object-contain"
          />
        )}

        {/* Text Elements */}
        {textElements.map((textEl) => (
          <TextElement
            key={textEl.id}
            element={textEl}
            onRemoveElement={handleRemoveText}
            onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'text')}
            selectedElementId={selectedElementId}
          />
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
            element={img}
            onRemoveElement={handleRemovePrintedImage}
            onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'printed-image')}
            selectedElementId={selectedElementId}
          />
        ))}
      </div>

      {selectedElementId && (
        <div className="bg-white rounded p-2 mt-2">
          {selectingType === 'text' ? (
            <TextElementMenu elementId={selectedElementId} />
          ) : selectingType === 'sticker' ? (
            <div></div>
          ) : selectingType === 'printed-image' ? (
            <PrintedImageElementMenu elementId={selectedElementId} />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  )
}

export default EditArea
