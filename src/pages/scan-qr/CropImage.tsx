'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Loader2, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { TUserInputImage } from '@/utils/types'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CropPreview } from './CropPreview'
import { getNaturalSizeOfImage } from '@/utils/helpers'
import { SectionLoading } from '@/components/custom/Loading'
import { getCommonContants } from '@/utils/contants'

type TEditedImagesProps = {
  editedImages: TUserInputImage[]
  removeFromEditedImages: (image: TUserInputImage) => void
  onSetAsEditedImage: (image: TUserInputImage) => void
}

const EditedImages = ({
  editedImages,
  removeFromEditedImages,
  onSetAsEditedImage,
}: TEditedImagesProps) => {
  const [pickedImage, setPickedImage] = useState<TUserInputImage>()
  const [toDelete, setToDelete] = useState<TUserInputImage>()
  const MAX_PREVIEWS_COUNT = useMemo<number>(() => {
    return getCommonContants<number>('MAX_CROP_PREVIEWS_COUNT')
  }, [])

  const pickImage = (image: TUserInputImage) => {
    setPickedImage(image)
  }

  const handleSetToDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    image: TUserInputImage
  ) => {
    e.stopPropagation()
    setToDelete(image)
  }

  const confirmDelete = () => {
    if (toDelete) {
      removeFromEditedImages(toDelete)
    }
    setToDelete(undefined)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mt-2 pb-1 h-fit w-full overflow-x-auto overflow-y-visible">
      {editedImages.slice(0, MAX_PREVIEWS_COUNT).map((img, index) => (
        <div
          key={img.url}
          onClick={() => pickImage(img)}
          className={`${
            index === MAX_PREVIEWS_COUNT - 1 ? 'bg-gray-50' : ''
          } relative w-16 h-16 m-0.5 mt-2 flex items-center justify-center aspect-square outline outline-1 outline-gray-300 rounded`}
        >
          {index === MAX_PREVIEWS_COUNT - 1 ? (
            <>
              <p className="text-2xl font-bold text-gray-400">
                <span>+</span>
                <span>{editedImages.length - MAX_PREVIEWS_COUNT + 1}</span>
              </p>
            </>
          ) : (
            <>
              <img src={img.url} alt="Ảnh đã cắt" className="h-full w-full object-contain" />
              <button
                onClick={(e) => handleSetToDelete(e, img)}
                className="absolute -top-2 -right-2 p-0.5 rounded-full bg-pink-cl"
              >
                <X className="text-white" size={16} />
              </button>
            </>
          )}
        </div>
      ))}

      {pickedImage && (
        <CropPreview
          editedImages={editedImages}
          pickedImage={pickedImage}
          onPickedItem={setPickedImage}
          onHide={() => setPickedImage(undefined)}
          setAsEditedImage={onSetAsEditedImage}
        />
      )}

      {toDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 z-10 absolute inset-0"
            onClick={() => setToDelete(undefined)}
          ></div>
          <div className="relative z-20 bg-white p-4 rounded shadow-lg">
            <div>
              <p className="font-bold">Bạn xác nhận sẽ bỏ ảnh?</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setToDelete(undefined)}
                className="py-2 px-4 font-bold rounded bg-gray-600 text-white"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="py-2 px-4 font-bold rounded bg-pink-cl text-white"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const debounce = useDebounce()
  const inputsContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const cropImageContainerRef = useRef<HTMLDivElement>(null)
  const [rotatedImageUrl, setRotatedImageUrl] = useState<string | null>(null)
  const [minCropSizeWidth, minCropSizeHeight] = useMemo<[number, number]>(() => {
    return [
      getCommonContants<number>('MIN_CROP_SIZE_WIDTH'),
      getCommonContants<number>('MIN_CROP_SIZE_HEIGHT'),
    ]
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

  const handleSetAsEditedImage = (image: TUserInputImage) => {
    rotateImageIfNeeded(image.url)
  }

  const rotateImageIfNeeded = useCallback((imageUrl: string) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (img.naturalWidth > img.naturalHeight) {
        // Ảnh ngang cần xoay 90 độ
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Đảo kích thước canvas
        canvas.width = img.naturalHeight
        canvas.height = img.naturalWidth

        // Xoay và vẽ ảnh
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const rotatedUrl = URL.createObjectURL(blob)
              setRotatedImageUrl(rotatedUrl)
            }
          },
          'image/jpeg',
          0.95
        )
      } else {
        // Ảnh dọc không cần xoay
        setRotatedImageUrl(imageUrl)
      }
    }
    img.src = imageUrl
  }, [])

  const adjustUIBasedOnImage = () => {
    if (imageData) {
      const imageUrl = imageData.url
      rotateImageIfNeeded(imageUrl)
    } else {
      setRotatedImageUrl(null)
    }
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const croppedImage = e.currentTarget
    const { width, height } = croppedImage.getBoundingClientRect()

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
    adjustUIBasedOnImage()
  }, [imageData])

  return (
    <div
      ref={cropImageContainerRef}
      style={{ display: imageData ? 'flex' : 'none' }}
      className="fixed inset-0 flex items-center justify-center z-[90]"
    >
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="relative z-20 w-full">
        <div className="flex gap-2.5 items-start max-h-[90vh] pr-2 bg-gray-100 rounded-lg px-6 py-4 overflow-y-auto overflow-x-hidden w-full">
          <div className="flex items-center justify-center w-1/2 h-[70vh]">
            <div className="flex items-center justify-center w-full h-full overflow-hidden">
              {rotatedImageUrl ? (
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
                    src={rotatedImageUrl}
                    onLoad={onImageLoad}
                    className="object-contain max-h-full max-w-full"
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              ) : (
                <SectionLoading
                  classNames={{
                    container: 'w-fit',
                  }}
                  message="Đang tải ảnh..."
                />
              )}
            </div>
          </div>

          {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800">Kích thước vùng cắt</h3>
            <p className="text-xs italic">
              <span>Chiều rộng và chiều cao của vùng cắt không được nhỏ hơn lần lượt</span>
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
          </div> */}

          <div className="min-w-[200px] flex flex-col items-stretch w-1/2 h-[70vh] p-3 bg-white rounded-lg text-gray-600">
            <div>
              <p className="font-bold text-sm text-center">Ảnh bạn cắt sẽ xuất hiện ở đây</p>
              {editedImages.length > 0 ? (
                <EditedImages
                  editedImages={editedImages}
                  removeFromEditedImages={removeFromEditedImages}
                  onSetAsEditedImage={handleSetAsEditedImage}
                />
              ) : (
                <div className="w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
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

            <div className="mt-4">
              <div className="flex gap-y-2 gap-x-2 flex-col">
                <button
                  className="w-full h-10 rounded text-white bg-gray-400 font-bold hover:bg-gray-500 transition-colors disabled:opacity-50"
                  onClick={onClose}
                  disabled={!completedCrop || isCropping}
                >
                  Hủy
                </button>
                <button
                  className="flex items-center justify-center gap-2 w-full h-10 rounded bg-pink-cl text-white font-bold active:scale-90 transition-colors disabled:opacity-50"
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
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
              <div className="w-full pt-1 mt-2">
                <button
                  className="flex items-center justify-center gap-2 w-full h-10 flex-1 px-4 rounded bg-pink-cl text-white font-bold active:scale-90 transition-colors disabled:opacity-50"
                  onClick={navToEditPage}
                  disabled={!completedCrop || isCropping}
                >
                  <span>Lưu giữ kỷ niệm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
