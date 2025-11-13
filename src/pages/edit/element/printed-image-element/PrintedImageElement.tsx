import { TPrintedImageVisualState } from '@/utils/types/global'
import { X, RotateCw, Scaling } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useElementControl } from '@/hooks/element/use-element-control'
import { getNaturalSizeOfImage, typeToObject } from '@/utils/helpers'
import { useElementLayerContext } from '@/context/global-context'

const MAX_ZOOM: number = 3
const MIN_ZOOM: number = 0.3

interface PrintedImageElementProps {
  element: TPrintedImageVisualState
  onRemoveElement: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
  canvasAreaRef: React.MutableRefObject<HTMLDivElement | null>
  mountType: 'new' | 'from-saved'
}

export const PrintedImageElement = ({
  element,
  onRemoveElement,
  onUpdateSelectedElementId,
  selectedElementId,
  canvasAreaRef,
  mountType,
}: PrintedImageElementProps) => {
  const { url, id } = element
  const isSelected = selectedElementId === id
  const {
    forPinch: { ref: refForPinch },
    forRotate: { ref: refForRotate, rotateButtonRef },
    forZoom: { ref: refForZoom, zoomButtonRef },
    forDrag: { ref: refForDrag },
    state: { position, angle, scale, zindex },
    handleSetElementState,
  } = useElementControl(id, {
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    position: element.position,
    scale: element.scale,
    angle: element.angle,
    zindex: element.zindex,
  })
  const { x, y } = position
  const rootRef = useRef<HTMLElement | null>(null)
  const { addToElementLayers } = useElementLayerContext()

  const pickElement = () => {
    eventEmitter.emit(EInternalEvents.PICK_ELEMENT, rootRef.current, 'printed-image')
    onUpdateSelectedElementId(id)
  }

  const listenSubmitEleProps = (
    elementId: string | null,
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => {
    if (elementId === id) {
      handleSetElementState(posX, posY, scale, angle, zindex)
    }
  }

  const moveElementIntoCenter = (root: HTMLElement, editContainer: HTMLElement) => {
    const editorContainerRect = editContainer.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    root.style.left = `${(editorContainerRect.width - rootRect.width) / 2}px`
    root.style.top = `${(editorContainerRect.height - rootRect.height) / 2}px`
  }

  const initElementDisplaySize = (root: HTMLElement, editContainer: HTMLElement) => {
    const display = root.querySelector<HTMLImageElement>('.NAME-element-display')
    if (!display) return
    getNaturalSizeOfImage(
      url,
      (naturalWidth, naturalHeight) => {
        const editContainerRect = editContainer.getBoundingClientRect()
        const maxWidth = Math.min(editContainerRect.width, 200)
        const maxHeight = Math.min(editContainerRect.height, 300)
        let cssText = `aspect-ratio: ${naturalWidth} / ${naturalHeight};`
        if (naturalWidth > maxWidth) {
          cssText += ` width: ${maxWidth}px;`
        } else if (naturalHeight > maxHeight) {
          cssText += ` height: ${maxHeight}px;`
        }
        display.style.cssText = cssText
        display.onload = () => {
          handleSetElementState(
            parseInt(getComputedStyle(root).left),
            parseInt(getComputedStyle(root).top)
          )
          // reset max size limit after image load
          const editorContainerRect = editContainer.getBoundingClientRect()
          const { width, height } = editorContainerRect
          display.style.cssText = `max-width: ${width / 2}px; max-height: ${height / 2}px;`
          const mainBox = root.querySelector<HTMLElement>('.NAME-element-main-box')
          if (!mainBox) return
          mainBox.style.cssText = `max-width: ${width / 2}px; max-height: ${height / 2}px;`
        }
        display.src = url
      },
      () => {}
    )
  }

  const initElement = () => {
    if (mountType === 'from-saved') return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const root = rootRef.current
        if (!root) return
        const editContainer = canvasAreaRef.current
        if (!editContainer) return
        moveElementIntoCenter(root, editContainer)
        initElementDisplaySize(root, editContainer)
      })
    })
  }

  const handleAddElementLayer = () => {
    addToElementLayers({ elementId: id, index: zindex })
  }

  useEffect(() => {
    if (selectedElementId !== id) return
    eventEmitter.emit(EInternalEvents.SYNC_ELEMENT_PROPS, id, 'printed-image')
  }, [scale, angle, position, selectedElementId, id])

  useEffect(() => {
    initElement()
    handleAddElementLayer()
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
        transform: `scale(${scale}) rotate(${angle}deg)`,
        zIndex: zindex,
      }}
      className={`${
        isSelected ? 'shadow-[0_0_0_2px_#d91670]' : ''
      } NAME-root-element NAME-element-type-printed-image absolute h-fit w-fit touch-none bg-pink-400/20`}
      onClick={pickElement}
      data-visual-state={JSON.stringify(
        typeToObject<TPrintedImageVisualState>({
          id,
          url,
          position: {
            x: position.x || x,
            y: position.y || y,
          },
          scale,
          angle,
          zindex,
        })
      )}
    >
      <div
        className={`NAME-element-main-box select-none relative origin-center max-w-[200px] max-h-[300px]`}
      >
        <div className="h-full w-full">
          <img src={url} alt="Ảnh in" className="NAME-element-display object-cover" />
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
            <RotateCw size={18} color="currentColor" />
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
            <Scaling size={18} color="currentColor" />
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
            <X size={18} color="currentColor" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
