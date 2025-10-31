import { useDragElement } from '@/hooks/element/use-draggable-element'
import { IStickerElement } from '@/utils/types'
import { X, RotateCw } from 'lucide-react'
// import { usePinch } from '@use-gesture/react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'

const maxZoom: number = 2
const minZoom: number = 0.3

type TElementProperties = { scale: number; angle: number }

interface StickerElementProps {
  element: IStickerElement
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
}

export const StickerElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
}: StickerElementProps) => {
  const { ref: refForDrag, position } = useDragElement()
  const { path, height, width, id } = element
  const {
    ref: refForZoom,
    scale,
    rotation: angle,
  } = useZoomElement({ maxScale: maxZoom, minScale: minZoom })
  const isSelected = selectedElementId === id
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })
  const { rotation, handleRef } = useRotateElement({
    initialRotation: 0,
    sensitivity: 0.5,
  })

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'sticker')
    onUpdateSelectedElementId(id)
  }

  const adjustElementForPinch = (scale: number, angle: number) => {
    const root = rootRef.current
    if (root) {
      root.style.transform = `scale(${scale}) rotate(${angle}deg)`
      propertiesRef.current = { scale, angle }
    }
  }

  // const adjustElementForPinch = (scale: number, angle: number, last: boolean) => {
  //   const root = rootRef.current
  //   if (root) {
  //     root.style.transform = `scale(${scale}) rotate(${angle}deg)`
  //     propertiesRef.current = { scale, angle }
  //   }
  // }

  // const bindForPinch = usePinch(
  //   ({ offset: [scale, angle], last }) => adjustElementForPinch(scale, angle, last),
  //   {
  //     scaleBounds: { min: minZoom, max: maxZoom },
  //     rubberband: true,
  //     eventOptions: { passive: false },
  //   }
  // )

  const onEditElementProperties = (
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    const root = rootRef.current
    if (root) {
      const elementMainBox = root.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        if (scale) {
          elementMainBox.style.transform = `scale(${scale}) rotate(${propertiesRef.current.angle}deg)`
          propertiesRef.current.scale = scale
        }
        if (angle || angle === 0) {
          elementMainBox.style.transform = `scale(${propertiesRef.current.scale}) rotate(${angle}deg)`
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
  }

  const rotateElementByButton = () => {
    const rootElement = rootRef.current
    if (rootElement) {
      const elementMainBox = rootElement.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        elementMainBox.style.transform = `scale(${propertiesRef.current.scale}) rotate(${rotation}deg)`
        propertiesRef.current.angle = rotation
      }
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

  useEffect(() => {
    adjustElementForPinch(scale, angle)
  }, [scale, angle])

  useEffect(() => {
    rotateElementByButton()
  }, [rotation])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_STICKER_ELE_PROPS, listenSubmitEleProps)
    }
  }, [id])

  return (
    <div
      ref={(node) => {
        refForDrag.current = node
        rootRef.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
      }}
      className={`NAME-root-element absolute h-fit w-fit touch-none bg-pink-400/20`}
      onClick={pickElement}
    >
      <div
        ref={refForZoom}
        style={{
          width: width === -1 ? 'auto' : width,
          aspectRatio: width === -1 || height === -1 ? 'auto' : `${width} / ${height}`,
        }}
        className={`${
          isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
        } NAME-element-main-box max-w-[200px] select-none relative origin-center`}
      >
        <div className="h-full w-full">
          <img
            src={path}
            alt={`Sticker`}
            style={{ minWidth: `${width}px`, width: `${width}px` }}
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 object-center"
          />
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-rotate-box absolute -top-6 -left-6 z-20`}
        >
          <button
            ref={handleRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <RotateCw size={14} color="currentColor" />
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
