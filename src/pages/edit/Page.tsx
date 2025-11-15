import { useEffect, useMemo, useRef, useState } from 'react'
import ProductGallery from './ProductGallery'
import EditArea from './EditArea'
import BottomMenu from './BottomMenu'
import ProductVariantPicker from './product/ProductVariantPicker'
import TextEditor from './element/text-element/TextEditor'
import StickerPicker from './element/sticker-element/StickerPicker'
import {
  TPrintedImage,
  TProductImage,
  TElementLayerState,
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
} from '@/utils/types/global'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import {
  ElementLayerContext,
  useEditedImageContext,
  useElementLayerContext,
  useGlobalContext,
  useProductContext,
} from '../../context/global-context'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getInitialContants } from '@/utils/contants'
import { productService } from '@/services/product.service'
import { PageLoading } from '@/components/custom/Loading'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { convertMimeTypeToExtension } from '@/utils/helpers'

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
  const savedMockup = LocalStorageHelper.getSavedMockupData()
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

// ==================== Main Component ====================

export const EditPage = ({ products, printedImages }: TEditPageHorizonProps) => {
  // ==================== Context & Hooks ====================
  const { sessionId, addPreSentMockupImageLink } = useGlobalContext()
  const { removeFromElementLayers } = useElementLayerContext()
  const { handleSaveHtmlAsImage } = useHtmlToCanvas()
  const navigate = useNavigate()
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
  const handleAddPrintedElement = (
    type: TElementType,
    initialPrintedImageElements: TPrintedImage[]
  ) => {
    if (type === 'printed-image' && initialPrintedImageElements.length > 0) {
      setInitialPrintedImageElements((pre) => {
        const printedElements: TPrintedImageVisualState[] = []
        for (const ele of initialPrintedImageElements) {
          const oldEleId = ele.id
          if (pre.some((e) => e.id === oldEleId)) {
            ele.id = `${oldEleId}-${crypto.randomUUID()}`
          }
          printedElements.push({
            id: ele.id,
            url: ele.url,
            position: {
              x: getInitialContants<number>('ELEMENT_X'),
              y: getInitialContants<number>('ELEMENT_Y'),
            },
            angle: getInitialContants<number>('ELEMENT_ROTATION'),
            scale: getInitialContants<number>('ELEMENT_ZOOM'),
            zindex: getInitialContants<number>('ELEMENT_ZINDEX'),
          })
        }
        return [...pre, ...printedElements]
      })
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
    setInitialStickerElements([
      ...initialStickerElements,
      {
        id: crypto.randomUUID(),
        path,
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

  // ==================== Event Handlers - Cart Management ====================
  const handleAddToCart = (
    elemtnsVisualState: TElementsVisualState,
    onDoneAdd: () => void,
    onError: (error: Error) => void
  ) => {
    if (!sessionId || !editorRef.current) return
    const message = validateBeforeAddToCart(selectedColor, selectedSize, products)
    if (message) {
      return onError(new Error(message))
    }
    const imgMimeType: TImgMimeType = 'image/webp'
    handleSaveHtmlAsImage(
      editorRef.current,
      imgMimeType,
      (imageData, imageSizeInfo) => {
        const mockupId = LocalStorageHelper.saveMockupImageAtLocal(
          elemtnsVisualState,
          {
            productId: activeProduct.id,
            productImageId: activeImageId,
            color: activeProductImage.color,
            size: activeProductImage.size,
          },
          {
            dataUrl: URL.createObjectURL(imageData),
            size: {
              width: imageSizeInfo.width,
              height: imageSizeInfo.height,
            },
          },
          sessionId,
          {
            id: selectedPrintAreaInfo.id,
            type: selectedPrintAreaInfo.surfaceType,
          }
        )
        productService
          .preSendMockupImage(
            imageData,
            `mockup-${Date.now()}.${convertMimeTypeToExtension(imgMimeType)}`
          )
          .then((res) => {
            addPreSentMockupImageLink(res.url, mockupId)
          })
          .catch((err) => {
            console.error('>>> pre-send mockup image error:', err)
            toast.error('Không thể gửi trước mockup lên server')
          })
        toast.success('Đã thêm vào giỏ hàng')
        setCartCount(LocalStorageHelper.countSavedMockupImages())
        onDoneAdd()
      },
      (error) => {
        console.error('Error saving mockup image:', error)
        toast.warning(error.message || 'Không thể lưu mockup, không thể thêm sản phẩm vào giỏ hàng')
        setCartCount(LocalStorageHelper.countSavedMockupImages())
        onError(error)
      }
    )
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
  }, [])

  return (
    activeImageId &&
    activeProductImage && (
      <div className="min-h-screen bg-gradient-to-br from-superlight-pink-cl to-light-pink-cl/30">
        {/* Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-sm shadow-md border-b border-pink-cl/10">
          <div className="mx-auto px-2 lg:px-4 py-2 lg:py-2.5">
            <div className="flex items-center justify-between">
              {/* Left: Back Button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-pink-cl hover:bg-dark-pink-cl text-white font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Quay lại</span>
              </button>

              {/* Center: Title */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="hidden md:inline">✨</span>
                Chỉnh sửa sản phẩm
                <span className="hidden md:inline">✨</span>
              </h1>

              {/* Right: Cart Button */}
              <button
                onClick={() => navigate('/payment')}
                className="relative flex items-center gap-2 bg-gradient-to-r from-pink-cl to-pink-hover-cl hover:from-dark-pink-cl hover:to-pink-cl text-white font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - 2 Column Layout */}
        <div className="mx-auto px-2 lg:px-3 py-2 lg:py-3">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,2fr)_8fr] gap-2">
            {/* Left Column: Product Gallery & Info */}
            <div className="space-y-2 overflow-hidden bg-white rounded-xl shadow-lg px-1.5 py-3 border border-gray-200">
              {/* Product Gallery Card */}
              <ProductGallery
                products={products}
                activeImageId={activeImageId}
                activeProduct={activeProduct}
                onSelectImage={setActiveImageId}
                printedImages={printedImages}
              />
            </div>

            {/* Right Column: Edit Area */}
            <div className="grid grid-cols-1 spmd:grid-cols-[5fr_minmax(84px,1fr)] xl:grid-cols-[7fr_minmax(84px,1fr)] 2xl:grid-cols-[8fr_1fr] gap-2 h-fit">
              <div className="bg-white max-w-full w-full rounded-xl shadow-md p-3 lg:p-4 outline outline-1 outline-gray-200">
                <EditArea
                  initialTextElements={initialTextElements}
                  initialStickerElements={initialStickerElements}
                  onUpdateText={setInitialTextElements}
                  onUpdateStickers={setInitialStickerElements}
                  printedImages={printedImages}
                  onAddPrintedImages={(ele) => handleAddPrintedElement('printed-image', ele)}
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
                />
              </div>

              {/* Editing Tools Card */}
              <BottomMenu
                onAddText={() => setShowTextEditor(true)}
                onAddSticker={() => setShowStickerPicker(true)}
                onChooseVariant={() => setShowVariantPicker(true)}
                product={activeProduct}
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

        <StickerPicker
          onAddSticker={handleAddSticker}
          onClose={() => setShowStickerPicker(false)}
          show={showStickerPicker}
        />
      </div>
    )
  )
}
