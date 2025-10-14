import useDraggable from '@/hooks/use-draggable'
import { IPrintedImage } from '@/utils/types'
import { X, RotateCw } from 'lucide-react'
import { usePinch } from '@use-gesture/react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/use-rotate-element'

const maxZoom: number = 2
const minZoom: number = 0.3

type TTimerObject = { timer: NodeJS.Timeout | undefined }

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
  const { ref: refForDrag, position } = useDraggable()
  const { url, height, width, id } = element
  const isSelected = selectedElementId === id
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })
  const { rotation, handleRef } = useRotateElement({
    initialRotation: 0,
    sensitivity: 0.5,
  })
  const rotateTimerObjectRef = useRef<TTimerObject>({ timer: undefined })

  const pickElement = () => {
    onUpdateSelectedElementId(id)
  }

  const fillMenuInputs = (rootElement?: HTMLElement) => {
    const { angle, scale } = propertiesRef.current
    let root = rootElement || null
    if (!root) {
      root = rootRef.current
      if (root) {
        const menuBoard = root.querySelector<HTMLElement>('.NAME-menu-board')
        if (menuBoard) {
          const angleInput = menuBoard.querySelector<HTMLInputElement>('.NAME-form-angle input')
          if (angleInput) {
            angleInput.value = `${angle}`
          }
          const scaleInput = menuBoard.querySelector<HTMLInputElement>('.NAME-form-scale input')
          if (scaleInput) {
            scaleInput.value = `${scale}`
          }
        }
      }
    }
  }

  const hideShowUsefulButtons = (rootElement: HTMLElement, hide: boolean) => {
    queueMicrotask(() => {
      if (isSelected) {
        if (hide) {
          rootElement
            .querySelector<HTMLDivElement>('.NAME-menu-board')
            ?.classList.add('STYLE-adjusting-element')
          rootElement
            .querySelector<HTMLDivElement>('.NAME-remove-box')
            ?.classList.add('STYLE-adjusting-element')
          rootElement
            .querySelector<HTMLButtonElement>('.NAME-menu-trigger-box')
            ?.classList.add('STYLE-adjusting-element')
        } else {
          rootElement
            .querySelector<HTMLDivElement>('.NAME-menu-board')
            ?.classList.remove('STYLE-adjusting-element')
          rootElement
            .querySelector<HTMLDivElement>('.NAME-remove-box')
            ?.classList.remove('STYLE-adjusting-element')
          rootElement
            .querySelector<HTMLButtonElement>('.NAME-menu-trigger-box')
            ?.classList.remove('STYLE-adjusting-element')
        }
      }
    })
  }

  const onPinchAdjust = (rootElement: HTMLElement) => {
    hideShowUsefulButtons(rootElement, true)
  }

  const onEndPinchAdjust = (rootElement: HTMLElement) => {
    hideShowUsefulButtons(rootElement, false)
  }

  const adjustElementForPinch = (scale: number, angle: number, last: boolean) => {
    const root = rootRef.current
    if (root) {
      const elementMainBox = root.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        elementMainBox.style.transform = `scale(${scale}) rotate(${angle}deg)`
        propertiesRef.current = { scale, angle }
        fillMenuInputs(root)
      }
      onPinchAdjust(root)
      if (last) {
        onEndPinchAdjust(root)
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

  const hideShowMenu = (show: boolean, board: HTMLElement, trigger: HTMLElement) => {
    if (show) {
      board.classList.remove('hidden')
      board.dataset.show = 'true'
      trigger.style.display = 'none'
    } else {
      board.classList.add('hidden')
      board.dataset.show = 'false'
      trigger.style.display = 'block'
    }
  }

  const handleShowHideMenu = (forceHide?: boolean) => {
    const root = rootRef.current
    if (!root) return
    const board = root.querySelector<HTMLDivElement>('.NAME-menu-board')
    if (board) {
      const trigger = root.querySelector<HTMLButtonElement>('.NAME-menu-trigger')
      if (trigger) {
        const show = board.dataset.show === 'true'
        if (forceHide) {
          hideShowMenu(false, board, trigger)
        } else {
          hideShowMenu(!show, board, trigger)
        }
      }
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
        fillMenuInputs(root)
      }
    }
  }

  const listenClickOnPageEvent = (target: HTMLElement | null) => {
    if (target) {
      if (!target.closest('.NAME-root-element') && !target.closest('.NAME-menu-section')) {
        onUpdateSelectedElementId(null)
        handleShowHideMenu(true)
      }
    }
  }

  const rotateElementByButton = () => {
    const rootElement = rootRef.current
    if (rootElement) {
      hideShowUsefulButtons(rootElement, true)
      const elementMainBox = rootElement.querySelector<HTMLDivElement>(`.NAME-element-main-box`)
      if (elementMainBox) {
        elementMainBox.style.transform = `scale(${propertiesRef.current.scale}) rotate(${rotation}deg)`
        propertiesRef.current.angle = rotation
        fillMenuInputs()
      }
      const timerObject = rotateTimerObjectRef.current
      const { timer } = timerObject
      if (timer) {
        clearTimeout(timer)
      }
      timerObject.timer = setTimeout(() => {
        hideShowUsefulButtons(rootElement, false)
      }, 500)
    }
  }

  const listenSubmitPrintedImageEleProps = (
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
    rotateElementByButton()
  }, [rotation])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    eventEmitter.on(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      listenSubmitPrintedImageEleProps
    )
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
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
        style={{
          width: width === -1 ? 'auto' : width,
          aspectRatio: width === -1 || height === -1 ? 'auto' : `${width} / ${height}`,
        }}
        className="NAME-element-main-box max-w-[200px] select-none touch-none relative origin-center"
      >
        <div className="h-full w-full">
          <img src={url || '/placeholder.svg'} alt="Overlay" className="h-full w-full" />
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
          <X size={12} color="currentColor" />
        </button>
      </div>
    </div>
  )
}
