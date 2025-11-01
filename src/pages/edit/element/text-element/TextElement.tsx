import { ITextElement } from '@/utils/types'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useElementControl } from '@/hooks/element/use-element-control'
import { useElementLayerContext } from '@/context/global-context'

const MAX_TEXT_FONT_SIZE: number = 1000
const MIN_TEXT_FONT_SIZE: number = 5

interface TextElementProps {
  element: ITextElement
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
  editContainerRef: React.MutableRefObject<HTMLDivElement | null>
}

export const TextElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
  editContainerRef,
}: TextElementProps) => {
  const { color, text, id, fontSize: initialFontSize } = element
  const isSelected = selectedElementId === id
  const {
    forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag },
    state: { position, angle, zindex, fontSize },
    handleSetElementState,
  } = useElementControl(
    id,
    { initialFontSize, maxFontSize: MAX_TEXT_FONT_SIZE, minFontSize: MIN_TEXT_FONT_SIZE },
    true
  )
  const rootRef = useRef<HTMLElement | null>(null)
  const { addToElementLayers } = useElementLayerContext()

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'text')
    onUpdateSelectedElementId(id)
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => {
    if (elementId === id) {
      handleSetElementState(posX, posY, undefined, angle, zindex, fontSize)
    }
  }

  const moveElementIntoCenter = (root: HTMLElement, editContainer: HTMLElement) => {
    const editContainerRect = editContainer.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    root.style.left = `${(editContainerRect.width - rootRect.width) / 2}px`
    root.style.top = `${(editContainerRect.height - rootRect.height) / 2}px`
  }

  const initElementDisplaySize = (root: HTMLElement, editContainer: HTMLElement) => {
    handleSetElementState(
      parseInt(getComputedStyle(root).left),
      parseInt(getComputedStyle(root).top)
    )
    const editorContainerRect = editContainer.getBoundingClientRect()
    const mainBox = root.querySelector<HTMLElement>('.NAME-element-main-box')
    if (!mainBox) return
    mainBox.style.cssText = `max-width: ${editorContainerRect.width - 16}px; max-height: ${
      editorContainerRect.height - 16
    }px;`
  }

  const initElement = () => {
    requestAnimationFrame(() => {
      const root = rootRef.current
      if (!root) return
      const editContainer = editContainerRef.current
      if (!editContainer) return
      moveElementIntoCenter(root, editContainer)
      initElementDisplaySize(root, editContainer)
    })
  }

  const handleAddElementLayer = () => {
    addToElementLayers({ elementId: id })
  }

  useEffect(() => {
    initElement()
    handleAddElementLayer()
  }, [])

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
        transform: `rotate(${angle}deg)`,
        color,
        zIndex: zindex,
      }}
      className={`${
        isSelected ? 'outline-2 outline-dark-pink-cl outline' : ''
      } NAME-root-element absolute h-fit w-fit bg-pink-400/20 touch-none`}
      onClick={pickElement}
    >
      <div
        className={`NAME-element-main-box relative origin-center text-inherit max-w-[200px] max-h-[300px]`}
      >
        <div className="h-full w-full">
          <p
            style={{
              fontSize: `${fontSize}px`,
            }}
            className="NAME-displayed-text-content font-bold whitespace-nowrap select-none"
          >
            {text}
          </p>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-rotate-box absolute -top-7 -left-7 z-20`}
        >
          <button
            ref={rotateButtonRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <RotateCw size={18} color="currentColor" />
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -bottom-7 -right-7 z-20`}
        >
          <button
            ref={zoomButtonRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <Scaling size={18} color="currentColor" />
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -top-7 -right-7 z-20`}
        >
          <button
            onClick={() => onRemoveElement(id)}
            className="bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
          >
            <X size={18} color="currentColor" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
