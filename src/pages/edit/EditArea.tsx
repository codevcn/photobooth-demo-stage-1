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
  TFrameRectType,
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
import { TemplatePicker } from './template/TemplatePicker'
import { StickerElement } from './element/sticker-element/StickerElement'

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
  onShowPrintedImagesModal: (frameId: string, rectType: TFrameRectType) => void
  onCropFrameImage: (croppedImageUrl: string, frameId: string) => void
  onRemoveFrameImage: (frameId: string) => void
  onChangeFrameImage: (imgURL: string, frameId: string) => void
  printedImagesCount: number
  templates: TPrintTemplate[]
  onPickTemplate: (template: TPrintTemplate) => void
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
  printedImagesCount,
  templates,
  onPickTemplate,
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
    containerElementRef,
    initializePrintArea,
    checkIfAnyElementOutOfBounds,
    isOutOfBounds,
    overlayRef,
  } = usePrintArea()
  const navigate = useNavigate()

  const handleSelectFrameOnPrintArea = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string,
    rectType: TFrameRectType
  ) => {
    console.log('>>> frame id:', { frameId, rectType })
    const foundFrame = pickedTemplate.frames.find((f) => f.id === frameId && f.placedImage)
    if (foundFrame) {
      eventEmitter.emit(EInternalEvents.PICK_ELEMENT, e.currentTarget, 'template-frame')
      onPickFrame(foundFrame)
      handleUpdateSelectedElementId(frameId, 'template-frame')
    } else {
      onShowPrintedImagesModal(frameId, rectType)
    }
  }
  console.log('>>> selectedElementId:', { selectedElementId, selectingType })

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
        !target.closest('.NAME-color-picker-modal') &&
        !target.closest('.NAME-template-frame')
      ) {
        console.log('>>> run this 182:', { target })
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
          className="flex items-center gap-2 bg-pink-cl text-white font-bold py-1 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition duration-200"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex items-center flex-wrap gap-2 text-left flex-1">
          <h3 className="text-lg font-bold text-gray-800 pl-4">Khu vực chỉnh sửa</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 flex-1 flex-shrink basis-auto min-h-0 w-full md:h-full md:max-h-[500px]">
        <TemplatePicker
          classNames={{
            templatesList: `grid 
              md:hidden 
              xl:grid
              grid-rows-2 
              grid-flow-col 
              grid-cols-none 
              gap-2 
              overflow-x-auto 
              md:overflow-y-auto
              order-2 
              shadow-[0_0_10px_1px_rgba(0,0,0,0.25)] 
              w-full 
              md:w-[40%] 
              rounded-[6px] 
              px-1 
              py-4
              md:grid-flow-row
              md:grid-cols-2
              md:grid-rows-none`,
            templateItem: 'h-[118px] md:h-auto w-[118px] md:w-auto',
          }}
          onPickTemplate={onPickTemplate}
          printedImagesCount={printedImagesCount}
          templates={templates}
        />
        <div className="w-full xl:w-[60%] order-1 relative z-0">
          <div
            ref={(node) => {
              htmlToCanvasEditorRef.current = node
              containerElementRef.current = node
            }}
            className="NAME-canvas-editor h-full"
          >
            {selectedPrintAreaInfo && selectedPrintAreaInfo.imageUrl ? (
              <img
                src={selectedPrintAreaInfo.imageUrl}
                alt={editingProductImage.name}
                className="NAME-product-image touch-none w-full h-full max-h-[500px] object-contain"
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
              printAreaRef={printAreaRef}
              name="Print Area Overlay"
              printTemplate={pickedTemplate}
              onClickFrame={handleSelectFrameOnPrintArea}
              frame={{ classNames: { container: 'active:scale-90 transition' } }}
              overlayRef={overlayRef}
              isOutOfBounds={isOutOfBounds}
            />

            {/* Sticker Elements */}
            {initialStickerElements.length > 0 &&
              initialStickerElements.map((sticker) => (
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
      </div>

      <div className="bg-white rounded smd:h-[41.5px] mt-2 relative">
        {selectedElementId ? (
          selectingType === 'text' ? (
            <TextElementMenu elementId={selectedElementId} onClose={cancelSelectingElement} />
          ) : selectingType === 'sticker' ? (
            <StickerElementMenu elementId={selectedElementId} onClose={cancelSelectingElement} />
          ) : selectingType === 'printed-image' ? (
            <PrintedImageElementMenu elementId={selectedElementId} />
          ) : selectingType === 'template-frame' ? (
            <TemplateFrameMenu
              frameId={selectedElementId}
              templateFrames={pickedTemplate.frames}
              onOpenCropModal={handleOpenCropModal}
              onClose={cancelSelectingElement}
              onShowPrintedImagesModal={onShowPrintedImagesModal}
              onRemoveFrameImage={onRemoveFrameImage}
            />
          ) : (
            <></>
          )
        ) : (
          <SurfaceSelector
            selectedSurface={selectedPrintAreaInfo.surfaceType}
            onSurfaceChange={onSelectSurface}
            productPrintAreaList={activeProduct.printAreaList}
            onShowBothSidesPreview={() => setShowBothSidesModal(true)}
          />
        )}
      </div>

      {/* Action Bar */}
      <ActionBar cartCount={cartCount} isLoading={isAddingToCart} onAddToCart={beforeAddToCart} />

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
