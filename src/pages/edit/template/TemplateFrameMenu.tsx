import { useGlobalContext } from '@/context/global-context'
import { getInitialContants } from '@/utils/contants'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { TElementType, TPrintedImageVisualState } from '@/utils/types/global'
import { Check, Crop, RefreshCw, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type TPropertyType = 'scale' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

interface PrintedImageMenuProps {
  frameId: string
  onClose: () => void
  onOpenCropModal: (frameId: string) => void
  onShowPrintedImagesModal: (frameId: string) => void
  onRemoveFrameImage: (frameId: string) => void
}

export const TemplateFrameMenu = ({
  frameId,
  onClose,
  onOpenCropModal,
  onShowPrintedImagesModal,
  onRemoveFrameImage,
}: PrintedImageMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { pickedElementRoot } = useGlobalContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

  const validateInputsPositiveNumber = (
    inputs: HTMLInputElement[],
    type: TPropertyType
  ): (number | undefined)[] => {
    const values = inputs.map((input) => input.value.trim())
    // Allow negative numbers if type is 'angle'
    const numberRegex = type === 'angle' ? /^-?\d*\.?\d+$|^0$/ : /^\d+(\.\d+)?$/
    const validValues = values.map((value) =>
      numberRegex.test(value) ? parseFloat(value) : undefined
    )
    return validValues.length > 0 ? validValues : []
  }

  const handleChangeProperties = (
    scale?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      frameId,
      scale,
      angle,
      posX,
      posY,
      zindex
    )
  }

  const submit = (inputs: HTMLInputElement[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs, type)
    if (values && values.length > 0) {
      switch (type) {
        case 'scale':
          handleChangeProperties(values[0] ? values[0] / 100 : undefined)
          break
        case 'angle':
          handleChangeProperties(undefined, values[0])
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

  const onClickButton = (type: TPropertyType) => {
    if (type === 'zindex-down') {
      handleChangeProperties(
        undefined,
        undefined,
        undefined,
        undefined,
        -getInitialContants<number>('ELEMENT_ZINDEX_STEP')
      )
    } else if (type === 'zindex-up') {
      handleChangeProperties(
        undefined,
        undefined,
        undefined,
        undefined,
        getInitialContants<number>('ELEMENT_ZINDEX_STEP')
      )
    }
  }

  const handleCropImage = () => {
    onOpenCropModal(frameId)
  }

  const handleRemoveFrameImage = () => {
    onRemoveFrameImage(frameId)
    setShowDeleteConfirm(false)
  }

  const getAllInputsInForm = () => {
    const menuSection = menuRef.current
    const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-scale input')
    const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
    const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>('.NAME-form-position input')
    return { scaleInput, angleInput, posXYInputs }
  }

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { scaleInput, angleInput, posXYInputs } = getAllInputsInForm()
    handleChangeProperties(
      scaleInput?.value ? parseFloat(scaleInput.value) / 100 : undefined,
      angleInput?.value ? parseFloat(angleInput.value) : undefined,
      posXYInputs && posXYInputs[0]?.value ? parseFloat(posXYInputs[0].value) : undefined,
      posXYInputs && posXYInputs[1]?.value ? parseFloat(posXYInputs[1].value) : undefined
    )
  }

  const listenElementProps = (idOfElement: string | null, type: TElementType) => {
    if (type !== 'printed-image' || frameId !== idOfElement) return
    const dataset = JSON.parse(pickedElementRoot?.getAttribute('data-visual-state') || '{}')
    const { scale, angle, position } = dataset as TPrintedImageVisualState
    const { x: posX, y: posY } = position || {}
    const menuSection = menuRef.current
    if (scale) {
      const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-scale input')
      if (scaleInput) scaleInput.value = (scale * 100).toFixed(0)
    }
    if (angle || angle === 0) {
      const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
      if (angleInput) angleInput.value = angle.toFixed(0)
    }
    if (posX || posX === 0) {
      const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>(
        '.NAME-form-position input'
      )
      if (posXYInputs) posXYInputs[0].value = posX.toFixed(0)
    }
    if (posY || posY === 0) {
      const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>(
        '.NAME-form-position input'
      )
      if (posXYInputs) posXYInputs[1].value = posY.toFixed(0)
    }
  }

  useEffect(() => {
    listenElementProps(frameId, 'printed-image')
  }, [frameId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <div
      ref={menuRef}
      className="NAME-menu-section relative overflow-x-auto flex flex-nowrap items-stretch justify-center gap-y-1 gap-x-1 p-1 pr-[40px] rounded-md border border-gray-400/30 border-solid"
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-1 flex items-center">
        <button
          onClick={onClose}
          className="group flex flex-nowrap items-center justify-center font-bold bg-pink-cl gap-1 text-white active:scale-90 transition rounded p-1"
        >
          <X size={20} className="text-white" strokeWidth={3} />
        </button>
      </div>

      <div className="NAME-form-group NAME-form-crop min-w-[100px] col-span-2 flex flex-shrink-0 items-center justify-center bg-pink-cl rounded px-1 py-0.5 shadow">
        <button
          onClick={handleCropImage}
          className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-white hover:bg-white hover:text-pink-cl rounded p-1 transition-colors"
        >
          <Crop size={20} className="text-white group-hover:text-pink-cl" strokeWidth={3} />
          <span>Cắt ảnh</span>
        </button>
      </div>
      <div className="NAME-form-group NAME-form-crop min-w-[100px] col-span-2 flex flex-shrink-0 items-center justify-center bg-pink-cl rounded px-1 py-0.5 shadow">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-white hover:bg-white hover:text-pink-cl rounded p-1 transition-colors"
        >
          <Trash2 size={20} className="text-white group-hover:text-pink-cl" strokeWidth={3} />
          <span>Xóa ảnh</span>
        </button>
      </div>
      <div className="NAME-form-group NAME-form-crop min-w-[100px] col-span-2 flex flex-shrink-0 items-center justify-center bg-pink-cl rounded px-1 py-0.5 shadow">
        <button
          onClick={() => onShowPrintedImagesModal(frameId)}
          className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-white hover:bg-white hover:text-pink-cl rounded p-1 transition-colors"
        >
          <RefreshCw size={20} className="text-white group-hover:text-pink-cl" strokeWidth={3} />
          <span>Đổi ảnh</span>
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center">
        <button
          onClick={onClose}
          className="group flex flex-nowrap items-center justify-center font-bold bg-pink-cl gap-1 text-white active:scale-90 transition rounded p-1"
        >
          <Check size={20} className="text-white" strokeWidth={3} />
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 z-10 absolute inset-0"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="relative z-20 bg-white p-4 rounded shadow-lg">
            <div>
              <p className="font-bold">Bạn xác nhận sẽ xóa ảnh?</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 px-4 font-bold rounded bg-gray-600 text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleRemoveFrameImage}
                className="flex items-center justify-center gap-1.5 py-2 px-4 font-bold rounded bg-pink-cl text-white"
              >
                <span>Xác nhận</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-icon lucide-check"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
