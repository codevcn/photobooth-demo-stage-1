'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { TUserInputImage } from '@/utils/types'
import { AttractiveButton } from '@/components/custom/AttractiveButton'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const minCropSizeWidth: number = 50
const minCropSizeHeight: number = 50

type CropImageProps = {
  imageData?: TUserInputImage
  onCropComplete: (croppedImage: TUserInputImage | null, error: Error | null) => void
  onClose: () => void
  removeFromEditedImages: (image: TUserInputImage) => void
  editedImages: TUserInputImage[]
}

enum EInputNames {
  CUSTOM_WIDTH = 'custom-width',
  CUSTOM_HEIGHT = 'custom-height',
}

export const CropImage = ({
  imageData,
  onCropComplete,
  onClose,
  removeFromEditedImages,
  editedImages,
}: CropImageProps) => {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [isCropping, setIsCropping] = useState<boolean>(false)
  const [customWidth, setCustomWidth] = useState<number>(0)
  const [customHeight, setCustomHeight] = useState<number>(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const debounce = useDebounce()
  const inputsContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    // Initial crop tự do, không bắt buộc hình vuông
    const initialCrop: Crop = {
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    }
    setCrop(initialCrop)
    setCompletedCrop(initialCrop)

    setCustomWidth(Math.round(width * 0.9))
    setCustomHeight(Math.round(height * 0.9))
  }, [])

  const handleCrop = useCallback(() => {
    const image = imgRef.current
    if (!image || !completedCrop || !imageData || isCropping) {
      return
    }
    setIsCropping(true)
    queueMicrotask(() => {
      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      let targetWidth = Math.floor(completedCrop.width * scaleX)
      let targetHeight = Math.floor(completedCrop.height * scaleY)

      const MAX_DIMENSION = 2000
      if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight)
        targetWidth = Math.floor(targetWidth * scale)
        targetHeight = Math.floor(targetHeight * scale)
      }

      canvas.width = targetWidth
      canvas.height = targetHeight

      if (canvas.width < 10 || canvas.height < 10) {
        setIsCropping(false)
        onCropComplete(null, new Error('Crop area too small'))
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsCropping(false)
        return
      }

      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY

      ctx.drawImage(
        image,
        cropX,
        cropY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const format = imageData?.blob.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'image/jpeg' ? 0.92 : 1

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsCropping(false)
            onCropComplete(null, new Error('Failed to crop image'))
            return
          }
          onCropComplete({ blob, url: URL.createObjectURL(blob) }, null)
          setIsCropping(false)
        },
        format,
        quality
      )
    })
  }, [completedCrop, imgRef, onCropComplete, isCropping, imageData])

  const handleCropChange = useCallback((c: Crop) => {
    setCrop(c)
    setCustomWidth(Math.round(c.width))
    setCustomHeight(Math.round(c.height))
  }, [])

  const handleCropComplete = useCallback((c: Crop) => {
    setCompletedCrop(c)
  }, [])

  const handleWidthChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const width = parseFloat(value)
      if (isNaN(width) || !imgRef.current || !crop) return

      const image = imgRef.current
      const maxWidth = image.getBoundingClientRect().width
      const constrainedWidth = Math.min(Math.max(width, minCropSizeWidth), maxWidth)

      const newCrop: Crop = {
        ...crop,
        width: constrainedWidth,
        x: Math.min(crop.x, maxWidth - constrainedWidth),
      }

      setCrop(newCrop)
      setCompletedCrop(newCrop)
      setCustomWidth(Math.round(constrainedWidth))
    }, 300),
    [crop]
  )

  const handleHeightChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const height = parseFloat(value)
      if (isNaN(height) || !imgRef.current || !crop) return

      const image = imgRef.current
      const maxHeight = image.getBoundingClientRect().height
      const constrainedHeight = Math.min(Math.max(height, minCropSizeHeight), maxHeight)

      const newCrop: Crop = {
        ...crop,
        height: constrainedHeight,
        y: Math.min(crop.y, maxHeight - constrainedHeight),
      }

      setCrop(newCrop)
      setCompletedCrop(newCrop)
      setCustomHeight(Math.round(constrainedHeight))
    }, 300),
    [crop]
  )

  const navToEditPage = useCallback(() => {
    if (editedImages.length === 0) {
      toast.warning('Vui lòng thêm ít nhất một ảnh đã cắt để vào trang chỉnh sửa.')
      return
    }
    navigate('/edit')
  }, [editedImages])

  useEffect(() => {
    if (customWidth < minCropSizeWidth || customHeight < minCropSizeHeight) return
    for (const input of inputsContainerRef.current?.querySelectorAll<HTMLInputElement>('input') ||
      []) {
      if (input.name === EInputNames.CUSTOM_WIDTH) {
        input.value = `${customWidth}`
      } else if (input.name === EInputNames.CUSTOM_HEIGHT) {
        input.value = `${customHeight}`
      }
    }
  }, [customWidth, customHeight])

  useEffect(() => {
    if (!imageData) {
      setImageUrl(null)
      return
    }
    setImageUrl(imageData.url)
    return () => {
      URL.revokeObjectURL(imageData.url)
    }
  }, [imageData])

  return (
    <div
      style={{ display: imageData ? 'flex' : 'none' }}
      className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center z-[90]"
    >
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="p-4 overflow-auto relative z-20">
        <div className="bg-white rounded-lg px-2 py-4">
          {imageUrl && (
            <div className="mb-4 flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={handleCropComplete}
                minWidth={minCropSizeWidth}
                minHeight={minCropSizeHeight}
              >
                <img
                  ref={imgRef}
                  alt="Ảnh để crop"
                  src={imageUrl}
                  onLoad={onImageLoad}
                  className="max-h-[65vh] object-contain"
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            </div>
          )}

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800">Kích thước vùng cắt</h3>
            <p className="text-xs italic">
              <span>Chiều rộng và chiều cao của vùng cắt không được nhỏ hơn</span>
              <span> </span>
              <span>{minCropSizeWidth}</span>px và <span>{minCropSizeHeight}</span>px.
            </p>
            <div ref={inputsContainerRef} className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs text-gray-800 mb-1">Chiều rộng (px)</label>
                <input
                  type="number"
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  min="50"
                  step="1"
                  name={EInputNames.CUSTOM_WIDTH}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-800 mb-1">Chiều cao (px)</label>
                <input
                  type="number"
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  min="50"
                  step="1"
                  name={EInputNames.CUSTOM_HEIGHT}
                />
              </div>
            </div>

            <p className="text-sm text-gray-800 mt-4">
              <span className="font-bold mr-1">Tỷ lệ:</span>
              <span>{crop ? (crop.width / crop.height).toFixed(2) : '1.00'}</span>
              <span className="font-bold mx-0.5">:</span>
              <span>1</span>
            </p>
          </div>

          <div className="p-3 w-full bg-gray-50 rounded-lg text-gray-600">
            <p className="font-bold text-sm mb-2">Ảnh mà bạn cắt sẽ xuất hiện ở đây</p>
            {editedImages.length > 0 ? (
              <div className="flex items-center gap-2 mt-2 h-fit w-full overflow-x-auto">
                {editedImages.map(({ url }) => (
                  <div
                    key={url}
                    className="min-w-14 m-0.5 flex items-center h-14 aspect-square outline outline-1 outline-gray-300 rounded overflow-hidden"
                  >
                    <img src={url} alt="Ảnh đã cắt" className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-image-icon lucide-image"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex gap-2">
              <button
                className="flex-1 h-10 rounded-md text-white bg-gray-400 font-bold hover:bg-gray-500 transition-colors disabled:opacity-50"
                onClick={onClose}
                disabled={isCropping}
              >
                Hủy
              </button>
              <button
                className="flex items-center justify-center gap-2 h-10 flex-1 rounded-md bg-pink-cl text-white font-bold active:scale-90 transition-colors disabled:opacity-50"
                onClick={handleCrop}
                disabled={!completedCrop || isCropping}
              >
                {isCropping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6 6L3 3M18 6L21 3M6 18L3 21M18 18L21 21"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Cắt và lưu</span>
                  </>
                )}
              </button>
            </div>
            <div className="w-full pt-3">
              <AttractiveButton
                actionText="Lưu giữ kỷ niệm của bạn"
                classNames={{
                  button:
                    'px-3 h-12 w-full text-lg bg-pink-cl text-white font-bold rounded-xl shadow-lg',
                  star: 'fill-pink-cl',
                }}
                onClick={navToEditPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
