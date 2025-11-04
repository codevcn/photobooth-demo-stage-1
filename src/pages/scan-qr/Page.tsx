import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import QRScanner from './QRScanner'
import ImageSelector from './ImageSelector'
import { CropImage } from './CropImage'
import { TUserInputImage } from '@/utils/types'
import { useEditedImageContext } from '@/context/global-context'

const ScanQRPage = () => {
  const [data, setData] = useState<TUserInputImage>()
  const [showCropper, setShowCropper] = useState<boolean>(false)
  const [editedImages, setEditedImages] = useState<TUserInputImage[]>([])
  const { setEditedImages: setGlobalEditedImages } = useEditedImageContext()

  const addToEditedImages = (image: TUserInputImage) => {
    setEditedImages((prevImages) => {
      if (prevImages.some((prevImg) => prevImg.url === image.url)) {
        return prevImages
      }
      return [...prevImages, image]
    })
  }

  const removeFromEditedImages = (image: TUserInputImage) => {
    setEditedImages((prevImages) => prevImages.filter(({ url }) => url !== image.url))
  }

  const handleData = (imageData: TUserInputImage) => {
    setData(imageData)
  }

  const handleCropComplete = (croppedImage: TUserInputImage | null, error: Error | null) => {
    if (error) {
      console.error('>>> Crop error:', error)
    } else if (croppedImage) {
      addToEditedImages(croppedImage)
    }
  }

  const handleCloseCropper = () => {
    setEditedImages([])
    setData(undefined)
  }

  useEffect(() => {
    if (data) {
      addToEditedImages(data)
    }
    setShowCropper(!!data)
  }, [data])

  useEffect(() => {
    setGlobalEditedImages(
      editedImages.map(({ url }) => ({
        url,
        height: -1,
        width: -1,
        id: url,
        x: 0,
        y: 0,
      }))
    )
  }, [editedImages])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8 mt-4 animate-fade-in-down">
            <div className="bg-pink-500 p-3 rounded-xl shadow-lg animate-float">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Quét mã QR</h1>
          </div>

          <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <QRScanner onScanSuccess={handleData} showCropper={showCropper} />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ImageSelector onImageSelect={handleData} />
          </div>

          <div
            className="mt-8 text-center text-gray-600 text-sm animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <p>Quét mã QR hoặc chọn hình ảnh từ thiết bị</p>
          </div>
        </div>
      </div>

      {/* Crop Image Modal */}
      <CropImage
        imageData={data}
        onCropComplete={handleCropComplete}
        onClose={handleCloseCropper}
        removeFromEditedImages={removeFromEditedImages}
        editedImages={editedImages}
      />
    </div>
  )
}

export default ScanQRPage
