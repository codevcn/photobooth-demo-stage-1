import useDraggable from '@/hooks/use-draggable'
import { IPrintedImage } from '@/utils/types'
import { X, MoreHorizontal, RefreshCw, Move, Check, Fullscreen, RotateCw } from 'lucide-react'
import { usePinch } from '@use-gesture/react'
import { useEffect, useRef } from 'react'
import { eventEmitter } from '@/utils/events'
import { EInternalEvents } from '@/utils/enums'
import { useRotateElement } from '@/hooks/use-rotate-element'

const maxZoom: number = 2
const minZoom: number = 0.3

const validateInputsPositiveNumber = (inputs: HTMLInputElement[]): number[] | null => {
  const values = inputs.map((input) => input.value.trim())
  const numberRegex = /^\d+(\.\d+)?$/
  const validValues = values
    .filter((value) => numberRegex.test(value))
    .map((value) => parseFloat(value))
  return validValues.length > 0 ? validValues : null
}

type TPropertyType = 'scale' | 'angle' | 'posX' | 'posY' | 'posXY'

interface MenuBoardProps {
  onCloseMenuBoard: () => void
  onChangeProperties: (scale?: number, angle?: number, posX?: number, posY?: number) => void
  elementSelected: boolean
}

const MenuBoard = ({ onCloseMenuBoard, onChangeProperties, elementSelected }: MenuBoardProps) => {
  const handleChangeProperties = (scale?: number, angle?: number, posX?: number, posY?: number) => {
    onChangeProperties(scale, angle, posX, posY)
  }

  const submit = (inputs: HTMLInputElement[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs)
    if (values && values.length > 0) {
      switch (type) {
        case 'scale':
          handleChangeProperties(values[0])
          break
        case 'angle':
          handleChangeProperties(undefined, values[0])
          break
        case 'posX':
          handleChangeProperties(undefined, undefined, values[0])
          break
        case 'posY':
          handleChangeProperties(undefined, undefined, undefined, values[0])
          break
        case 'posXY':
          if (values.length >= 2) {
            handleChangeProperties(undefined, undefined, values[0], values[1])
          }
      }
    }
  }

  const catchEnter = (e: React.KeyboardEvent<HTMLInputElement>, type: TPropertyType) => {
    if (e.key === 'Enter') {
      const formGroup = e.currentTarget.closest<HTMLElement>('.NAME-form-group')
      const inputs = formGroup?.querySelectorAll<HTMLInputElement>('input')
      if (inputs) {
        submit(Array.from(inputs), type)
      }
    }
  }

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>, type: TPropertyType) => {
    const formGroup = e.currentTarget.closest<HTMLElement>('.NAME-form-group')
    const inputs = formGroup?.querySelectorAll<HTMLInputElement>('input')
    if (inputs) {
      submit(Array.from(inputs), type)
    }
  }

  return (
    <div
      data-show={false}
      className={`${
        elementSelected ? 'block' : 'hidden'
      } NAME-menu-board absolute hidden z-[80] left-1/2 top-[calc(100%+4px)]`}
    >
      <div className="absolute top-0 right-[calc(100%+6px)]">
        <button onClick={onCloseMenuBoard}>
          <X size={22} className="text-white rounded-full p-1 bg-pink-cl" strokeWidth={3} />
        </button>
      </div>
      <div className="NAME-form-group NAME-form-scale flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
        <Fullscreen size={16} className="text-white" strokeWidth={3} />
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="1.15"
            onKeyDown={(e) => catchEnter(e, 'scale')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
        </div>
        <button
          onClick={(e) => handleClickCheck(e, 'scale')}
          className="text-white active:bg-green-400 rounded p-1"
        >
          <Check size={16} className="text-white" strokeWidth={3} />
        </button>
      </div>
      <div className="NAME-form-group NAME-form-angle flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
        <RefreshCw size={16} className="text-white" strokeWidth={3} />
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="22"
            onKeyDown={(e) => catchEnter(e, 'angle')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
        </div>
        <button
          onClick={(e) => handleClickCheck(e, 'angle')}
          className="text-white active:bg-green-400 rounded p-1"
        >
          <Check size={16} className="text-white" strokeWidth={3} />
        </button>
      </div>
      <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
        <Move size={16} className="text-white" strokeWidth={3} />
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="X"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
          <input
            type="text"
            placeholder="Y"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
        </div>
        <button
          onClick={(e) => handleClickCheck(e, 'posXY')}
          className="text-white active:bg-green-400 rounded p-1"
        >
          <Check size={16} className="text-white" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

type TTimerObject = { timer: NodeJS.Timeout | undefined }

type TElementProperties = { scale: number; angle: number }

interface PrintedImageElementProps {
  imgEl: IPrintedImage
  onRemovePrintedImage: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
}

export const PrintedImageElement = ({
  imgEl,
  onRemovePrintedImage,
  onUpdateSelectedElementId,
  selectedElementId,
}: PrintedImageElementProps) => {
  const { ref: refForDrag, position } = useDraggable()
  const { url, height, width, id } = imgEl
  const isSelected = selectedElementId === id
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })
  const { rotation, handleRef } = useRotateElement({
    initialRotation: 0,
    sensitivity: 0.5,
  })
  const timerObjectRef = useRef<TTimerObject>({ timer: undefined })

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
      const imageBox = root.querySelector<HTMLDivElement>(`.NAME-image-box`)
      if (imageBox) {
        imageBox.style.transform = `scale(${scale}) rotate(${angle}deg)`
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
      const imageBox = root.querySelector<HTMLDivElement>(`.NAME-image-box`)
      if (imageBox) {
        if (scale) {
          imageBox.style.transform = `scale(${scale}) rotate(${propertiesRef.current.angle}deg)`
          propertiesRef.current.scale = scale
        }
        if (angle || angle === 0) {
          imageBox.style.transform = `scale(${propertiesRef.current.scale}) rotate(${angle}deg)`
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
    if (target && !target.closest('.NAME-root-printed-element')) {
      onUpdateSelectedElementId(null)
      handleShowHideMenu(true)
    }
  }

  const rotateElement = () => {
    const rootElement = rootRef.current
    if (rootElement) {
      hideShowUsefulButtons(rootElement, true)
      const imageBox = rootElement.querySelector<HTMLDivElement>(`.NAME-image-box`)
      if (imageBox) {
        imageBox.style.transform = `scale(${propertiesRef.current.scale}) rotate(${rotation}deg)`
        propertiesRef.current.angle = rotation
        fillMenuInputs()
      }
      const timerObject = timerObjectRef.current
      const { timer } = timerObject
      if (timer) {
        clearTimeout(timer)
      }
      timerObject.timer = setTimeout(() => {
        hideShowUsefulButtons(rootElement, false)
      }, 500)
    }
  }

  useEffect(() => {
    rotateElement()
  }, [rotation])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPageEvent)
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
      } NAME-root-printed-element absolute h-fit w-fit`}
      onClick={pickElement}
    >
      <div
        {...bindForPinch()}
        style={{
          width: width === -1 ? 'auto' : width,
          aspectRatio: width === -1 || height === -1 ? 'auto' : `${width} / ${height}`,
        }}
        className="NAME-image-box max-w-[200px] select-none touch-none relative origin-center"
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
          onClick={() => onRemovePrintedImage(id)}
          className="bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
        >
          <X size={12} color="currentColor" />
        </button>
      </div>
      <div
        className={`${
          isSelected ? 'block' : 'hidden'
        } NAME-menu-trigger-box absolute top-[calc(100%+2px)] left-1/2 -translate-x-1/2`}
      >
        <button
          onClick={() => handleShowHideMenu()}
          className="NAME-menu-trigger bg-pink-cl text-white px-2 mt-1 rounded-md py-[1px]"
        >
          <MoreHorizontal size={16} color="currentColor" strokeWidth={3} />
        </button>
      </div>
      <MenuBoard
        onChangeProperties={onEditElementProperties}
        onCloseMenuBoard={handleShowHideMenu}
        elementSelected={isSelected}
      />
    </div>
  )
}
