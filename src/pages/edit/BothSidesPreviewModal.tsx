import { X } from 'lucide-react'
import { TBaseProduct, TFrameRectType, TPrintTemplate } from '@/utils/types/global'
import { PrintAreaOverlay } from './template/PrintAreaOverlay'
import { useRef } from 'react'

type TBothSidesPreviewModalProps = {
  show: boolean
  onClose: () => void
  activeProduct: TBaseProduct
  pickedTemplate: TPrintTemplate
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string,
    rectType: TFrameRectType
  ) => void
}

export const BothSidesPreviewModal = ({
  show,
  onClose,
  activeProduct,
  pickedTemplate,
  onClickFrame,
}: TBothSidesPreviewModalProps) => {
  const frontContainerRef = useRef<HTMLDivElement>(null)
  const backContainerRef = useRef<HTMLDivElement>(null)
  const frontPrintAreaRef = useRef<HTMLDivElement>(null)
  const backPrintAreaRef = useRef<HTMLDivElement>(null)

  if (!show) return null

  const frontSurface = activeProduct.printAreaList.find((area) => area.surfaceType === 'front')
  const backSurface = activeProduct.printAreaList.find((area) => area.surfaceType === 'back')

  if (!frontSurface && !backSurface) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-800">Xem trước cả 2 mặt</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/80 active:scale-95 transition-all"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Front Side */}
            {frontSurface && (
              <div className="flex flex-col">
                <div className="mb-3 text-center">
                  <span className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-lg font-semibold">
                    Mặt trước
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 border-2 border-gray-200 shadow-md">
                  <div
                    ref={frontContainerRef}
                    className="relative w-full h-full flex items-center justify-center min-h-[400px]"
                  >
                    <img
                      src={frontSurface.imageUrl}
                      alt="Front side"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onLoad={() => {
                        if (frontContainerRef.current && frontSurface.area) {
                          // Calculate print area for front side
                          const imageElement = frontContainerRef.current.querySelector(
                            'img'
                          ) as HTMLImageElement
                          if (!imageElement) return

                          const containerWidth = frontContainerRef.current.offsetWidth
                          const containerHeight = frontContainerRef.current.offsetHeight
                          const naturalWidth = imageElement.naturalWidth
                          const naturalHeight = imageElement.naturalHeight

                          if (naturalWidth === 0 || naturalHeight === 0) return

                          const containerRatio = containerWidth / containerHeight
                          const imageRatio = naturalWidth / naturalHeight

                          let actualImageWidth: number
                          let actualImageHeight: number
                          let offsetX = 0
                          let offsetY = 0

                          if (imageRatio > containerRatio) {
                            actualImageWidth = containerWidth
                            actualImageHeight = containerWidth / imageRatio
                            offsetY = (containerHeight - actualImageHeight) / 2
                          } else {
                            actualImageHeight = containerHeight
                            actualImageWidth = containerHeight * imageRatio
                            offsetX = (containerWidth - actualImageWidth) / 2
                          }

                          const scaleX = actualImageWidth / naturalWidth
                          const scaleY = actualImageHeight / naturalHeight

                          if (
                            typeof frontSurface.area.printX === 'number' &&
                            typeof frontSurface.area.printY === 'number' &&
                            typeof frontSurface.area.printW === 'number' &&
                            typeof frontSurface.area.printH === 'number'
                          ) {
                            const x = offsetX + frontSurface.area.printX * scaleX
                            const y = offsetY + frontSurface.area.printY * scaleY
                            const width = frontSurface.area.printW * scaleX
                            const height = frontSurface.area.printH * scaleY

                            if (frontPrintAreaRef.current) {
                              frontPrintAreaRef.current.style.left = `${x}px`
                              frontPrintAreaRef.current.style.top = `${y}px`
                              frontPrintAreaRef.current.style.width = `${width}px`
                              frontPrintAreaRef.current.style.height = `${height}px`
                            }
                          }
                        }
                      }}
                    />
                    <PrintAreaOverlay
                      printAreaRef={frontPrintAreaRef}
                      name="Front Print Area"
                      printTemplate={pickedTemplate}
                      onClickFrame={onClickFrame}
                      frame={{
                        classNames: {
                          container: 'border-none',
                          plusIconWrapper: 'hidden',
                        },
                      }}
                      frameDisplayer={{
                        classNames: { container: 'bg-transparent' },
                      }}
                      overlay={{ classNames: { container: 'border-none' } }}
                      isOutOfBounds={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Back Side */}
            {backSurface && (
              <div className="flex flex-col">
                <div className="mb-3 text-center">
                  <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold">
                    Mặt sau
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 border-2 border-gray-200 shadow-md">
                  <div
                    ref={backContainerRef}
                    className="relative w-full h-full flex items-center justify-center min-h-[400px]"
                  >
                    <img
                      src={backSurface.imageUrl}
                      alt="Back side"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onLoad={() => {
                        if (backContainerRef.current && backSurface.area) {
                          // Calculate print area for back side
                          const imageElement = backContainerRef.current.querySelector(
                            'img'
                          ) as HTMLImageElement
                          if (!imageElement) return

                          const containerWidth = backContainerRef.current.offsetWidth
                          const containerHeight = backContainerRef.current.offsetHeight
                          const naturalWidth = imageElement.naturalWidth
                          const naturalHeight = imageElement.naturalHeight

                          if (naturalWidth === 0 || naturalHeight === 0) return

                          const containerRatio = containerWidth / containerHeight
                          const imageRatio = naturalWidth / naturalHeight

                          let actualImageWidth: number
                          let actualImageHeight: number
                          let offsetX = 0
                          let offsetY = 0

                          if (imageRatio > containerRatio) {
                            actualImageWidth = containerWidth
                            actualImageHeight = containerWidth / imageRatio
                            offsetY = (containerHeight - actualImageHeight) / 2
                          } else {
                            actualImageHeight = containerHeight
                            actualImageWidth = containerHeight * imageRatio
                            offsetX = (containerWidth - actualImageWidth) / 2
                          }

                          const scaleX = actualImageWidth / naturalWidth
                          const scaleY = actualImageHeight / naturalHeight

                          if (
                            typeof backSurface.area.printX === 'number' &&
                            typeof backSurface.area.printY === 'number' &&
                            typeof backSurface.area.printW === 'number' &&
                            typeof backSurface.area.printH === 'number'
                          ) {
                            const x = offsetX + backSurface.area.printX * scaleX
                            const y = offsetY + backSurface.area.printY * scaleY
                            const width = backSurface.area.printW * scaleX
                            const height = backSurface.area.printH * scaleY

                            if (backPrintAreaRef.current) {
                              backPrintAreaRef.current.style.left = `${x}px`
                              backPrintAreaRef.current.style.top = `${y}px`
                              backPrintAreaRef.current.style.width = `${width}px`
                              backPrintAreaRef.current.style.height = `${height}px`
                            }
                          }
                        }
                      }}
                    />
                    <PrintAreaOverlay
                      printAreaRef={backPrintAreaRef}
                      name="Back Print Area"
                      printTemplate={pickedTemplate}
                      onClickFrame={onClickFrame}
                      overlay={{ classNames: { container: 'border-none' } }}
                      frame={{
                        classNames: {
                          container: 'border-none',
                          plusIconWrapper: 'hidden',
                        },
                      }}
                      frameDisplayer={{
                        classNames: { container: 'bg-transparent' },
                      }}
                      isOutOfBounds={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
