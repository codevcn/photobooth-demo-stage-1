import { useGlobalContext } from '@/context/global-context'
import { getInitialContants } from '@/utils/contants'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { TElementType, TPrintedImageVisualState } from '@/utils/types/global'
import { RefreshCw, Move, Check, Fullscreen, Layers2, Crop } from 'lucide-react'
import { useEffect, useRef } from 'react'

type TPropertyType = 'scale' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

interface PrintedImageMenuProps {
  elementId: string
}

export const PrintedImageElementMenu = ({ elementId }: PrintedImageMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { pickedElementRoot } = useGlobalContext()

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
      elementId,
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

  const handleCropClick = () => {
    eventEmitter.emit(EInternalEvents.OPEN_CROP_ELEMENT_MODAL, elementId)
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
    if (type !== 'printed-image' || elementId !== idOfElement) return
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
    listenElementProps(elementId, 'printed-image')
  }, [elementId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    return () => {
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <div
      ref={menuRef}
      className="NAME-menu-section grid grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-1"
    >
      <div className="NAME-form-group NAME-form-crop col-span-2 flex items-center justify-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <button
          onClick={handleCropClick}
          className="group flex items-center justify-center font-bold w-full gap-1 text-white hover:bg-white hover:text-pink-cl rounded p-1 transition-colors"
        >
          <Crop size={20} className="text-white group-hover:text-pink-cl" strokeWidth={3} />
          <span>Cắt ảnh</span>
        </button>
      </div>
      <div className="NAME-form-group NAME-form-scale flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <Fullscreen size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 items-center mx-1 grow">
          <input
            type="text"
            placeholder="Độ co giãn, VD: 55"
            onKeyDown={(e) => catchEnter(e, 'scale')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
          <span className="text-white text-base font-bold">%</span>
        </div>
      </div>
      <div className="NAME-form-group NAME-form-angle flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <RefreshCw size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 items-center mx-1 grow">
          <input
            type="text"
            placeholder="Độ xoay, VD: 22"
            onKeyDown={(e) => catchEnter(e, 'angle')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
          <span className="text-white text-base font-bold">độ</span>
        </div>
      </div>
      <div className="NAME-form-group NAME-form-zindex flex items-center justify-between bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <Layers2 size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 grow flex-wrap">
          <button
            onClick={() => onClickButton('zindex-up')}
            className="bg-white border-2 grow text-pink-cl border-pink-cl rounded px-1.5 py-0.5 flex gap-0.5 items-center justify-center"
          >
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
              className="lucide lucide-arrow-up-icon lucide-arrow-up"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </button>
          <button
            onClick={() => onClickButton('zindex-down')}
            className="bg-white border-2 grow text-pink-cl border-pink-cl rounded px-1.5 py-0.5 flex gap-0.5 items-center justify-center"
          >
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
              className="lucide lucide-arrow-down-icon lucide-arrow-down"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <Move size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="Tọa độ X, VD: 100"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
          <input
            type="text"
            placeholder="Tọa độ Y, VD: 100"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
        </div>
      </div>
      <div className="NAME-form-group NAME-form-position col-span-2 lg:col-span-3 flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <button
          onClick={handleClickCheck}
          className="group flex items-center justify-center font-bold w-full gap-1 text-white active:bg-white active:text-green-600 rounded p-1"
        >
          <span>OK</span>
          <Check size={20} className="text-white group-active:text-green-600" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
