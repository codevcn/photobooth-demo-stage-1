import { useEffect, useRef, useState } from 'react'
import {
  TProductImage,
  TPrintedImage,
  TElementType,
  TElementsVisualState,
  TTextVisualState,
  TStickerVisualState,
  TPrintedImageVisualState,
  TSurfaceType,
  TBaseProduct,
  TPrintAreaInfo,
} from '@/utils/types/global'
import { TextElement } from './element/text-element/TextElement'
import { StickerElement } from './element/sticker-element/StickerElement'
import { PrintedImagesModal } from './element/printed-image-element/PrintedImages'
import { PrintedImageElement } from './element/printed-image-element/PrintedImageElement'
import { PrintedImageElementMenu } from './element/printed-image-element/Menu'
import { TextElementMenu } from './element/text-element/Menu'
import { StickerElementMenu } from './element/sticker-element/Menu'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
// import { ProductImageElementMenu } from './product/product-image/Menu'
import { PrintedImagesPreview } from './PrintedImagesPreview'
// import { useElementControl } from '@/hooks/element/use-element-control'
import { usePrintArea } from '@/hooks/use-print-area'
import { PrintAreaOverlay } from '@/components/print-area/PrintAreaOverlay'
import ActionBar from './ActionBar'
import { toast } from 'react-toastify'
import { useVisualStatesCollector } from '@/hooks/use-visual-states-collector'
import { SurfaceSelector } from './SurfaceSelector'

type TSelectingType = TElementType | null

interface EditAreaProps {
  editingProductImage: TProductImage
  textElements: TTextVisualState[]
  stickerElements: TStickerVisualState[]
  onUpdateText: (elements: TTextVisualState[]) => void
  onUpdateStickers: (elements: TStickerVisualState[]) => void
  printedImages: TPrintedImage[]
  printedImageElements: TPrintedImageVisualState[]
  onAddPrintedImages: (elements: TPrintedImage[]) => void
  onRemovePrintedImages: (ids: string[]) => void
  htmlToCanvasEditorRef: React.MutableRefObject<HTMLDivElement | null>
  cartCount: number
  handleAddToCart: (
    elementsVisualState: TElementsVisualState,
    onDoneAdd: () => void,
    onError: (error: Error) => void
  ) => void
  mockupId: string | null
  selectedColor: string
  selectedPrintAreaInfo: TPrintAreaInfo
  onSelectSurface: (surfaceType: TSurfaceType) => void
  activeProduct: TBaseProduct
}

