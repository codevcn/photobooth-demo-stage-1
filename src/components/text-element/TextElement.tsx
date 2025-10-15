import useDraggable from '@/hooks/use-draggable'
import { ITextElement } from '@/utils/types'
import { X, RotateCw } from 'lucide-react'
import { usePinch } from '@use-gesture/react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/use-rotate-element'

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
  const { ref: refForDrag, position } = useDraggable()
  const { color, fontSize, text, x, y, id } = element
  const isSelected = selectedElementId === id
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ fontSize, angle: 0 })
  const { rotation, handleRef } = useRotateElement({
    initialRotation: 0,
    sensitivity: 0.5,
  })

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'text')
    onUpdateSelectedElementId(id)
  }

  const adjustElementForPinch = (fontSize: number, angle: number, last: boolean) => {
    const root = rootRef.current
    if (root) {
      const elementMainBox = root.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        elementMainBox.style.transform = `rotate(${angle}deg)`
        elementMainBox.style.fontSize = `${fontSize}px`
        propertiesRef.current = { fontSize, angle }
      }
    }
  }

  const bindForPinch = usePinch(
    ({ offset: [scale, angle], last }) => adjustElementForPinch(scale, angle, last),
    {
      scaleBounds: { min: minZoom, max: maxZoom },
      rubberband: true,
      eventOptions: { passive: false },
    }
  )

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

  const listenSubmitPrintedImageEleProps = (
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
    rotateElementByButton()
  }, [rotation])

  useEffect(() => {
    eventEmitter.on(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      listenSubmitPrintedImageEleProps
    )
    return () => {
      eventEmitter.off(
        EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
        listenSubmitPrintedImageEleProps
      )
    }
  }, [])

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
      className={`${
        isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
      } NAME-root-element absolute h-fit w-fit`}
      onClick={pickElement}
    >
      <div
        {...bindForPinch()}
        style={{ fontSize: `${fontSize}px`, color }}
        className="NAME-element-main-box max-w-[200px] select-none touch-none relative origin-center"
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
          ref={handleRef}
          className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
        >
          <RotateCw size={12} color="currentColor" />
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
          <X size={12} color="currentColor" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
