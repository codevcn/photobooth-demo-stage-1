import { useEffect, useRef, useState } from 'react'
import {
  TProductImage,
  TElementType,
  TElementsVisualState,
  TTextVisualState,
  TStickerVisualState,
  TPrintedImageVisualState,
  TSurfaceType,
  TBaseProduct,
  TPrintAreaInfo,
  TPrintTemplate,
  TTemplateFrame,
} from '@/utils/types/global'
import { TextElement } from './element/text-element/TextElement'
import { PrintedImageElementMenu } from './element/printed-image-element/Menu'
import { TextElementMenu } from './element/text-element/Menu'
import { StickerElementMenu } from './element/sticker-element/Menu'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { usePrintArea } from '@/hooks/use-print-area'
import { PrintAreaOverlay } from '@/pages/edit/template/PrintAreaOverlay'
import ActionBar from './ActionBar'
import { toast } from 'react-toastify'
import { useVisualStatesCollector } from '@/hooks/use-visual-states-collector'
import { SurfaceSelector } from './SurfaceSelector'
import { CropElementModal } from './element/printed-image-element/CropElementModal'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BothSidesPreviewModal } from './BothSidesPreviewModal'
import { TemplateFrameMenu } from './template/TemplateFrameMenu'

type TSelectingType = TElementType | null

interface EditAreaProps {
  editingProductImage: TProductImage
  initialTextElements: TTextVisualState[]
  initialStickerElements: TStickerVisualState[]
  onUpdateText: (elements: TTextVisualState[]) => void
  onUpdateStickers: (elements: TStickerVisualState[]) => void
  initialPrintedImageElements: TPrintedImageVisualState[]
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
  pickedTemplate: TPrintTemplate
  pickedFrame?: TTemplateFrame
  onPickFrame: (frame: TTemplateFrame) => void
  onShowPrintedImagesModal: (frameId: string) => void
  onCropFrameImage: (croppedImageUrl: string, frameId: string) => void
  onRemoveFrameImage: (frameId: string) => void
  onChangeFrameImage: (imgURL: string, frameId: string) => void
}

