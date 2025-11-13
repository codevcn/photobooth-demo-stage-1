import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import QRScanner from './QRScanner'
import ImageSelector from './ImageSelector'
import { CropImage } from './CropImage'
import { TUserInputImage } from '@/utils/types/global'
import { useEditedImageContext } from '@/context/global-context'
import { toast } from 'react-toastify'

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
    setEditedImages((prevImages) => {
      if (prevImages.length <= 1) {
        toast.error('Phải có ít nhất một ảnh được giữ lại.')
        return prevImages
      }
      return prevImages.filter(({ url }) => url !== image.url)
    })
  }

  const handleData = (imageDataList: TUserInputImage[]) => {
    setData(imageDataList[0])
    for (const img of imageDataList) {
      addToEditedImages(img)
    }
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
    <div className="flex flex-col items-center h-screen p-4">
      <div>
        <div className="flex items-center justify-center gap-3 mt-4 animate-fade-in-down">
          <div className="bg-pink-500 p-3 rounded-xl shadow-lg animate-float">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quét mã QR</h1>
        </div>

        <div className="animate-scale-in mt-4" style={{ animationDelay: '0.1s' }}>
          <QRScanner onScanSuccess={handleData} showCropper={showCropper} />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ImageSelector onImageSelect={handleData} />
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
