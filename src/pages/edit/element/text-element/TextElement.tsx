import { TTextVisualState } from '@/utils/types/global'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useElementLayerContext } from '@/context/global-context'
import { useTextElementControl } from '@/hooks/element/use-text-element-control'
import { typeToObject } from '@/utils/helpers'

const MAX_TEXT_FONT_SIZE: number = 1000
const MIN_TEXT_FONT_SIZE: number = 5

interface TextElementProps {
  element: TTextVisualState
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
  canvasAreaRef: React.MutableRefObject<HTMLDivElement | null>
  mountType: 'new' | 'from-saved'
}

export const TextElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
  canvasAreaRef,
  mountType,
}: TextElementProps) => {
  const { id } = element
  const isSelected = selectedElementId === id
  const {
    forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag },
    state: { position, angle, zindex, fontSize, textColor, content, fontFamily, fontWeight },
    handleSetElementState,
  } = useTextElementControl(id, {
    maxFontSize: MAX_TEXT_FONT_SIZE,
    minFontSize: MIN_TEXT_FONT_SIZE,
    position: element.position,
    angle: element.angle,
    fontSize: element.fontSize,
    textColor: element.textColor,
    content: element.content,
    zindex: element.zindex,
    fontFamily: element.fontFamily,
    fontWeight: element.fontWeight,
  })
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
    zindex?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string
  ) => {
    if (elementId === id) {
      handleSetElementState(
        posX,
        posY,
        undefined,
        angle,
        zindex,
        fontSize,
        textColor,
        content,
        fontFamily
      )
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
    if (mountType === 'from-saved') return
    requestAnimationFrame(() => {
      const root = rootRef.current
      if (!root) return
      const editContainer = canvasAreaRef.current
      if (!editContainer) return
      moveElementIntoCenter(root, editContainer)
      initElementDisplaySize(root, editContainer)
    })
  }

  const handleAddElementLayer = () => {
    addToElementLayers({ elementId: id, index: zindex })
  }

  useEffect(() => {
    initElement()
    handleAddElementLayer()
  }, [])

  useEffect(() => {
    if (selectedElementId !== id) return
    eventEmitter.emit(EInternalEvents.SYNC_ELEMENT_PROPS, id, 'text')
  }, [fontSize, angle, position, selectedElementId, id])

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
        zIndex: zindex,
      }}
      className={`${
        isSelected ? 'shadow-[0_0_0_2px_#d91670]' : ''
      } NAME-root-element NAME-element-type-text absolute h-fit w-fit touch-none`}
      onClick={pickElement}
      data-visual-state={JSON.stringify(
        typeToObject<TTextVisualState>({
          id,
          position,
          angle,
          zindex,
          fontSize,
          textColor,
          content,
          fontFamily,
          fontWeight,
        })
      )}
    >
      <div
        className={`NAME-element-main-box relative origin-center text-inherit max-w-[200px] max-h-[300px]`}
      >
        <div className="h-full w-full">
          <p
            style={{
              fontSize: `${fontSize}px`,
              color: textColor,
              fontFamily,
              fontWeight,
            }}
            className="NAME-displayed-text-content font-bold whitespace-nowrap select-none"
          >
            {content}
          </p>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-rotate-box absolute -top-7 -left-7 z-[999]`}
        >
          <button
            ref={rotateButtonRef}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-rotate-cw-icon lucide-rotate-cw h-[18px] w-[18px] md:w-[20px] md:h-[20px]"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -bottom-7 -right-7 z-[999]`}
        >
          <button
            ref={zoomButtonRef}
            style={{ transform: `rotateY(180deg)` }}
            className="cursor-grab active:cursor-grabbing bg-pink-cl text-white rounded-full p-1 active:scale-90 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-scaling-icon lucide-scaling h-[18px] w-[18px] md:w-[20px] md:h-[20px]"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M14 15H9v-5" />
              <path d="M16 3h5v5" />
              <path d="M21 3 9 15" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isSelected ? 'block' : 'hidden'
          } NAME-remove-box absolute -top-7 -right-7 z-[999]`}
        >
          <button
            onClick={() => onRemoveElement(id)}
            className="bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x h-[18px] w-[18px] md:w-[20px] md:h-[20px]"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
