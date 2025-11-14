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
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getInitialContants } from '@/utils/contants'
import { productService } from '@/services/product.service'
import { PageLoading } from '@/components/custom/Loading'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { convertMimeTypeToExtension } from '@/utils/helpers'

type TEditPageProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

const EditPage = ({ products, printedImages }: TEditPageProps) => {
  const { sessionId, addPreSentMockupImageLink } = useGlobalContext()
  const mockupId = useSearchParams()[0].get('mockupId')

  const firstImage = useMemo<TProductImage>(() => {
    const galleryImgs: TProductImage[] = []
    for (const prod of products) {
      galleryImgs.push(...prod.images)
    }
    return galleryImgs[0]
  }, [products])

  const [activeImageId, setActiveImageId] = useState<number>(firstImage.id)
  const [selectedColor, setSelectedColor] = useState<string>(firstImage.color.value)
  const [selectedSize, setSelectedSize] = useState<TProductSize>(firstImage.size)
  const [cartCount, setCartCount] = useState<number>(0)

  // Tool overlays
  const [showVariantPicker, setShowVariantPicker] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  // Edit elements
  const [textElements, setTextElements] = useState<TTextVisualState[]>([])
  const [stickerElements, setStickerElements] = useState<TStickerVisualState[]>([])
  const [printedImageElements, setPrintedImageElements] = useState<TPrintedImageVisualState[]>([])
  const { handleSaveHtmlAsImage } = useHtmlToCanvas()
  const { handleSaveHtmlAsImageWithDesiredSize } = useHtmlToCanvas()
  const { removeFromElementLayers } = useElementLayerContext()
  const editorRef = useRef<HTMLDivElement>(null)

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

  const navigate = useNavigate()

  const handleAddPrintedElement = (type: TElementType, printedImageElements: TPrintedImage[]) => {
    if (type === 'printed-image' && printedImageElements.length > 0) {
      setPrintedImageElements((pre) => {
        const printedElements: TPrintedImageVisualState[] = []
        for (const ele of printedImageElements) {
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
      setTextElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    } else if (type === 'sticker') {
      setStickerElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    } else if (type === 'printed-image') {
      setPrintedImageElements((pre) => pre.filter(({ id }) => !ids.includes(id)))
    }
    removeFromElementLayers(ids)
  }

  const validateBeforeAddToCart = (): string | null => {
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

  const handleAddToCart = (
    elemtnsVisualState: TElementsVisualState,
    onDoneAdd: () => void,
    onError: (error: Error) => void
  ) => {
    if (!sessionId || !editorRef.current) return
    const message = validateBeforeAddToCart()
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
            console.log('>>> pre-send mockup image res:', res)
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
    handleSaveHtmlAsImageWithDesiredSize(
      editorRef.current,
      selectedPrintAreaInfo.area.widthRealPx,
      selectedPrintAreaInfo.area.heightRealPx,
      imgMimeType,
      (imageDataUrl, imageSizeInfo) => {
        console.log('>>> active pro:', { activeProduct, selectedPrintAreaInfo })
        console.log('>>> image size info:', imageSizeInfo)
      },
      (error) => {}
    )
  }

  const handleAddText = (text: string) => {
    setTextElements([
      ...textElements,
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
    setStickerElements([
      ...stickerElements,
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

  const handleSelectVariant = (color: string, size: TProductSize, productImageId: number) => {
    setSelectedColor(color)
    setSelectedSize(size)
    if (productImageId !== activeImageId) {
      setActiveImageId(productImageId)
    }
  }

  const initClickOnPageEvent = () => {
    document.addEventListener('click', (e) => {
      eventEmitter.emit(EInternalEvents.CLICK_ON_PAGE, e.target as HTMLElement | null)
    })
  }

  const initCartCount = () => {
    queueMicrotask(() => {
      setCartCount(LocalStorageHelper.countSavedMockupImages())
    })
  }

  const handleSelectSurface = (surfaceType: TSurfaceType) => {
    const printAreaInfo = activeProduct.printAreaList.find(
      (area) => area.surfaceType === surfaceType
    )
    if (printAreaInfo) setSelectedPrintAreaInfo(printAreaInfo)
  }

  const restoreMockupVisualStates = (mockupId: string, sessionId: string) => {
    const savedMockup = LocalStorageHelper.getSavedMockupData()
    if (!savedMockup) {
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
      setTextElements(restoredTextElements)
    }

    // Restore sticker elements
    const restoredStickerElements = foundMockup.elementsVisualState.stickers || []
    if (restoredStickerElements.length > 0) {
      setStickerElements(restoredStickerElements)
    }

    // Restore printed image elements
    const restoredPrintedImageElements = foundMockup.elementsVisualState.printedImages || []
    if (restoredPrintedImageElements.length > 0) {
      setPrintedImageElements(restoredPrintedImageElements)
    }

    // Restore product selection
    const productInfoId = foundProductInfo.productImageId
    setActiveImageId(productInfoId)
    setSelectedColor(foundProductInfo.color.value)
    setSelectedSize(foundProductInfo.size)

    // Restore surface type
    const surfaceType = foundMockup.surfaceInfo.type
    if (surfaceType) {
      handleSelectSurface(surfaceType)
    }
  }

  const initEditElement = () => {
    if (mockupId && sessionId) {
      restoreMockupVisualStates(mockupId, sessionId)
    } else if (printedImages.length > 0) {
      const firstImage = printedImages[0]
      if (firstImage) {
        setPrintedImageElements([
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
      <div className="min-h-screen bg-superlight-pink-cl flex flex-col max-w-md mx-auto">
        {/* Gallery Section */}
        <div className="pt-4 pb-3 px-4 bg-white shadow-sm relative">
          <div
            onClick={() => navigate('/')}
            className="absolute top-3 left-2 bg-pink-cl py-0.5 px-2 rounded-lg"
          >
            <ArrowLeft size={20} className="text-white" />
          </div>
          <ProductGallery
            products={products}
            activeImageId={activeImageId}
            activeProduct={activeProduct}
            onSelectImage={setActiveImageId}
            printedImages={printedImages}
          />
        </div>

        {/* Edit Area */}
        <div className="mt-4">
          <div className="flex-1 px-2">
            <EditArea
              textElements={textElements}
              stickerElements={stickerElements}
              onUpdateText={setTextElements}
              onUpdateStickers={setStickerElements}
              printedImages={printedImages}
              onAddPrintedImages={(ele) => handleAddPrintedElement('printed-image', ele)}
              onRemovePrintedImages={(ids) => handleRemoveELement('printed-image', ids)}
              printedImageElements={printedImageElements}
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

          {/* Bottom Menu */}
          <div className="bg-white border-t border-gray-200">
            <BottomMenu
              onAddText={() => setShowTextEditor(true)}
              onAddSticker={() => setShowStickerPicker(true)}
              onChooseVariant={() => setShowVariantPicker(true)}
              product={activeProduct}
            />
          </div>

          {/* Overlays */}
          {showVariantPicker && (
            <ProductVariantPicker
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              onSelectVariant={handleSelectVariant}
              onClose={() => setShowVariantPicker(false)}
              product={activeProduct}
            />
          )}

          {showTextEditor && (
            <TextEditor onAddText={handleAddText} onClose={() => setShowTextEditor(false)} />
          )}

          <StickerPicker
            onAddSticker={handleAddSticker}
            onClose={() => setShowStickerPicker(false)}
            show={showStickerPicker}
          />
        </div>
      </div>
    )
  )
}

const ElementLayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [elementLayers, setElementLayers] = useState<TElementLayerState[]>([])

  const addToElementLayers = (elementLayer: TElementLayerState) => {
    setElementLayers((prev) => {
      if (prev.some((el) => el.elementId === elementLayer.elementId)) {
        return prev
      }
      const updatedLayers = [...prev, elementLayer]
      updatedLayers.sort((a, b) => a.index - b.index)
      return updatedLayers
    })
  }

  const removeFromElementLayers = (elementIds: string[]) => {
    setElementLayers((prev) => prev.filter((el) => !elementIds.includes(el.elementId)))
  }

  return (
    <ElementLayerContext.Provider
      value={{ elementLayers, setElementLayers, addToElementLayers, removeFromElementLayers }}
    >
      {children}
    </ElementLayerContext.Provider>
  )
}

const PageWrapper = () => {
  const [error, setError] = useState<string | null>(null)
  const { products, setProducts } = useProductContext()
  const { editedImages: printedImages } = useEditedImageContext()
  const [fetched, setFetched] = useState<boolean>(false)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      const data = await productService.fetchProductsByPage(1, 20)
      setProducts(data)
      setFetched(true)
    } catch (error) {
      setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
    }
  }

  useEffect(() => {
    if (fetched && (products.length === 0 || printedImages.length === 0)) {
      setError('Không có sản phẩm hoặc hình in nào để chỉnh sửa.')
    }
  }, [products, printedImages])

  useEffect(() => {
    fetchProducts()
  }, [])

  return error ? (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-circle-alert-icon lucide-circle-alert text-pink-cl"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <p className="text-pink-cl text-lg text-center font-bold mt-2">{error}</p>
      <button
        onClick={() => navigate('/')}
        className="bg-pink-cl text-white text-lg font-bold px-4 py-2 rounded mt-4"
      >
        Quay lại trang chủ
      </button>
    </div>
  ) : products.length > 0 && printedImages.length > 0 ? (
    <ElementLayerProvider>
      <EditPage products={products} printedImages={printedImages} />
    </ElementLayerProvider>
  ) : (
    <PageLoading message="Đang tải dữ liệu..." />
  )
}

export default PageWrapper
