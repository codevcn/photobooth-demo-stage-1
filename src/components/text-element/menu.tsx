import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { RefreshCw, Move, Check, ALargeSmall } from 'lucide-react'

type TPropertyType = 'font-size' | 'angle' | 'posXY'

interface PrintedImageMenuProps {
  elementId: string
}

export const TextElementMenu = ({ elementId }: PrintedImageMenuProps) => {
  const validateInputsPositiveNumber = (inputs: HTMLInputElement[]): (number | undefined)[] => {
    const values = inputs.map((input) => input.value.trim())
    const numberRegex = /^\d+(\.\d+)?$/
    const validValues = values.map((value) =>
      numberRegex.test(value) ? parseFloat(value) : undefined
    )
    return validValues.length > 0 ? validValues : []
  }

  const handleChangeProperties = (
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_PRINTED_IMAGE_ELE_PROPS,
      elementId,
      fontSize,
      angle,
      posX,
      posY
    )
  }

  const submit = (inputs: HTMLInputElement[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs)
    if (values && values.length > 0) {
      switch (type) {
        case 'font-size':
          handleChangeProperties(values[0])
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

  const handleClickCheck = (e: React.MouseEvent<HTMLButtonElement>) => {
    const menuSection = e.currentTarget.closest<HTMLElement>('.NAME-menu-section')
    const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-fontSize input')
    const angleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-angle input')
    const posXYInputs = menuSection?.querySelectorAll<HTMLInputElement>('.NAME-form-position input')
    handleChangeProperties(
      scaleInput?.value ? parseFloat(scaleInput.value) : undefined,
      angleInput?.value ? parseFloat(angleInput.value) : undefined,
      posXYInputs && posXYInputs[0]?.value ? parseFloat(posXYInputs[0].value) : undefined,
      posXYInputs && posXYInputs[1]?.value ? parseFloat(posXYInputs[1].value) : undefined
    )
  }

  return (
    <div className="NAME-menu-section grid grid-cols-2 gap-1">
      <div className="NAME-form-group NAME-form-fontSize flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-full">
        <div className="min-w-[22px]">
          <ALargeSmall size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="Cỡ chữ, VD: 18"
            onKeyDown={(e) => catchEnter(e, 'font-size')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
        </div>
      </div>
      <div className="NAME-form-group NAME-form-angle flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-full">
        <div className="min-w-[22px]">
          <RefreshCw size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="Xoay, VD: 22"
            onKeyDown={(e) => catchEnter(e, 'angle')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
        </div>
      </div>
      <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-1 shadow w-full">
        <div className="min-w-[22px]">
          <Move size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1">
          <input
            type="text"
            placeholder="Tọa độ X"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
          <input
            type="text"
            placeholder="Tọa độ Y"
            onKeyDown={(e) => catchEnter(e, 'posXY')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
        </div>
      </div>
      <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-1 shadow w-full">
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
