import { useDragElement } from '@/hooks/element/use-drag-element'
import { IPrintedImage } from '@/utils/types'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'

const maxZoom: number = 2
const minZoom: number = 0.3

type TElementProperties = { scale: number; angle: number }

interface PrintedImageElementProps {
  element: IPrintedImage
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
}

export const PrintedImageElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
}: PrintedImageElementProps) => {
  const { url, height, width, id, x, y } = element
  const isSelected = selectedElementId === id
  const {
    ref: refForPinch,
    scale,
    rotation: angle,
  } = usePinchElement({ maxScale: maxZoom, minScale: minZoom })
  const {
    rotation,
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useRotateElement({
    initialRotation: 0,
  })
  const { zoomButtonRef, containerRef: refForZoom, isZooming } = useZoomElement()
  const { ref: refForDrag, position } = useDragElement({
    disabled: isRotating || isZooming,
  })
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'printed-image')
    onUpdateSelectedElementId(id)
  }

  const adjustElementForPinch = (scale: number, angle: number) => {
    const root = rootRef.current
    if (root) {
      root.style.transform = `scale(${scale}) rotate(${angle}deg)`
      propertiesRef.current = { scale, angle }
    }
  }

  const onEditElementProperties = (
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    const root = rootRef.current
    if (root) {
      if (scale) {
        root.style.transform = `scale(${scale}) rotate(${propertiesRef.current.angle}deg)`
        propertiesRef.current.scale = scale
      }
      if (angle || angle === 0) {
        root.style.transform = `scale(${propertiesRef.current.scale}) rotate(${angle}deg)`
        propertiesRef.current.angle = angle
      }
      if (posX || posX === 0) {
        root.style.left = `${posX}px`
      }
      if (posY || posY === 0) {
        root.style.top = `${posY}px`
      }
    }
  }

  const rotateElementByButton = () => {
    const rootElement = rootRef.current
    if (rootElement) {
      rootElement.style.transform = `scale(${propertiesRef.current.scale}) rotate(${rotation}deg)`
      propertiesRef.current.angle = rotation
    }
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    if (elementId === id) {
      onEditElementProperties(scale, angle, posX, posY)
    }
  }

  const moveElementIntoCenter = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = rootRef.current
        if (root) {
          const parent = root.parentElement
          if (parent) {
            const parentRect = parent.getBoundingClientRect()
            const rootRect = root.getBoundingClientRect()
            root.style.left = `${(parentRect.width - rootRect.width) / 2}px`
            root.style.top = `${(parentRect.height - rootRect.height) / 2}px`
          }
        }
      })
    })
  }

  useEffect(() => {
    adjustElementForPinch(scale, angle)
  }, [scale, angle])

  useEffect(() => {
    rotateElementByButton()
  }, [rotation])

  useEffect(() => {
    moveElementIntoCenter()
  }, [])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      ref={(node) => {
        refForDrag.current = node
        rootRef.current = node
        refForRotate.current = node
        refForZoom.current = node
        refForPinch.current = node
      }}
      style={{
        left: position.x || x,
        top: position.y || y,
        width: width === -1 ? '180px' : width,
        aspectRatio: width === -1 || height === -1 ? 'auto' : `${width} / ${height}`,
      }}
      className={`${
        isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
      } NAME-root-element absolute h-fit w-fit touch-none bg-pink-400/20`}
      onClick={pickElement}
    >
      <div className={`NAME-element-main-box max-w-[200px] select-none relative origin-center`}>
        <div className="h-full w-full">
          <img src={url || '/placeholder.svg'} alt="Overlay" className="h-full w-full" />
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-rotate-box absolute -top-6 -left-6 z-20`}
        >
          <button
            ref={rotateButtonRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <RotateCw size={14} color="currentColor" />
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -bottom-6 -right-6 z-20`}
        >
          <button
            ref={zoomButtonRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <Scaling size={14} color="currentColor" />
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -top-6 -right-6 z-20`}
        >
          <button
            onClick={() => onRemoveElement(id)}
            className="bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
          >
            <X size={14} color="currentColor" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
