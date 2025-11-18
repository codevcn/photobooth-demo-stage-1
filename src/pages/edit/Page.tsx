import { useEffect, useMemo, useRef, useState } from 'react'
import ProductGallery from './ProductGallery'
import EditArea from './EditArea'
import { Toolbar } from './Toolbar'
import ProductVariantPicker from './product/ProductVariantPicker'
import TextEditor from './element/text-element/TextEditor'
import StickerPicker from './element/sticker-element/StickerPicker'
import {
  TPrintedImage,
  TProductImage,
  TElementType,
  TProductSize,
  TElementsVisualState,
  TProductCartInfo,
  TTextVisualState,
  TStickerVisualState,
  TPrintedImageVisualState,
  TMockupData,
  TSurfaceType,
  TBaseProduct,
  TPrintAreaInfo,
  TImgMimeType,
  TPrintTemplate,
  TTemplateFrame,
} from '@/utils/types/global'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useElementLayerContext, useGlobalContext } from '../../context/global-context'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import { getInitialContants } from '@/utils/contants'
import { productService } from '@/services/product.service'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { convertMimeTypeToExtension } from '@/utils/helpers'
import { TemplatePickerModal } from './template/TemplatePicker'
import { hardCodedPrintTemplates } from '../../configs/print-template'

type TEditPageHorizonProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

/**
 * Hook quản lý state của các elements (text, sticker, printed-image)
 */
const useInitialElementsState = () => {
  const [initialTextElements, setInitialTextElements] = useState<TTextVisualState[]>([])
  const [initialStickerElements, setInitialStickerElements] = useState<TStickerVisualState[]>([])
  const [initialPrintedImageElements, setInitialPrintedImageElements] = useState<
    TPrintedImageVisualState[]
  >([])

  return {
    initialTextElements,
    setInitialTextElements,
    initialStickerElements,
    setInitialStickerElements,
    initialPrintedImageElements,
    setInitialPrintedImageElements,
  }
}

/**
 * Hook quản lý state của product variant (color, size, activeImage)
 */
const useProductVariantState = (firstImage: TProductImage) => {
  const [activeImageId, setActiveImageId] = useState<number>(firstImage.id)
  const [selectedColor, setSelectedColor] = useState<string>(firstImage.color.value)
  const [selectedSize, setSelectedSize] = useState<TProductSize>(firstImage.size)

  return {
    activeImageId,
    setActiveImageId,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
  }
}

/**
 * Hook quản lý state hiển thị các modal/overlay
 */
const useModalState = () => {
  const [showVariantPicker, setShowVariantPicker] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  return {
    showVariantPicker,
    setShowVariantPicker,
    showTextEditor,
    setShowTextEditor,
    showStickerPicker,
    setShowStickerPicker,
  }
}

/**
 * Hook quản lý cart count
 */
const useCartCount = () => {
  const [cartCount, setCartCount] = useState<number>(0)

  const initCartCount = () => {
    queueMicrotask(() => {
      setCartCount(LocalStorageHelper.countSavedMockupImages())
    })
  }

  return { cartCount, setCartCount, initCartCount }
}

/**
 * Validate trước khi thêm sản phẩm vào giỏ hàng
 */
const validateBeforeAddToCart = (
  selectedColor: string,
  selectedSize: TProductSize,
  products: TBaseProduct[]
): string | null => {
  if (!selectedColor || !selectedSize) {
    return 'Vui lòng chọn màu và kích thước sản phẩm trước khi thêm vào giỏ hàng'
  }
  for (const product of products) {
    for (const img of product.images) {
      if (img.color.value === selectedColor && img.size === selectedSize) {
        return null
      }
    }
  }
  return 'Sản phẩm với màu và kích thước đã chọn không tồn tại'
}

/**
 * Khởi tạo event click trên page
 */
const initClickOnPageEvent = () => {
  document.addEventListener('click', (e) => {
    eventEmitter.emit(EInternalEvents.CLICK_ON_PAGE, e.target as HTMLElement | null)
  })
}

/**
 * Restore mockup visual states từ localStorage
 */
