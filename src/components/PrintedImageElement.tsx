import useDraggable from '@/hooks/use-draggable'
import { IPrintedImage } from '@/utils/types'
import { X, MoreHorizontal, RefreshCw, Move, Check, Fullscreen } from 'lucide-react'
import { usePinch } from '@use-gesture/react'
import { useRef } from 'react'

const maxZoom: number = 2
const minZoom: number = 0.3

type TPropertyType = 'scale' | 'angle' | 'posX' | 'posY'

interface MenuBoardProps {
  onCloseMenuBoard: () => void
  onChangeProperties: (scale?: number, angle?: number, posX?: number, posY?: number) => void
}

const validateInputPositiveNumber = (input: HTMLInputElement): number | null => {
  const value = input.value.trim()
  const numberRegex = /^\d+(\.\d+)?$/
  return numberRegex.test(value) ? parseFloat(value) : null
}

const MenuBoard = ({ onCloseMenuBoard, onChangeProperties }: MenuBoardProps) => {
  const handleChangeProperties = (scale?: number, angle?: number, posX?: number, posY?: number) => {
    onChangeProperties(scale, angle, posX, posY)
  }

  const submit = (input: HTMLInputElement, type: TPropertyType) => {
    const value = validateInputPositiveNumber(input)
    if (!value) return
    switch (type) {
      case 'scale':
        handleChangeProperties(value)
        break
      case 'angle':
        handleChangeProperties(undefined, value)
        break
      case 'posX':
        handleChangeProperties(undefined, undefined, value)
        break
      case 'posY':
        handleChangeProperties(undefined, undefined, undefined, value)
        break
    }
  }

  const catchEnter = (e: React.KeyboardEvent<HTMLInputElement>, type: TPropertyType) => {
    if (e.key === 'Enter') {
      submit(e.currentTarget, type)
    }
  }

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>, type: TPropertyType) => {
    const target = e.currentTarget
    const input = target.parentElement?.querySelector<HTMLInputElement>('input')
    if (input) {
      submit(input, type)
    }
  }

  return (
    <div
      data-show={false}
      className="NAME-menu-board absolute hidden z-[80] left-1/2 top-[calc(100%+4px)]"
    >
      <div className="absolute top-0 right-[calc(100%+6px)]">
        <button onClick={onCloseMenuBoard}>
          <X size={22} className="text-white rounded-full p-1 bg-pink-cl" strokeWidth={3} />
        </button>
      </div>
      <div className="flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
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
      <div className="flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
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
      <div className="flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-fit">
        <Move size={16} className="text-white" strokeWidth={3} />
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="30"
            onKeyDown={(e) => catchEnter(e, 'posX')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
          <input
            type="text"
            placeholder="49"
            onKeyDown={(e) => catchEnter(e, 'posY')}
            className="border rounded px-1 py-0.5 text-sm outline-none w-[40px]"
          />
        </div>
        <button
          onClick={(e) => handleClickCheck(e, 'posY')}
          className="text-white active:bg-green-400 rounded p-1"
        >
          <Check size={16} className="text-white" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

type TElementProperties = { scale: number; angle: number }

interface PrintedImageElementProps {
  imgEl: IPrintedImage
  handleRemovePrintedImage: (id: string) => void
  selectedElementId: string | null
  onUpdateSelectedElementId: (id: string | null) => void
}

export const PrintedImageElement = ({
  imgEl,
  handleRemovePrintedImage,
  onUpdateSelectedElementId,
  selectedElementId,
}: PrintedImageElementProps) => {
  const { ref: refForDrag, position } = useDraggable()
  const { url, height, width, id } = imgEl
  const isSelected = selectedElementId === id
  const rootRef = useRef<HTMLElement | null>(null)
  const propertiesRef = useRef<TElementProperties>({ scale: 1, angle: 0 })

  const onAdjust = (rootElement: HTMLElement) => {
    queueMicrotask(() => {
      rootElement.querySelector<HTMLDivElement>('.NAME-menu-board')?.classList.add('hidden')
      rootElement.querySelector<HTMLDivElement>('.NAME-remove-button')?.classList.add('hidden')
    })
  }

  const onEndAdjust = (rootElement: HTMLElement) => {
    queueMicrotask(() => {
      rootElement.querySelector<HTMLDivElement>('.NAME-menu-board')?.classList.remove('hidden')
      rootElement.querySelector<HTMLDivElement>('.NAME-remove-button')?.classList.remove('hidden')
    })
  }

  const adjustElement = (scale: number, angle: number, last: boolean) => {
    const root = rootRef.current
    if (root) {
      const imageBox = root.querySelector<HTMLDivElement>(`.NAME-image-box`)
      if (imageBox) {
        imageBox.style.transform = `scale(${scale}) rotate(${angle}deg)`
        propertiesRef.current = { scale, angle }
      }
      onAdjust(root)
      if (last) {
        onEndAdjust(root)
      }
    }
  }

  const bindForPinch = usePinch(
    ({ offset: [scale, angle], last }) => adjustElement(scale, angle, last),
    {
      scaleBounds: { min: minZoom, max: maxZoom },
      rubberband: true,
      eventOptions: { passive: false },
    }
  )

  const handleShowHideMenu = () => {
    const root = rootRef.current
    if (!root) return
    const board = root.querySelector<HTMLDivElement>('.NAME-menu-board')
    if (board) {
      const trigger = root.querySelector<HTMLButtonElement>('.NAME-menu-trigger')
      if (trigger) {
        const show = board.dataset.show === 'true'
        if (show) {
          board.classList.add('hidden')
          board.dataset.show = 'false'
          trigger.style.display = 'block'
        } else {
          board.classList.remove('hidden')
          board.dataset.show = 'true'
          trigger.style.display = 'none'
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
    console.log('>>> props:', { scale, angle, posX, posY })
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
      }
    }
  }

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
      className="absolute h-fit w-fit"
      onClick={() => onUpdateSelectedElementId(id)}
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
        style={{ display: isSelected ? 'block' : 'none' }}
        className="absolute -top-5 -right-5 z-20"
      >
        <button
          onClick={() => handleRemovePrintedImage(id)}
          className="NAME-remove-button bg-red-600 text-white rounded-full p-1 active:scale-90 transition"
        >
          <X size={12} color="currentColor" />
        </button>
      </div>
      <div
        className="absolute top-full left-1/2 -translate-x-1/2"
        style={{ display: isSelected ? 'block' : 'none' }}
      >
        <button
          onClick={handleShowHideMenu}
          className="NAME-menu-trigger bg-pink-cl text-white px-2 mt-1 rounded-md py-[1px]"
        >
          <MoreHorizontal size={16} color="currentColor" />
        </button>
      </div>
      <MenuBoard
        onChangeProperties={onEditElementProperties}
        onCloseMenuBoard={handleShowHideMenu}
      />
    </div>
  )
}
