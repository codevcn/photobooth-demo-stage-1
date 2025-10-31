import { useDragElement } from '@/hooks/element/use-drag-element'
import { ITextElement } from '@/utils/types'
import { X, RotateCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/element/use-pinch-element'
import { usePinchElement } from '@/hooks/element/use-zoom-element'

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
  const [isRotating, setIsRotating] = useState<boolean>(false)
  const { ref: refForDrag, position } = useDragElement({
    disabled: isRotating,
  })
  const {
    ref: refForZoom,
    scale,
    rotation: angle,
  } = usePinchElement({ maxScale: maxZoom, minScale: minZoom })
  const { rotation, rotateButtonRef, containerRef } = useRotateElement({
    initialRotation: 0,
    onRotationStart: () => setIsRotating(true),
    onRotationEnd: () => setIsRotating(false),
  })
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ fontSize, angle: 0 })

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'text')
    onUpdateSelectedElementId(id)
  }

  const adjustElementForPinch = (fontSize: number, angle: number) => {
    const root = rootRef.current
    if (root) {
      root.style.transform = `rotate(${angle}deg)`
      root.style.fontSize = `${fontSize}px`
      propertiesRef.current = { fontSize, angle }
    }
  }

  const onEditElementProperties = (
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    const root = rootRef.current
    if (root) {
      const elementMainBox = root.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        if (fontSize) {
          elementMainBox.style.fontSize = `${fontSize}px`
          propertiesRef.current.fontSize = fontSize
        }
        if (angle || angle === 0) {
          elementMainBox.style.transform = `rotate(${angle}deg)`
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
        elementMainBox.style.transform = `rotate(${rotation}deg)`
        propertiesRef.current.angle = rotation
      }
    }
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    if (elementId === id) {
      onEditElementProperties(fontSize, angle, posX, posY)
    }
  }

  useEffect(() => {
    adjustElementForPinch(scale, angle)
  }, [scale, angle])

  useEffect(() => {
    rotateElementByButton()
  }, [rotation])

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
        containerRef.current = node
      }}
      style={{
        left: position.x,
        top: position.y,
      }}
      className={`NAME-root-element absolute h-fit w-fit bg-pink-400/20 touch-none`}
      onClick={pickElement}
    >
      <div
        ref={refForZoom}
        style={{ fontSize: `${fontSize}px`, color }}
        className={`${
          isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
        } NAME-element-main-box max-w-[200px] select-none relative origin-center`}
      >
        <div className="h-full w-full">
          <p className="NAME-displayed-text-content font-bold whitespace-nowrap select-none">
            {text}
          </p>
        </div>
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
  )
}