const restoreMockupVisualStates = (
  mockupId: string,
  sessionId: string,
  callbacks: {
    setInitialTextElements: (elements: TTextVisualState[]) => void
    setInitialStickerElements: (elements: TStickerVisualState[]) => void
    setInitialPrintedImageElements: (elements: TPrintedImageVisualState[]) => void
    setActiveImageId: (id: number) => void
    setSelectedColor: (color: string) => void
    setSelectedSize: (size: TProductSize) => void
    handleSelectSurface: (surfaceType: TSurfaceType) => void
  }
) => {
  console.log('>>> mock:', { mockupId, sessionId })
  const savedMockup = LocalStorageHelper.getSavedMockupData()
  console.log('>>> savedMockup:', savedMockup)
  if (!savedMockup || savedMockup.sessionId !== sessionId) {
    return
  }
  const cartItems = savedMockup.productsInCart
  let foundMockup: TMockupData | null = null
  let foundProductInfo: TProductCartInfo | null = null

  // Search for the mockup in all cart items
  for (const item of cartItems) {
    const mockup = item.mockupDataList?.find((m) => m.id === mockupId)
    if (mockup) {
      foundMockup = mockup
      foundProductInfo = {
        productId: item.productId,
        productImageId: item.productImageId,
        color: item.color,
        size: item.size,
      }
      break
    }
  }

  if (!foundMockup || !foundProductInfo) return

  // Restore text elements
  const restoredTextElements = foundMockup.elementsVisualState.texts || []
  if (restoredTextElements.length > 0) {
    callbacks.setInitialTextElements(restoredTextElements)
  }

  // Restore sticker elements
  const restoredStickerElements = foundMockup.elementsVisualState.stickers || []
  if (restoredStickerElements.length > 0) {
    callbacks.setInitialStickerElements(restoredStickerElements)
  }

  // Restore printed image elements
  const restoredPrintedImageElements = foundMockup.elementsVisualState.printedImages || []
  console.log('>>> printed 207:', restoredPrintedImageElements)
  if (restoredPrintedImageElements.length > 0) {
    callbacks.setInitialPrintedImageElements(restoredPrintedImageElements)
  }

  // Restore product selection
  const productInfoId = foundProductInfo.productImageId
  callbacks.setActiveImageId(productInfoId)
  callbacks.setSelectedColor(foundProductInfo.color.value)
  callbacks.setSelectedSize(foundProductInfo.size)

  // Restore surface type
  const surfaceType = foundMockup.surfaceInfo.type
  if (surfaceType) {
    callbacks.handleSelectSurface(surfaceType)
  }
}

/**
 * Hook quản lý template
 */
const useTemplateManager = (templates: TPrintTemplate[]) => {
  const [pickedTemplate, setPickedTemplate] = useState<TPrintTemplate>(templates[0])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [pickedFrame, setPickedFrame] = useState<TTemplateFrame>()
  const [availableTemplates, setAvailableTemplates] = useState<TPrintTemplate[]>(templates)

  const handlePickTemplate = (template: TPrintTemplate) => {
    if (pickedTemplate && pickedTemplate.id === template.id) return
    setPickedTemplate(template)
  }

  const addImageToFrame = (image: TPrintedImage, frameId?: string) => {
    setAvailableTemplates((pre) => {
      const templates = [...pre]
      const pickedTemplateId = pickedTemplate.id
      for (const template of templates) {
        if (template.id === pickedTemplateId && !frameId) {
          const foundFrameIndex = template.frames.findIndex((f) => !f.placedImage)
          if (foundFrameIndex >= 0) {
            template.frames[foundFrameIndex].placedImage = {
              id: image.id,
              imgURL: image.url,
              placementState: {
                frameIndex: foundFrameIndex + 1,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
              },
            }
            break
          }
        }
        let frameIndex: number = getInitialContants<number>('PLACED_IMG_FRAME_INDEX')
        for (const frame of template.frames) {
          if (frame.id === frameId) {
            frame.placedImage = {
              id: image.id,
              imgURL: image.url,
              placementState: {
                frameIndex,
                zoom: getInitialContants<number>('PLACED_IMG_ZOOM'),
                objectFit: getInitialContants<'contain'>('PLACED_IMG_OBJECT_FIT'),
                squareRotation: getInitialContants<number>('PLACED_IMG_SQUARE_ROTATION'),
              },
            }
          }
          frameIndex++
        }
      }
      return templates
    })
  }

  const updateFrameImageURL = (newURL: string, frameId: string) => {
    setAvailableTemplates((pre) => {
      const templates = [...pre]
      for (const template of templates) {
        const foundFrame = template.frames.find((f) => f.id === frameId)
        if (foundFrame) {
          if (foundFrame.placedImage) {
            foundFrame.placedImage.imgURL = newURL
          }
          break
        }
      }
      return templates
    })
  }

  const removeFrameImage = (frameId: string) => {
    setAvailableTemplates((prev) => {
      const templates = [...prev]
      for (const template of templates) {
        const foundFrame = template.frames.find((f) => f.id === frameId)
        if (foundFrame && foundFrame.placedImage) {
          foundFrame.placedImage = undefined
          break
        }
      }
      return templates
    })
  }

  return {
    pickedTemplate,
    handlePickTemplate,
    showTemplatePicker,
    setShowTemplatePicker,
    pickedFrame,
    setPickedFrame,
    availableTemplates,
    addImageToFrame,
    updateFrameImageURL,
    removeFrameImage,
  }
}

