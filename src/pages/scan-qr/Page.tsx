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
      // navigate('/edit')
    }
  }, [editedImages])

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload"
        >
          <source src="/videos/scan-qr-page-background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content */}
      <section className="NAME-scan-qr-main-content relative z-10 max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-3 animate-fade-in-down">
          <div
            onClick={() => navigate('/edit')}
            className="bg-pink-cl p-3 rounded-xl shadow-lg animate-float"
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quét mã QR</h1>
        </div>

        <div className="animate-scale-in mt-6" style={{ animationDelay: '0.1s' }}>
          <QRScanner onScanSuccess={handleData} />
        </div>

        <div className="animate-fade-in-up mt-4" style={{ animationDelay: '0.3s' }}>
          <ImageSelector onImageSelect={handleData} />
        </div>
      </section>
    </div>
  )
}

export default ScanQRPage
