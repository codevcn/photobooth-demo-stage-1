import { Camera } from 'lucide-react'
import QRScanner from './QRScanner'
import ImageSelector from './ImageSelector'
import { TUserInputImage } from '@/utils/types/global'
import { useEditedImageContext } from '@/context/global-context'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const ScanQRPage = () => {
  const { setEditedImages, editedImages } = useEditedImageContext()
  const navigate = useNavigate()

  const handleData = (imageDataList: TUserInputImage[]) => {
    setEditedImages([])
    setEditedImages((prevImages) => {
      return [
        ...prevImages,
        ...imageDataList.map((image) => ({
          url: image.url,
          height: -1,
          width: -1,
          id: image.url,
          x: 0,
          y: 0,
        })),
      ]
    })
  }

  useEffect(() => {
    if (editedImages.length > 0) {
      navigate('/edit')
    }
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
          <QRScanner onScanSuccess={handleData} />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ImageSelector onImageSelect={handleData} />
        </div>
      </div>
    </div>
  )
}

export default ScanQRPage