// ==================== Main Component ====================

export const EditPage = ({ products, printedImages }: TEditPageHorizonProps) => {
  // ==================== Context & Hooks ====================
  const { sessionId } = useGlobalContext()
  const { removeFromElementLayers } = useElementLayerContext()
  const { saveHtmlAsImage, saveHtmlAsImageWithDesiredSize } = useHtmlToCanvas()
  const mockupId = useSearchParams()[0].get('mockupId')
  const editorRef = useRef<HTMLDivElement>(null)

  // ==================== Computed Values - First Image ====================
  const firstImage = useMemo<TProductImage>(() => {
    const galleryImgs: TProductImage[] = []
    for (const prod of products) {
      galleryImgs.push(...prod.images)
    }
    return galleryImgs[0]
  }, [products])

  // ==================== State Management ====================
  const {
    initialTextElements,
    setInitialTextElements,
    initialStickerElements,
    setInitialStickerElements,
    initialPrintedImageElements,
    setInitialPrintedImageElements,
  } = useInitialElementsState()

  const {
    activeImageId,
    setActiveImageId,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
  } = useProductVariantState(firstImage)

  const {
    showVariantPicker,
    setShowVariantPicker,
    showTextEditor,
    setShowTextEditor,
    showStickerPicker,
    setShowStickerPicker,
  } = useModalState()

  const { cartCount, setCartCount, initCartCount } = useCartCount()

  const {
    pickedTemplate,
    handlePickTemplate,
    pickedFrame,
    setPickedFrame,
    addImageToFrame,
    availableTemplates,
    updateFrameImageURL,
    removeFrameImage,
  } = useTemplateManager(hardCodedPrintTemplates)

  // ==================== Computed Values - Active Product ====================
  const [activeProduct, activeProductImage] = useMemo<[TBaseProduct, TProductImage]>(() => {
    let activeProductImage: TProductImage | undefined = undefined
    let activeProduct: TBaseProduct | undefined = undefined
    for (const product of products) {
      for (const img of product.images) {
        if (img.id === activeImageId) {
          activeProductImage = img
          activeProduct = product
        }
      }
    }
    return [activeProduct!, activeProductImage!]
  }, [products, activeImageId])

  const [selectedPrintAreaInfo, setSelectedPrintAreaInfo] = useState<TPrintAreaInfo>(
    activeProduct.printAreaList[0]
  )

  // ==================== Event Handlers - Element Management ====================
  const handleShowPrintedImagesModal = (frameId: string) => {
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, frameId)
  }

  const handleAddPrintedElement = (
    initialPrintedImageElements: TPrintedImage[],
    frameId?: string
  ) => {
    if (initialPrintedImageElements.length > 0) {
      for (const img of initialPrintedImageElements) {
        addImageToFrame(img, frameId)
      }
    }
  }

  const handleRemoveELement = (type: TElementType, ids: string[]) => {
    if (type === 'text') {
      setInitialTextElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    } else if (type === 'sticker') {
      setInitialStickerElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    } else if (type === 'printed-image') {
      setInitialPrintedImageElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    }
    removeFromElementLayers(ids)
  }

  const handleAddText = (text: string) => {
    setInitialTextElements([
      ...initialTextElements,
      {
        id: crypto.randomUUID(),
        content: text,
        angle: getInitialContants<number>('ELEMENT_ROTATION'),
        position: {
          x: getInitialContants<number>('ELEMENT_X'),
          y: getInitialContants<number>('ELEMENT_Y'),
        },
        fontSize: getInitialContants<number>('ELEMENT_TEXT_FONT_SIZE'),
        textColor: getInitialContants<string>('ELEMENT_TEXT_COLOR'),
        fontFamily: getInitialContants<string>('ELEMENT_TEXT_FONT_FAMILY'),
        fontWeight: getInitialContants<number>('ELEMENT_TEXT_FONT_WEIGHT'),
        zindex: getInitialContants<number>('ELEMENT_ZINDEX'),
      },
    ])
  }

  const handleAddSticker = (path: string) => {
    addImageToFrame(
      {
        id: crypto.randomUUID(),
        url: path,
      },
      undefined
    )
  }

  // ==================== Event Handlers - Cart Management ====================
  const cleanPrintAreaBeforeAddToCart = () => {
    const printArea = editorRef.current
      ?.querySelector<HTMLElement>('.NAME-print-area-allowed')
      ?.cloneNode(true) as HTMLElement | null
    if (printArea) {
      printArea.style.zIndex = '-1'
      document.body.prepend(printArea)
    }
    printArea?.style.setProperty('border', 'none')
    const framesDisplayer = printArea?.querySelector<HTMLElement>('.NAME-frames-displayer')
    framesDisplayer?.style.setProperty('background-color', 'transparent')
    framesDisplayer?.style.setProperty('border', 'none')
    for (const frame of printArea?.querySelectorAll<HTMLElement>('.NAME-template-frame') || []) {
      frame.querySelector<HTMLElement>('.NAME-plus-icon-wrapper')?.remove()
    }
    return {
      editor: editorRef.current,
      printArea,
      removeMockPrintArea: () => {
        printArea?.remove()
      },
    }
  }

  const handleAddToCart = async (
    elementsVisualState: TElementsVisualState,
    onDoneAdd: () => void,
    onError: (error: Error) => void
  ) => {
    if (!sessionId) return
    const message = validateBeforeAddToCart(selectedColor, selectedSize, products)
    if (message) {
      return onError(new Error(message))
    }
    const { editor, printArea, removeMockPrintArea } = cleanPrintAreaBeforeAddToCart()
    if (!editor || !printArea) {
      return onError(new Error('Không tìm thấy khu vực in trên sản phẩm'))
    }
    const imgMimeType: TImgMimeType = 'image/png'
    requestIdleCallback(() => {
      saveHtmlAsImage(
        editor,
        imgMimeType,
        (imageData) => {
          const mockupId = LocalStorageHelper.saveMockupImageAtLocal(
            elementsVisualState,
            {
              productId: activeProduct.id,
              productImageId: activeImageId,
              color: activeProductImage.color,
              size: activeProductImage.size,
            },
            {
              dataUrl: URL.createObjectURL(imageData),
              size: {
                width: -1,
                height: -1,
              },
            },
            sessionId,
            {
              id: selectedPrintAreaInfo.id,
              type: selectedPrintAreaInfo.surfaceType,
            }
          )
          requestIdleCallback(() => {
            saveHtmlAsImageWithDesiredSize(
              printArea,
              selectedPrintAreaInfo.area.widthRealPx,
              selectedPrintAreaInfo.area.heightRealPx,
              imgMimeType,
              (imageData, canvasWithDesiredSize) => {
                removeMockPrintArea()
                productService
                  .preSendMockupImage(
                    imageData,
                    `mockup-${Date.now()}.${convertMimeTypeToExtension(imgMimeType)}`
                  )
                  .then((res) => {
                    const result = LocalStorageHelper.updateMockupImagePreSent(mockupId, res.url, {
                      width: canvasWithDesiredSize.width,
                      height: canvasWithDesiredSize.height,
                    })
                    if (!result) {
                      toast.error('Không thể cập nhật kích thước mockup')
                    }
                  })
                  .catch((err) => {
                    console.error('>>> pre-send mockup image error:', err)
                    toast.error('Không thể lưu mockup lên server')
                  })
              },
              (error) => {
                console.error('Error saving mockup image:', error)
                toast.warning(error.message || 'Không thể tạo mockup để lưu lên server')
                onError(error)
              }
            )
          })
          toast.success('Đã thêm vào giỏ hàng')
          setCartCount(LocalStorageHelper.countSavedMockupImages())
          onDoneAdd()
        },
        (error) => {
          console.error('Error saving mockup image:', error)
          toast.warning(
            error.message || 'Không thể lưu mockup, không thể thêm sản phẩm vào giỏ hàng'
          )
          setCartCount(LocalStorageHelper.countSavedMockupImages())
          onError(error)
        }
      )
    })
  }

  // ==================== Event Handlers - Product Variant ====================
  const handleSelectVariant = (color: string, size: TProductSize, productImageId: number) => {
    setSelectedColor(color)
    setSelectedSize(size)
    if (productImageId !== activeImageId) {
      setActiveImageId(productImageId)
    }
  }

  const handleSelectSurface = (surfaceType: TSurfaceType) => {
    const printAreaInfo = activeProduct.printAreaList.find(
      (area) => area.surfaceType === surfaceType
    )
    if (printAreaInfo) setSelectedPrintAreaInfo(printAreaInfo)
  }

  // ==================== Initialization Functions ====================
  const initEditElement = () => {
    if (mockupId && sessionId) {
      restoreMockupVisualStates(mockupId, sessionId, {
        setInitialTextElements,
        setInitialStickerElements,
        setInitialPrintedImageElements,
        setActiveImageId,
        setSelectedColor,
        setSelectedSize,
        handleSelectSurface,
      })
    } else if (printedImages.length > 0) {
      const firstImage = printedImages[0]
      if (firstImage) {
        setInitialPrintedImageElements([
          {
            id: firstImage.id,
            url: firstImage.url,
            position: {
              x: getInitialContants<number>('ELEMENT_X'),
              y: getInitialContants<number>('ELEMENT_Y'),
            },
            angle: getInitialContants<number>('ELEMENT_ROTATION'),
            scale: getInitialContants<number>('ELEMENT_ZOOM'),
            zindex: getInitialContants<number>('ELEMENT_ZINDEX'),
          },
        ])
      }
    }
  }

  useEffect(() => {
    // Update color và size theo product mới
    if (activeProductImage) {
      setSelectedColor(activeProductImage.color.value)
      setSelectedSize(activeProductImage.size)
    }
  }, [activeProductImage])

  useEffect(() => {
    setSelectedPrintAreaInfo(activeProduct.printAreaList[0])
  }, [activeProduct])

  useEffect(() => {
    initClickOnPageEvent()
    initCartCount()
    initEditElement()
    addImageToFrame(printedImages[0])
  }, [])

  return (
    activeImageId &&
    activeProductImage && (
      <div className="h-screen bg-gradient-to-br from-superlight-pink-cl to-light-pink-cl/30">
        {/* Main Content - 2 Column Layout */}
        <div className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,2fr)_8fr] gap-2">
            {/* Left Column: Product Gallery & Info */}
            {/* Product Gallery Card */}
            <ProductGallery
              products={products}
              activeImageId={activeImageId}
              activeProduct={activeProduct}
              onSelectImage={setActiveImageId}
              printedImages={printedImages}
            />

            {/* Right Column: Edit Area */}
            <div className="grid grid-cols-1 md:grid-cols-[5fr_minmax(84px,1fr)] xl:grid-cols-[8fr_1fr] gap-2 h-fit">
              <div className="max-h-[unset] md:max-h-screen bg-white max-w-full w-full rounded-xl shadow-md p-2 outline outline-1 outline-gray-200">
                <EditArea
                  initialTextElements={initialTextElements}
                  initialStickerElements={initialStickerElements}
                  onUpdateText={setInitialTextElements}
                  onUpdateStickers={setInitialStickerElements}
                  onRemovePrintedImages={(ids) => handleRemoveELement('printed-image', ids)}
                  initialPrintedImageElements={initialPrintedImageElements}
                  htmlToCanvasEditorRef={editorRef}
                  cartCount={cartCount}
                  handleAddToCart={handleAddToCart}
                  mockupId={mockupId}
                  selectedColor={selectedColor}
                  onSelectSurface={handleSelectSurface}
                  editingProductImage={activeProductImage}
                  selectedPrintAreaInfo={selectedPrintAreaInfo}
                  activeProduct={activeProduct}
                  pickedTemplate={pickedTemplate}
                  pickedFrame={pickedFrame}
                  onPickFrame={setPickedFrame}
                  onShowPrintedImagesModal={handleShowPrintedImagesModal}
                  onCropFrameImage={updateFrameImageURL}
                  onRemoveFrameImage={removeFrameImage}
                  onChangeFrameImage={updateFrameImageURL}
                  printedImagesCount={printedImages.length}
                  templates={availableTemplates}
                  onPickTemplate={(template) => {
                    handlePickTemplate(template)
                  }}
                />
              </div>

              {/* Editing Tools Card */}
              <Toolbar
                onAddText={() => setShowTextEditor(true)}
                onAddSticker={() => setShowStickerPicker(true)}
                onChooseVariant={() => setShowVariantPicker(true)}
                product={activeProduct}
                printedImages={printedImages}
                onAddPrintedImages={(newImages, frameId) =>
                  handleAddPrintedElement(newImages, frameId)
                }
                pickedTemplate={pickedTemplate}
              />
            </div>
          </div>
        </div>

        {/* Overlays - Full Screen Modals */}
        {showVariantPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <ProductVariantPicker
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onSelectVariant={handleSelectVariant}
              onClose={() => setShowVariantPicker(false)}
              product={activeProduct}
            />
          </div>
        )}

        {showTextEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <TextEditor onAddText={handleAddText} onClose={() => setShowTextEditor(false)} />
          </div>
        )}

        {showStickerPicker && (
          <StickerPicker
            onAddSticker={handleAddSticker}
            onClose={() => setShowStickerPicker(false)}
            show={showStickerPicker}
          />
        )}
      </div>
    )
  )
}
