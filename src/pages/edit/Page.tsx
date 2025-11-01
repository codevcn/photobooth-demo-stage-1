import { useEffect, useMemo, useState } from 'react'
import ProductGallery from './ProductGallery'
import EditArea from './EditArea'
import ActionBar from './ActionBar'
import BottomMenu from './BottomMenu'
import ColorPicker from './product/product-color/ColorPicker'
import SizeSelector from './product/product-size/SizeSelector'
import TextEditor from './element/text-element/TextEditor'
import StickerPicker from './element/sticker-element/StickerPicker'
import {
  IPrintedImage,
  IProductImage,
  IStickerElement,
  ITextElement,
  TElementLayerState,
  TElementType,
  TProductSize,
} from '@/utils/types'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { ElementLayerContext, GlobalContext } from '../../context/global-context'
import { productImages } from '@/dev/storage'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { useHtmlToCanvas } from '@/hooks/use-html-to-canvas'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { swapArrayItems } from '@/utils/helpers'
import { INITIAL_TEXT_FONT_SIZE } from '@/utils/contants'

type TProviderState = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
}

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [providerState, setProviderState] = useState<TProviderState>({
    pickedElementRoot: null,
    elementType: null,
  })

  const listenPickElement = (element: HTMLElement | null, elementType: TElementType | null) => {
    setProviderState({ pickedElementRoot: element, elementType })
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.PICK_ELEMENT, listenPickElement)
    return () => {
      eventEmitter.off(EInternalEvents.PICK_ELEMENT, listenPickElement)
    }
  }, [])

  return <GlobalContext.Provider value={providerState}>{children}</GlobalContext.Provider>
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

  return (
    <ElementLayerContext.Provider value={{ elementLayers, setElementLayers, addToElementLayers }}>
      {children}
    </ElementLayerContext.Provider>
  )
}

const EditPage = () => {
  const [sessionId] = useState<string>('12331-5465464-1321311-hththt')
  // Gallery images
  const [galleryImages] = useState<IProductImage[][]>(productImages)
  // Printed images
  const [printedImages] = useState<IPrintedImage[]>([
    {
      id: 'printed-1',
      url: '/images/print-img-1.png',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
    {
      id: 'printed-2',
      url: '/images/print-img-2.png',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
    {
      id: 'printed-3',
      url: '/images/print-img-3.png',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
    {
      id: 'printed-4',
      url: '/images/print-img-4.png',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
    {
      id: 'printed-5',
      url: '/images/print-img-5.jpg',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
  ])

  const [activeImageId, setActiveImageId] = useState<string>(galleryImages[0][0].id)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<TProductSize>('M')
  const [cartCount, setCartCount] = useState<number>(0)

  // Tool overlays
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  // Edit elements
  const [textElements, setTextElements] = useState<ITextElement[]>([])
  const [stickerElements, setStickerElements] = useState<IStickerElement[]>([])
  const [printedImageElements, setPrintedImageElements] = useState<IPrintedImage[]>([
    {
      id: 'printed-1',
      url: '/images/print-img-1.png',
      height: -1,
      width: -1,
      x: 0,
      y: 0,
    },
  ])

  const { editorRef, handleSaveHtmlAsImage } = useHtmlToCanvas()

  const [activeProduct, peerProducts] = useMemo<[IProductImage, IProductImage[]]>(() => {
    let activeProduct: IProductImage
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

  const handleAddPrintedElement = (type: TElementType, printedImageElements: IPrintedImage[]) => {
    if (type === 'printed-image' && printedImageElements.length > 0) {
      setPrintedImageElements((pre) => {
        for (const ele of printedImageElements) {
          const oldEleId = ele.id
          if (pre.some((e) => e.id === oldEleId)) {
            ele.id = `${oldEleId}-${crypto.randomUUID()}`
          }
        }
        return [...pre, ...printedImageElements]
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
  }

  const handleAddToCart = () => {
    handleSaveHtmlAsImage(
      { id: activeImageId, color: activeProduct.color, size: selectedSize },
      sessionId,
      () => {
        toast.success('Đã thêm vào giỏ hàng')
        setCartCount(LocalStorageHelper.countSavedMockupImages())
      }
    )
  }

  const handleAddText = (text: string) => {
    const newText: ITextElement = {
      id: Date.now().toString(),
      text,
      x: 50,
      y: 50,
      fontSize: INITIAL_TEXT_FONT_SIZE,
      color: '#000000',
      content: text,
    }
    setTextElements([...textElements, newText])
  }

  const handleAddSticker = (path: string) => {
    const newSticker: IStickerElement = {
      id: crypto.randomUUID(),
      path,
      x: 50,
      y: 50,
      height: 150,
      width: 150,
    }
    setStickerElements([...stickerElements, newSticker])
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

  useEffect(() => {
    initClickOnPageEvent()
    initCartCount()
  }, [])

  return (
    activeImageId &&
    activeProduct &&
    peerProducts && (
      <GlobalProvider>
        <ElementLayerProvider>
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
              <div className="flex-1 px-2 mb-4">
                <EditArea
                  editingProduct={activeProduct}
                  color={selectedColor}
                  textElements={textElements}
                  stickerElements={stickerElements}
                  onUpdateText={setTextElements}
                  onUpdateStickers={setStickerElements}
                  printedImages={printedImages}
                  onAddPrintedImages={(ele) => handleAddPrintedElement('printed-image', ele)}
                  onRemovePrintedImages={(ids) => handleRemoveELement('printed-image', ids)}
                  printedImageElements={printedImageElements}
                  htmlToCanvasEditorRef={editorRef}
                />
              </div>

              {/* Action Bar */}
              <div className="px-4 pb-3">
                <ActionBar cartCount={cartCount} onAddToCart={handleAddToCart} />
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
        </ElementLayerProvider>
      </GlobalProvider>
    )
  )
}

export default EditPage
