import { useEffect, useRef, useState } from 'react'
import {
  TProductImage,
  TTextElement,
  TStickerElement,
  TPrintedImage,
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
import { usePrintArea } from '@/hooks/use-print-area'
import { PrintAreaOverlay } from '@/components/print-area/PrintAreaOverlay'
import ActionBar from './ActionBar'

const maxZoom: number = 3
const minZoom: number = 0.3

type TSelectingType = TElementType | 'product-image' | null

interface EditAreaProps {
  editingProduct?: TProductImage
  color: string
  textElements: TTextElement[]
  stickerElements: TStickerElement[]
  onUpdateText: (elements: TTextElement[]) => void
  onUpdateStickers: (elements: TStickerElement[]) => void
  printedImages: TPrintedImage[]
  printedImageElements: TPrintedImage[]
  onAddPrintedImages: (elements: TPrintedImage[]) => void
  onRemovePrintedImages: (ids: string[]) => void
  htmlToCanvasEditorRef: React.RefObject<HTMLDivElement>
  cartCount: number
  handleAddToCart: () => void
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
  cartCount,
  handleAddToCart,
}) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const editAreaContainerRef = useRef<HTMLDivElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectingType, setSelectingType] = useState<TSelectingType>(null)
  const {
    forZoom: { ref: refForZoom },
    state: { scale },
    handleSetElementState,
  } = useElementControl(crypto.randomUUID(), { maxZoom, minZoom })

  const { printAreaRef, overlayRef, isOutOfBounds, printAreaBounds, initializePrintArea } =
    usePrintArea()

  const handleRemoveText = (id: string) => {
    onUpdateText(textElements.filter((el) => el.id !== id))
  }

  const handleRemoveSticker = (id: string) => {
    onUpdateStickers(stickerElements.filter((el) => el.id !== id))
  }

  const handleAddImage = (newImage: TPrintedImage) => {
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

  const cancelSelectingElement = () => {
    setSelectedElementId(null)
    setSelectingType(null)
  }

  const listenClickOnPageEvent = (target: HTMLElement | null) => {
    if (target) {
      if (
        !target.closest('.NAME-root-element') &&
        !target.closest('.NAME-menu-section') &&
        !target.closest('.NAME-text-font-picker')
      ) {
        cancelSelectingElement()
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
      const root = editAreaContainerRef.current
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

  const beforeAddToCart = () => {
    cancelSelectingElement()
    setTimeout(() => {
      handleAddToCart()
    }, 0)
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

  // Cập nhật vùng in khi sản phẩm thay đổi
  useEffect(() => {
    if (editingProduct && htmlToCanvasEditorRef.current) {
      // Delay để đảm bảo DOM đã render xong
      const timeoutId = setTimeout(() => {
        if (htmlToCanvasEditorRef.current) {
          // Sử dụng initializePrintArea với container element thay vì getBoundingClientRect
          initializePrintArea(editingProduct, htmlToCanvasEditorRef.current)
        }
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [editingProduct?.id, initializePrintArea]) // Sử dụng initializePrintArea thay vì updatePrintArea

  // Theo dõi resize của container
  useEffect(() => {
    if (!editingProduct || !htmlToCanvasEditorRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Chỉ update khi kích thước thực sự thay đổi đáng kể
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          // Sử dụng initializePrintArea thay vì updatePrintArea để tránh getBoundingClientRect
          setTimeout(() => {
            if (htmlToCanvasEditorRef.current) {
              initializePrintArea(editingProduct, htmlToCanvasEditorRef.current)
            }
          }, 100)
        }
      }
    })

    resizeObserver.observe(htmlToCanvasEditorRef.current)
    return () => resizeObserver.disconnect()
  }, [editingProduct, initializePrintArea]) // Thay đổi dependency

  return (
    <div className="rounded-2xl relative" ref={editAreaContainerRef}>
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
          data-edit-container="true"
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

          {/* Print Area Overlay */}
          <PrintAreaOverlay
            overlayRef={overlayRef}
            printAreaRef={printAreaRef}
            isOutOfBounds={isOutOfBounds}
          />

          <div className="absolute z-20 top-0 left-0 w-full h-full">
            {/* Text Elements */}
            {textElements.map((textEl) => (
              <TextElement
                key={textEl.id}
                element={textEl}
                onRemoveElement={handleRemoveText}
                onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'text')}
                selectedElementId={selectedElementId}
                canvasAreaRef={htmlToCanvasEditorRef}
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
                canvasAreaRef={htmlToCanvasEditorRef}
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
                canvasAreaRef={htmlToCanvasEditorRef}
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

      {/* Action Bar */}
      <div className="px-4 pb-3 mt-4">
        <ActionBar cartCount={cartCount} onAddToCart={beforeAddToCart} />
      </div>
    </div>
  )
}

export default EditArea
