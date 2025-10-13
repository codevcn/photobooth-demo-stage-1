import { useState } from 'react'
import TshirtGallery from '@/components/ProductGallery'
import EditArea from '@/components/EditArea'
import ActionBar from '@/components/ActionBar'
import BottomMenu from '@/components/BottomMenu'
import ColorPicker from '@/components/ColorPicker'
import SizeSelector from '@/components/SizeSelector'
import TextEditor from '@/components/TextEditor'
import StickerPicker from '@/components/StickerPicker'
import { useToast } from '@/hooks/use-toast'
import { IPrintedImage, IProductImage, IStickerElement, ITextElement } from '@/utils/types'

const Index = () => {
  const { toast } = useToast()

  // Gallery images
  const [images] = useState<IProductImage[]>([
    { id: '1', url: '/images/shirt.png', name: 'Classic White' },
    { id: '2', url: '/images/cup.png', name: 'Navy Blue' },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
      name: 'Charcoal',
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop',
      name: 'Forest Green',
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
      name: 'Burgundy',
    },
  ])

  // Printed images
  const [printedImages] = useState<IPrintedImage[]>([
    {
      id: '1',
      url: '/images/print-img-1.png',
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    },
    {
      id: '2',
      url: '/images/print-img-2.png',
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    },
    {
      id: '3',
      url: '/images/print-img-3.png',
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    },
    {
      id: '4',
      url: '/images/print-img-4.png',
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    },
  ])

  const [activeImageId, setActiveImageId] = useState<string>(images[0].id)
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

  const activeImage = images.find((img) => img.id === activeImageId)

  const handleDone = () => {
    setCartCount((prev) => prev + 1)
    toast({
      title: 'Added to cart! 🎉',
      description: `${activeImage?.name} (Size ${selectedSize}) has been added to your cart.`,
      duration: 2000,
    })

    // Reset editing elements
    setTextElements([])
    setStickerElements([])
    setPrintedImageElements([])
  }

  const handleAddText = (text: string) => {
    const newText: ITextElement = {
      id: Date.now().toString(),
      text,
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#000000',
    }
    setTextElements([...textElements, newText])
  }

  const handleAddSticker = (emoji: string) => {
    const newSticker: IStickerElement = {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 50,
      height: 48,
      width: 48,
    }
    setStickerElements([...stickerElements, newSticker])
  }

  return (
    <div className="min-h-screen bg-superlight-pink-cl flex flex-col max-w-md mx-auto">
      {/* Gallery Section */}
      <div className="pt-4 pb-3 px-4 bg-white shadow-sm">
        <TshirtGallery
          images={images}
          activeImageId={activeImageId}
          onSelectImage={setActiveImageId}
        />
      </div>

      {/* Edit Area */}
      <div className="flex-1 px-2 pb-6 pt-4">
        <EditArea
          editingImage={activeImage}
          color={selectedColor}
          textElements={textElements}
          stickerElements={stickerElements}
          onUpdateText={setTextElements}
          onUpdateStickers={setStickerElements}
          printedImages={printedImages}
          onUpdatePrintedImages={setPrintedImageElements}
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
  )
}

export default Index
