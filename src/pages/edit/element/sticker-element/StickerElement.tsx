import { IStickerElement } from '@/utils/types'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useElementControl } from '@/hooks/element/use-element-control'

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
  const { path, height, width, id } = element
  const isSelected = selectedElementId === id
  const {
    forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag },
    state: { position, angle, scale },
    handleSetElementState,
  } = useElementControl()
  const rootRef = useRef<HTMLElement | null>(null)

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'sticker')
    onUpdateSelectedElementId(id)
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    if (elementId === id) {
      handleSetElementState(posX, posY, scale, angle)
    }
  }

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
        refForRotate.current = node
        refForZoom.current = node
        refForPinch.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
        width: width === -1 ? '180px' : width,
        aspectRatio: width === -1 || height === -1 ? 'auto' : `${width} / ${height}`,
        transform: `scale(${scale}) rotate(${angle}deg)`,
      }}
      className={`${
        isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
      } NAME-root-element absolute h-fit w-fit touch-none bg-pink-400/20`}
      onClick={pickElement}
    >
      <div className={`NAME-element-main-box max-w-[200px] select-none relative origin-center`}>
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