const EditArea: React.FC<EditAreaProps> = ({
  editingProductImage,
  initialTextElements,
  initialStickerElements,
  initialPrintedImageElements,
  onUpdateText,
  onUpdateStickers,
  onRemovePrintedImages,
  htmlToCanvasEditorRef,
  cartCount,
  handleAddToCart,
  mockupId,
  selectedColor,
  selectedPrintAreaInfo,
  onSelectSurface,
  activeProduct,
  pickedTemplate,
  pickedFrame,
  onPickFrame,
  onShowPrintedImagesModal,
  onCropFrameImage,
  onRemoveFrameImage,
  onChangeFrameImage,
}) => {
  const [showCropModal, setShowCropModal] = useState<boolean>(false)
  const [cropElementId, setCropElementId] = useState<string | null>(null)
  const [cropImageUrl, setCropImageUrl] = useState<string>('')
  const [showBothSidesModal, setShowBothSidesModal] = useState<boolean>(false)
  const editAreaContainerRef = useRef<HTMLDivElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectingType, setSelectingType] = useState<TSelectingType>(null)
  const { collectMockupVisualStates } = useVisualStatesCollector()
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false)
  const {
    printAreaRef,
    overlayRef,
    containerElementRef,
    initializePrintArea,
    checkIfAnyElementOutOfBounds,
  } = usePrintArea()
  const navigate = useNavigate()

  const handleSelectFrameOnPrintArea = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string
  ) => {
    const foundFrame = pickedTemplate.frames.find((f) => f.id === frameId && f.placedImage)
    if (foundFrame) {
      eventEmitter.emit(EInternalEvents.PICK_ELEMENT, e.currentTarget, 'template-frame')
      onPickFrame(foundFrame)
      handleUpdateSelectedElementId(frameId, 'template-frame')
    } else {
      onShowPrintedImagesModal(frameId)
    }
  }

  const handleRemoveText = (id: string) => {
    onUpdateText(initialTextElements.filter((el) => el.id !== id))
  }

  const handleRemoveSticker = (id: string) => {
    onUpdateStickers(initialStickerElements.filter((el) => el.id !== id))
  }

  const handleRemovePrintedImage = (id: string) => {
    onRemovePrintedImages([id])
  }

  const handleUpdateSelectedElementId = (id: string | null, type: TSelectingType) => {
    setSelectedElementId(id)
    setSelectingType(type)
  }

  const cancelSelectingElement = () => {
    setSelectedElementId(null)
    setSelectingType(null)
  }

  const handleChangeFrameImage = (frameId: string) => {
    if (!pickedFrame || pickedFrame.id !== frameId) return
    if (!pickedFrame.placedImage) return
    onChangeFrameImage(pickedFrame.placedImage.imgURL, frameId)
  }

  const handleOpenCropModal = (frameId: string) => {
    console.log('>>> piced frame:', pickedFrame)
    if (!pickedFrame || pickedFrame.id !== frameId) return
    if (!pickedFrame.placedImage) return
    setCropElementId(frameId)
    setCropImageUrl(pickedFrame.placedImage.imgURL)
    setShowCropModal(true)
  }

  const handleCropComplete = (frameId: string, croppedImageUrl: string) => {
    onCropFrameImage(croppedImageUrl, frameId)
    setShowCropModal(false)
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

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    eventEmitter.on(EInternalEvents.OPEN_CROP_ELEMENT_MODAL, handleOpenCropModal)
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
      eventEmitter.off(EInternalEvents.OPEN_CROP_ELEMENT_MODAL, handleOpenCropModal)
    }
  }, [initialPrintedImageElements])

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
    <div className="flex flex-col rounded-2xl relative max-h-full" ref={editAreaContainerRef}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/qr')}
          className="flex items-center gap-2 bg-pink-cl hover:bg-dark-pink-cl text-white font-bold py-1 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex items-center flex-wrap gap-2 text-left flex-1">
          <h3 className="text-lg font-bold text-gray-800 pl-4">Khu vực chỉnh sửa</h3>
          <p className="text-sm text-gray-500">Chạm vào các phần tử để di chuyển vị trí</p>
        </div>
      </div>

      <div
        ref={(node) => {
          htmlToCanvasEditorRef.current = node
          containerElementRef.current = node
        }}
        className="NAME-canvas-editor relative z-0 flex flex-1 flex-shrink basis-auto min-h-0 w-full h-full max-h-[500px] overflow-hidden"
      >
        {selectedPrintAreaInfo && selectedPrintAreaInfo.imageUrl ? (
          <img
            src={selectedPrintAreaInfo.imageUrl}
            alt={editingProductImage.name}
            className="NAME-product-image touch-none w-full h-auto max-h-[500px] object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-triangle-alert-icon lucide-triangle-alert"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <p className="text-base mt-3">Không có ảnh sản phẩm</p>
          </div>
        )}

        {/* Print Area Overlay */}
        <PrintAreaOverlay
          overlayRef={overlayRef}
          printAreaRef={printAreaRef}
          name="Print Area Overlay"
          printTemplate={pickedTemplate}
          onClickFrame={handleSelectFrameOnPrintArea}
        />

        <div className="absolute top-0 left-0 w-full h-full z-50">
          {initialTextElements.length > 0 &&
            initialTextElements.map((textEl) => (
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
        </div>
      </div>

      {selectedElementId && (
        <div className="bg-white rounded py-2 pb-0 mt-1">
          {selectingType === 'text' ? (
            <TextElementMenu elementId={selectedElementId} />
          ) : selectingType === 'sticker' ? (
            <StickerElementMenu elementId={selectedElementId} />
          ) : selectingType === 'printed-image' ? (
            <PrintedImageElementMenu elementId={selectedElementId} />
          ) : selectingType === 'template-frame' ? (
            <TemplateFrameMenu
              frameId={selectedElementId}
              onOpenCropModal={handleOpenCropModal}
              onClose={cancelSelectingElement}
              onShowPrintedImagesModal={onShowPrintedImagesModal}
              onRemoveFrameImage={onRemoveFrameImage}
            />
          ) : (
            <></>
          )}
        </div>
      )}

      <SurfaceSelector
        selectedSurface={selectedPrintAreaInfo.surfaceType}
        onSurfaceChange={onSelectSurface}
        productPrintAreaList={activeProduct.printAreaList}
        onShowBothSidesPreview={() => setShowBothSidesModal(true)}
      />

      {/* Action Bar */}
      <div className="px-4 mt-2">
        <ActionBar cartCount={cartCount} isLoading={isAddingToCart} onAddToCart={beforeAddToCart} />
      </div>

      {/* Crop Modal */}
      {showCropModal && cropElementId && (
        <CropElementModal
          imageUrl={cropImageUrl}
          elementId={cropElementId}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropModal(false)}
        />
      )}

      {/* Both Sides Preview Modal */}
      <BothSidesPreviewModal
        show={showBothSidesModal}
        onClose={() => setShowBothSidesModal(false)}
        activeProduct={activeProduct}
        pickedTemplate={pickedTemplate}
        onClickFrame={handleSelectFrameOnPrintArea}
      />
    </div>
  )
}

export default EditArea
