import { useEffect, useRef, useState } from 'react'
import {
  IProductImage,
  ITextElement,
  IStickerElement,
  IPrintedImage,
  TElementType,
} from '@/utils/types'
import { TextElement } from './text-element/TextElement'
import { StickerElement } from './sticker-element/StickerElement'
import { PrintedImagesModal } from './printed-image-element/PrintedImages'
import { Image } from 'lucide-react'
import { PrintedImageElement } from './printed-image-element/PrintedImageElement'
import { usePinch } from '@use-gesture/react'
import { PrintedImageElementMenu } from './printed-image-element/menu'
import { TextElementMenu } from './text-element/menu'
import { StickerElementMenu } from './sticker-element/menu'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { ProductImageElementMenu } from './product-image/menu'
import { PrintedImagesPreview } from './PrintedImagesPreview'

const maxZoom: number = 1
const minZoom: number = 0.3

type TSelectingType = TElementType | 'product-image' | null

type TElementProperties = { scale: number; angle: number }

interface EditAreaProps {
  editingProduct?: IProductImage
  color: string
  textElements: ITextElement[]
  stickerElements: IStickerElement[]
  onUpdateText: (elements: ITextElement[]) => void
  onUpdateStickers: (elements: IStickerElement[]) => void
  printedImages: IPrintedImage[]
  printedImageElements: IPrintedImage[]
  onAddPrintedImages: (elements: IPrintedImage[]) => void
  onRemovePrintedImages: (ids: string[]) => void
  htmlToCanvasEditorRef: React.RefObject<HTMLDivElement>
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
  onAddPrintedImages,
  onRemovePrintedImages,
  htmlToCanvasEditorRef,
}) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const editAreaRef = useRef<HTMLDivElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectingType, setSelectingType] = useState<TSelectingType>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })

  const handleRemoveText = (id: string) => {
    onUpdateText(textElements.filter((el) => el.id !== id))
  }

  const handleRemoveSticker = (id: string) => {
    onUpdateStickers(stickerElements.filter((el) => el.id !== id))
  }

  const handleAddImage = (newImage: IPrintedImage) => {
    onAddPrintedImages([newImage])
    setShowPrintedImagesModal(false)
  }

  const handleRemovePrintedImage = (id: string) => {
    onRemovePrintedImages([id])
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

  const listenClickOnPageEvent = (target: HTMLElement | null) => {
    if (target) {
      if (
        !target.closest('.NAME-root-element') &&
        !target.closest('.NAME-menu-section') &&
        !target.closest('.NAME-text-font-picker')
      ) {
        setSelectedElementId(null)
        setSelectingType(null)
      }
    }
  }

  const handlePickProductImage = (e: React.MouseEvent) => {
    if (editingProduct) {
      const target = e.target as HTMLElement
      if (target.classList.contains('NAME-product-image')) {
        e.stopPropagation()
        handleUpdateSelectedElementId(editingProduct.id, 'product-image')
      }
    }
  }

  const listenSubmitEleProps = (elementId: string | null, scale?: number, angle?: number) => {
    if (elementId === selectedElementId && selectingType === 'product-image') {
      const root = editAreaRef.current
      if (root) {
        const productImage = root.querySelector<HTMLDivElement>(`.NAME-product-image`)
        if (productImage) {
          if (scale) {
            productImage.style.transform = `scale(${scale}) rotate(${propertiesRef.current.angle}deg)`
            propertiesRef.current.scale = scale
          }
          if (angle || angle === 0) {
            productImage.style.transform = `scale(${propertiesRef.current.scale}) rotate(${
              angle || 0
            }deg)`
            propertiesRef.current.angle = angle
          }
        }
      }
    }
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_PRODUCT_IMAGE_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_PRODUCT_IMAGE_ELE_PROPS, listenSubmitEleProps)
    }
  }, [selectedElementId, selectingType])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    }
  }, [])

  return (
    <div className="rounded-2xl relative" ref={editAreaRef}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-800">Khu vực chỉnh sửa</h3>
          <p className="text-xs text-gray-500">Chạm vào các phần tử để di chuyển vị trí</p>
        </div>
        <div className="h-fit">
          <PrintedImagesPreview
            onOpenPrintedImagesModal={handleOpenPrintedImagesModal}
            printedImages={printedImages}
          />
          <PrintedImagesModal
            show={showPrintedImagesModal}
            onAddImage={handleAddImage}
            onClose={() => setShowPrintedImagesModal(false)}
            printedImages={printedImages}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <div
          ref={htmlToCanvasEditorRef}
          className="relative w-full h-fit bg-transparent py-2 px-2 max-h-[500px] min-[300px] overflow-hidden"
        >
          {editingProduct && (
            <img
              {...bindForPinch()}
              src={editingProduct.url}
              alt={editingProduct.name}
              className="NAME-product-image touch-none w-full h-full max-h-[calc(500px-8px)] object-contain"
              onClick={handlePickProductImage}
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
              element={sticker}
              onRemoveElement={handleRemoveSticker}
              onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'sticker')}
              selectedElementId={selectedElementId}
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
      </div>

      {selectedElementId && (
        <div className="bg-white rounded p-2 mt-3">
          {selectingType === 'text' ? (
            <TextElementMenu elementId={selectedElementId} textElements={textElements} />
          ) : selectingType === 'sticker' ? (
            <StickerElementMenu elementId={selectedElementId} />
          ) : selectingType === 'printed-image' ? (
            <PrintedImageElementMenu elementId={selectedElementId} />
          ) : selectingType === 'product-image' ? (
            <ProductImageElementMenu elementId={selectedElementId} />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  )
}

export default EditArea
