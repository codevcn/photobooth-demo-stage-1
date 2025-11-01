import { useEffect, useRef, useState } from 'react'
import {
  IProductImage,
  ITextElement,
  IStickerElement,
  IPrintedImage,
  TElementType,
} from '@/utils/types'
import { TextElement } from './element/text-element/TextElement'
import { StickerElement } from './element/sticker-element/StickerElement'
import { PrintedImagesModal } from './element/printed-image-element/PrintedImages'
import { PrintedImageElement } from './element/printed-image-element/PrintedImageElement'
import { PrintedImageElementMenu } from './element/printed-image-element/Menu'
import { TextElementMenu } from './element/text-element/Menu'
import { StickerElementMenu } from './element/sticker-element/Menu'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { ProductImageElementMenu } from './product/product-image/Menu'
import { PrintedImagesPreview } from './PrintedImagesPreview'
import { useElementControl } from '@/hooks/element/use-element-control'

const maxZoom: number = 3
const minZoom: number = 0.3

type TSelectingType = TElementType | 'product-image' | null

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
  const {
    forZoom: { ref: refForZoom },
    state: { scale },
    handleSetElementState,
  } = useElementControl(crypto.randomUUID(), { maxZoom, minZoom })

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

  const listenSubmitEleProps = (elementId: string | null, scale?: number) => {
    if (elementId === selectedElementId && selectingType === 'product-image') {
      const root = editAreaRef.current
      if (root) {
        const productImage = root.querySelector<HTMLDivElement>(`.NAME-product-image`)
        if (productImage) {
          if (scale) {
            handleSetElementState(undefined, undefined, scale)
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
          className="relative z-0 w-full h-fit py-2 px-2 max-h-[500px] overflow-hidden"
        >
          <img
            ref={(node) => {
              refForZoom.current = node
            }}
            style={{
              transform: `scale(${scale})`,
            }}
            src={editingProduct?.url}
            alt={editingProduct?.name}
            className="NAME-product-image touch-none w-full h-full max-h-[calc(500px-8px)] object-contain"
            onClick={handlePickProductImage}
          />
          <div className="absolute z-0 top-0 left-0 w-full h-full">
            {/* Text Elements */}
            {textElements.map((textEl) => (
              <TextElement
                key={textEl.id}
                element={textEl}
                onRemoveElement={handleRemoveText}
                onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'text')}
                selectedElementId={selectedElementId}
                editContainerRef={htmlToCanvasEditorRef}
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
                editContainerRef={htmlToCanvasEditorRef}
              />
            ))}

            {/* Printed Image Elements */}
            {printedImageElements.map((img) => (
              <PrintedImageElement
                key={img.id}
                element={img}
                onRemoveElement={handleRemovePrintedImage}
                onUpdateSelectedElementId={(id) =>
                  handleUpdateSelectedElementId(id, 'printed-image')
                }
                selectedElementId={selectedElementId}
                editContainerRef={htmlToCanvasEditorRef}
              />
            ))}
          </div>
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
