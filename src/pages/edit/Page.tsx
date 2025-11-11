import { useEffect, useMemo, useState } from 'react'
import ProductGallery from './ProductGallery'
import EditArea from './EditArea'
import BottomMenu from './BottomMenu'
import ColorPicker from './product/product-color/ColorPicker'
import SizeSelector from './product/product-size/SizeSelector'
import TextEditor from './element/text-element/TextEditor'
import StickerPicker from './element/sticker-element/StickerPicker'
import {
  TPrintedImage,
  TProductImage,
  TElementLayerState,
  TElementType,
  TProductSize,
  TElementsVisualState,
  TProductInfo,
  TTextVisualState,
  TStickerVisualState,
  TPrintedImageVisualState,
} from '@/utils/types'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import {
  ElementLayerContext,
  useEditedImageContext,
  useElementLayerContext,
  useGlobalContext,
  useProductImageContext,
} from '../../context/global-context'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { swapArrayItems } from '@/utils/helpers'
import { getInitialContants } from '@/utils/contants'
import { productService } from '@/services/product.service'
import { PageLoading } from '@/components/custom/Loading'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'

type TEditPageProps = {
  productImages: TProductImage[][]
  printedImages: TPrintedImage[]
}

const EditPage = ({ productImages, printedImages }: TEditPageProps) => {
  const { sessionId } = useGlobalContext()
  const mockupId = useSearchParams()[0].get('mockupId')

  const [galleryImages, firstImage] = useMemo<[TProductImage[][], TProductImage]>(
    () => [productImages, productImages[0][0]],
    [productImages]
  )

  const [activeImageId, setActiveImageId] = useState<string>(firstImage.id || '')
  const [selectedColor, setSelectedColor] = useState<string>(firstImage.color.value || '')
  const [selectedSize, setSelectedSize] = useState<TProductSize>(firstImage.size[0] || 'M')
  const [cartCount, setCartCount] = useState<number>(0)

  // Tool overlays
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  // Edit elements
  const [textElements, setTextElements] = useState<TTextVisualState[]>([])
  const [stickerElements, setStickerElements] = useState<TStickerVisualState[]>([])
  const [printedImageElements, setPrintedImageElements] = useState<TPrintedImageVisualState[]>([])
  const { editorRef, handleSaveHtmlAsImage } = useHtmlToCanvas()
  const { removeFromElementLayers } = useElementLayerContext()

  const [activeProduct, peerProducts] = useMemo<[TProductImage, TProductImage[]]>(() => {
    let activeProduct: TProductImage
    const products = galleryImages.find((imgs) => {
      for (const img of imgs) {
        if (img.id === activeImageId) {
          activeProduct = img
          return true
        }
      }
      return false
    })
    return [activeProduct!, products || []]
  }, [galleryImages, activeImageId])

  const navigate = useNavigate()

  const handleSetActiveImageId = (imgId: string) => {
    if (imgId !== activeImageId) {
      setActiveImageId(imgId)
      const selectedList = productImages.find((c) => {
        return c.some((p) => p.id === imgId)
      })
      if (!selectedList) return
      swapArrayItems(
        selectedList,
        0,
        selectedList.findIndex(({ id }) => id === imgId)
      )
    }
  }

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

  const handleAddToCart = (elemtnsVisualState: TElementsVisualState) => {
    if (!sessionId) return
    handleSaveHtmlAsImage(
      (imageDataUrl) => {
        LocalStorageHelper.saveMockupImageAtLocal(
          elemtnsVisualState,
          { id: activeImageId, color: activeProduct.color, size: selectedSize },
          imageDataUrl,
          sessionId
        )
        toast.success('Đã thêm vào giỏ hàng')
        setCartCount(LocalStorageHelper.countSavedMockupImages())
      },
      (error) => {
        console.error('Error saving mockup image:', error)
        toast.warning(error.message || 'Không thể lưu mockup, không thể thêm sản phẩm vào giỏ hàng')
        setCartCount(LocalStorageHelper.countSavedMockupImages())
      },
      () => {}
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

  const handleSelectColor = (color: string, productId: string) => {
    setSelectedColor(color)
    if (productId !== activeImageId) {
      handleSetActiveImageId(productId)
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

  const restoreMockupVisualStates = (mockupId: string, sessionId: string) => {
    const savedMockup = LocalStorageHelper.getSavedMockupData()
    if (!savedMockup || savedMockup.sessionId !== sessionId) {
      return
    }
    const cartItems = savedMockup.productsInCart
    let foundMockup: TElementsVisualState | null = null
    let foundProductInfo: TProductInfo | null = null

    // Search for the mockup in all cart items
    for (const item of cartItems) {
      const mockup = item.mockupDataList?.find((m) => m.id === mockupId)
      if (mockup) {
        foundMockup = mockup.elementsVisualState
        foundProductInfo = {
          id: item.id,
          color: item.color,
          size: item.size,
        }
        break
      }
    }

    if (!foundMockup || !foundProductInfo) return

    // Restore text elements
    const restoredTextElements = foundMockup.texts || []
    if (restoredTextElements.length > 0) {
      setTextElements(restoredTextElements)
    }

    // Restore sticker elements
    const restoredStickerElements = foundMockup.stickers || []
    if (restoredStickerElements.length > 0) {
      setStickerElements(restoredStickerElements)
    }

    // Restore printed image elements
    const restoredPrintedImageElements = foundMockup.printedImages || []
    if (restoredPrintedImageElements.length > 0) {
      setPrintedImageElements(restoredPrintedImageElements)
    }

    // Restore product selection
    setActiveImageId(foundProductInfo.id)
    setSelectedColor(foundProductInfo.color.value)
    setSelectedSize(foundProductInfo.size)
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
    initClickOnPageEvent()
    initCartCount()
    initEditElement()
  }, [])

  return (
    activeImageId &&
    activeProduct &&
    peerProducts && (
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
            galleryImages={galleryImages}
            activeImageId={activeImageId}
            onSelectImage={setActiveImageId}
            printedImages={printedImages}
          />
        </div>

        {/* Edit Area */}
        <div className="mt-4">
          <div className="flex-1 px-2">
            <EditArea
              editingProduct={activeProduct}
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
            />
          </div>

          {/* Bottom Menu */}
          <div className="bg-white border-t border-gray-200">
            <BottomMenu
              onAddText={() => setShowTextEditor(true)}
              onAddSticker={() => setShowStickerPicker(true)}
              onChooseColor={() => setShowColorPicker(true)}
              onChooseSize={() => setShowSizeSelector(true)}
              activeProduct={activeProduct}
              peerProducts={peerProducts}
            />
          </div>

          {/* Overlays */}
          {showColorPicker && (
            <ColorPicker
              selectedColor={selectedColor}
              onSelectColor={handleSelectColor}
              onClose={() => setShowColorPicker(false)}
              activeProduct={activeProduct}
              peerProducts={peerProducts}
            />
          )}

          {showSizeSelector && (
            <SizeSelector
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              onClose={() => setShowSizeSelector(false)}
              sizes={activeProduct.size}
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
      return [...prev, elementLayer]
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
  const { productImages, setProductImages } = useProductImageContext()
  const { editedImages: printedImages } = useEditedImageContext()
  const [fetched, setFetched] = useState<boolean>(false)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      const data = await productService.fetchProductsByPage(1, 20)
      setProductImages(data)
      setFetched(true)
    } catch (error) {
      setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
    }
  }

  useEffect(() => {
    if (fetched && (productImages.length === 0 || printedImages.length === 0)) {
      setError('Không có sản phẩm hoặc hình in nào để chỉnh sửa.')
    }
  }, [productImages, printedImages])

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
  ) : productImages.length > 0 && printedImages.length > 0 ? (
    <ElementLayerProvider>
      <EditPage productImages={productImages} printedImages={printedImages} />
    </ElementLayerProvider>
  ) : (
    <PageLoading message="Đang tải dữ liệu..." />
  )
}

export default PageWrapper
