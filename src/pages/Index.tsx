import { createContext, useEffect, useState } from 'react'
import TshirtGallery from '@/components/ProductGallery'
import EditArea from '@/components/EditArea'
import ActionBar from '@/components/ActionBar'
import BottomMenu from '@/components/BottomMenu'
import ColorPicker from '@/components/ColorPicker'
import SizeSelector from '@/components/SizeSelector'
import TextEditor from '@/components/text-element/TextEditor'
import StickerPicker from '@/components/sticker-element/StickerPicker'
import { useToast } from '@/hooks/use-toast'
import {
  IPrintedImage,
  IProductImage,
  IStickerElement,
  ITextElement,
  TElementType,
} from '@/utils/types'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { GlobalContext } from './sharings'

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

const Index = () => {
  const { toast } = useToast()

  // Gallery images
  const [galleryImages] = useState<IProductImage[]>([
    {
      id: 'gallery-1',
      url: '/images/products/shirt.png',
      name: 'Classic White',
      others: [],
    },
    {
      id: 'gallery-2',
      url: '/images/products/cup.png',
      name: 'Navy Blue',
      others: [],
    },
    {
      id: 'gallery-3',
      url: '/images/products/hat.png',
      name: 'Charcoal',
      others: [],
    },
    {
      id: 'gallery-4',
      url: '/images/products/keychain.png',
      name: 'Forest Green',
      others: [],
    },
  ])

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
  ])

  const [activeImageId, setActiveImageId] = useState<string>(galleryImages[0].id)
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF')
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M')
  const [cartCount, setCartCount] = useState<number>(0)

  // Tool overlays
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)

  // Edit elements
  const [textElements, setTextElements] = useState<ITextElement[]>([])
  const [stickerElements, setStickerElements] = useState<IStickerElement[]>([])
  const [printedImageElements, setPrintedImageElements] = useState<IPrintedImage[]>([])

  const activeImage = galleryImages.find((img) => img.id === activeImageId)

  const handleAddElement = (type: TElementType, printedImageElements: IPrintedImage[]) => {
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

  const handleDone = () => {
    setCartCount((prev) => prev + 1)
    toast({
      title: 'Added to cart! 🎉',
      description: `${activeImage?.name} (Size ${selectedSize}) has been added to your cart.`,
      duration: 2000,
    })
    // // Reset editing elements
    // setTextElements([])
    // setStickerElements([])
    // setPrintedImageElements([])
  }

  const handleAddText = (text: string) => {
    const newText: ITextElement = {
      id: Date.now().toString(),
      text,
      x: 50,
      y: 50,
      fontSize: 24,
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

  const initClickOnPageEvent = () => {
    document.addEventListener('click', (e) => {
      eventEmitter.emit(EInternalEvents.CLICK_ON_PAGE, e.target as HTMLElement | null)
    })
  }

  useEffect(() => {
    initClickOnPageEvent()
  }, [])

  return (
    <GlobalProvider>
      <div className="min-h-screen bg-superlight-pink-cl flex flex-col max-w-md mx-auto">
        {/* Gallery Section */}
        <div className="pt-4 pb-3 px-4 bg-white shadow-sm">
          <TshirtGallery
            images={galleryImages}
            activeImageId={activeImageId}
            onSelectImage={setActiveImageId}
          />
        </div>

        {/* Edit Area */}
        <div className="flex-1 px-2 pb-4 pt-4">
          <EditArea
            editingProduct={activeImage}
            color={selectedColor}
            textElements={textElements}
            stickerElements={stickerElements}
            onUpdateText={setTextElements}
            onUpdateStickers={setStickerElements}
            printedImages={printedImages}
            onUpdatePrintedImages={(ele) => handleAddElement('printed-image', ele)}
            printedImageElements={printedImageElements}
          />
        </div>

        {/* Action Bar */}
        <div className="px-4 pb-3">
          <ActionBar cartCount={cartCount} onDone={handleDone} />
        </div>

        {/* Bottom Menu */}
        <div className="bg-white border-t border-gray-200">
          <BottomMenu
            selectedSize={selectedSize}
            onAddText={() => setShowTextEditor(true)}
            onAddSticker={() => setShowStickerPicker(true)}
            onChooseColor={() => setShowColorPicker(true)}
            onChooseSize={() => setShowSizeSelector(true)}
          />
        </div>

        {/* Overlays */}
        {showColorPicker && (
          <ColorPicker
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            onClose={() => setShowColorPicker(false)}
          />
        )}

        {showSizeSelector && (
          <SizeSelector
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            onClose={() => setShowSizeSelector(false)}
          />
        )}

        {showTextEditor && (
          <TextEditor onAddText={handleAddText} onClose={() => setShowTextEditor(false)} />
        )}

        {showStickerPicker && (
          <StickerPicker
            onAddSticker={handleAddSticker}
            onClose={() => setShowStickerPicker(false)}
          />
        )}
      </div>
    </GlobalProvider>
  )
}

export default Index