const EditArea: React.FC<EditAreaProps> = ({
  editingProductImage,
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
  mockupId,
  selectedColor,
  selectedPrintAreaInfo,
  onSelectSurface,
  activeProduct,
}) => {
  const [showPrintedImagesModal, setShowPrintedImagesModal] = useState<boolean>(false)
  const editAreaContainerRef = useRef<HTMLDivElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectingType, setSelectingType] = useState<TSelectingType>(null)
  const { collectMockupVisualStates } = useVisualStatesCollector()
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false)
  // const {
  //   forZoom: { ref: refForZoom },
  //   state: { scale },
  //   handleSetElementState,
  // } = useElementControl(crypto.randomUUID(), { maxZoom, minZoom })

  const {
    printAreaRef,
    overlayRef,
    containerElementRef,
    isOutOfBounds,
    initializePrintArea,
    checkIfAnyElementOutOfBounds,
  } = usePrintArea()

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
        !target.closest('.NAME-text-font-picker') &&
        !target.closest('.NAME-color-picker-modal')
      ) {
        cancelSelectingElement()
      }
    }
  }

  // const handlePickProductImage = (e: React.MouseEvent) => {
  //   if (editingProductImage) {
  //     const target = e.target as HTMLElement
  //     if (target.classList.contains('NAME-product-image')) {
  //       e.stopPropagation()
  //       handleUpdateSelectedElementId(editingProductImage.id, 'product-image')
  //     }
  //   }
  // }

  // const listenSubmitEleProps = (elementId: string | null, scale?: number) => {
  //   if (elementId === selectedElementId && selectingType === 'product-image') {
  //     const root = editAreaContainerRef.current
  //     if (root) {
  //       const productImage = root.querySelector<HTMLDivElement>(`.NAME-product-image`)
  //       if (productImage) {
  //         if (scale) {
  //           handleSetElementState(undefined, undefined, scale)
  //         }
  //       }
  //     }
  //   }
  // }

  const beforeAddToCart = () => {
    if (checkIfAnyElementOutOfBounds()) {
      toast.warning('Vui lòng đảm bảo tất cả phần tử nằm trong vùng in trước khi thêm vào giỏ hàng')
      return
    }
    setIsAddingToCart(true)
    cancelSelectingElement()
    setTimeout(() => {
      // Thu thập visual states của tất cả elements
      handleAddToCart(
        collectMockupVisualStates(htmlToCanvasEditorRef.current || undefined),
        () => {
          setIsAddingToCart(false)
        },
        (error) => {
          setIsAddingToCart(false)
        }
      )
    }, 0)
  }

  // useEffect(() => {
  //   eventEmitter.on(EInternalEvents.SUBMIT_PRODUCT_IMAGE_ELE_PROPS, listenSubmitEleProps)
  //   return () => {
  //     eventEmitter.off(EInternalEvents.SUBMIT_PRODUCT_IMAGE_ELE_PROPS, listenSubmitEleProps)
  //   }
  // }, [selectedElementId, selectingType])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    }
  }, [])

  // Cập nhật vùng in khi sản phẩm thay đổi
  useEffect(() => {
    if (htmlToCanvasEditorRef.current) {
      const imageElement = htmlToCanvasEditorRef.current.querySelector(
        '.NAME-product-image'
      ) as HTMLImageElement

      if (!imageElement) return

      const updatePrintAreaWhenImageLoaded = () => {
        if (htmlToCanvasEditorRef.current) {
          initializePrintArea(selectedPrintAreaInfo.area, htmlToCanvasEditorRef.current)
        }
      }

      // Nếu ảnh đã load xong
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        // Delay nhỏ để đảm bảo DOM đã render xong
        const timeoutId = setTimeout(updatePrintAreaWhenImageLoaded, 50)
        return () => clearTimeout(timeoutId)
      } else {
        // Nếu ảnh chưa load, đợi event load
        imageElement.addEventListener('load', updatePrintAreaWhenImageLoaded)
        return () => imageElement.removeEventListener('load', updatePrintAreaWhenImageLoaded)
      }
    }
  }, [editingProductImage.id, initializePrintArea, selectedPrintAreaInfo])

  // Theo dõi resize của container
  useEffect(() => {
    if (!htmlToCanvasEditorRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          const imageElement = htmlToCanvasEditorRef.current?.querySelector(
            '.NAME-product-image'
          ) as HTMLImageElement

          if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
            setTimeout(() => {
              if (htmlToCanvasEditorRef.current) {
                initializePrintArea(selectedPrintAreaInfo.area, htmlToCanvasEditorRef.current)
              }
            }, 100)
          }
        }
      }
    })

    resizeObserver.observe(htmlToCanvasEditorRef.current)
    return () => resizeObserver.disconnect()
  }, [editingProductImage, initializePrintArea, selectedPrintAreaInfo.area])

  return (
    <div className="rounded-2xl relative" ref={editAreaContainerRef}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-left flex-1">
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
          ref={(node) => {
            htmlToCanvasEditorRef.current = node
            containerElementRef.current = node
          }}
          className="NAME-canvas-editor relative z-0 w-full h-fit max-h-[500px] overflow-hidden"
        >
          {selectedPrintAreaInfo && selectedPrintAreaInfo.imageUrl ? (
            <img
              src={selectedPrintAreaInfo.imageUrl}
              alt={editingProductImage.name}
              className="NAME-product-image touch-none w-full h-full max-h-[calc(500px-8px)] object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-[484px] text-gray-400">
              <p>Không có ảnh sản phẩm</p>
            </div>
          )}

          {/* Print Area Overlay */}
          <PrintAreaOverlay
            overlayRef={overlayRef}
            printAreaRef={printAreaRef}
            isOutOfBounds={isOutOfBounds}
            selectedColor={selectedColor}
          />

          <div className="absolute z-20 top-0 left-0 w-full h-full">
            {/* Text Elements */}
            {textElements.length > 0 &&
              textElements.map((textEl) => (
                <TextElement
                  key={textEl.id}
                  element={textEl}
                  onRemoveElement={handleRemoveText}
                  onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'text')}
                  selectedElementId={selectedElementId}
                  canvasAreaRef={htmlToCanvasEditorRef}
                  mountType={mockupId ? 'from-saved' : 'new'}
                />
              ))}

            {/* Sticker Elements */}
            {stickerElements.length > 0 &&
              stickerElements.map((sticker) => (
                <StickerElement
                  key={sticker.id}
                  element={sticker}
                  onRemoveElement={handleRemoveSticker}
                  onUpdateSelectedElementId={(id) => handleUpdateSelectedElementId(id, 'sticker')}
                  selectedElementId={selectedElementId}
                  canvasAreaRef={htmlToCanvasEditorRef}
                  mountType={mockupId ? 'from-saved' : 'new'}
                />
              ))}

            {/* Printed Image Elements */}
            {printedImageElements.length > 0 &&
              printedImageElements.map((img) => (
                <PrintedImageElement
                  key={img.id}
                  element={img}
                  onRemoveElement={handleRemovePrintedImage}
                  onUpdateSelectedElementId={(id) =>
                    handleUpdateSelectedElementId(id, 'printed-image')
                  }
                  selectedElementId={selectedElementId}
                  canvasAreaRef={htmlToCanvasEditorRef}
                  mountType={mockupId ? 'from-saved' : 'new'}
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
          ) : (
            <></>
          )}
        </div>
      )}

      <SurfaceSelector
        selectedSurface={selectedPrintAreaInfo.surfaceType}
        onSurfaceChange={onSelectSurface}
        productPrintAreaList={activeProduct.printAreaList}
      />

      {/* Action Bar */}
      <div className="px-4 pb-3 mt-4">
        <ActionBar cartCount={cartCount} isLoading={isAddingToCart} onAddToCart={beforeAddToCart} />
      </div>
    </div>
  )
}

export default EditArea
