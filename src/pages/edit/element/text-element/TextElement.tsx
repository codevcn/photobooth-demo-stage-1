import { useDragElement } from '@/hooks/element/use-drag-element'
import { ITextElement } from '@/utils/types'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useElementControl } from '@/hooks/element/use-element-control'

const maxZoom: number = 2
const minZoom: number = 0.3

type TElementProperties = { fontSize: number; angle: number }

interface TextElementProps {
  element: ITextElement
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
}

export const TextElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
}: TextElementProps) => {
  const { color, fontSize, text, id } = element
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
  const [finalFontSize, setFinalFontSize] = useState<number>(fontSize)

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'text')
    onUpdateSelectedElementId(id)
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    if (elementId === id) {
      handleSetElementState(posX, posY, undefined, angle)
      if (fontSize) {
        setFinalFontSize(fontSize)
      }
    }
  }

  useEffect(() => {
    setFinalFontSize((pre) => scale * pre)
  }, [scale, setFinalFontSize])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SUBMIT_TEXT_ELE_PROPS, listenSubmitEleProps)
    return () => {
      eventEmitter.off(EInternalEvents.SUBMIT_TEXT_ELE_PROPS, listenSubmitEleProps)
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
        fontSize: `${finalFontSize}px`,
        transform: `rotate(${angle}deg)`,
        color,
      }}
      className={`${
        isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
      } NAME-root-element absolute h-fit w-fit bg-pink-400/20 touch-none`}
      onClick={pickElement}
    >
      <div
        className={`NAME-element-main-box max-w-[200px] select-none relative origin-center text-inherit`}
      >
        <div className="h-full w-full">
          <p className="NAME-displayed-text-content font-bold whitespace-nowrap select-none">
            {text}
          </p>
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
