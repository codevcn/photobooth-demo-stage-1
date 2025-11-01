import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { Check, Fullscreen } from 'lucide-react'

type TPropertyType = 'scale' | 'angle' | 'posXY'

interface Sticker {
  elementId: string
}

export const ProductImageElementMenu = ({ elementId }: Sticker) => {
  const validateInputsPositiveNumber = (
    inputs: HTMLInputElement[],
    type: TPropertyType
  ): (number | undefined)[] => {
    const values = inputs.map((input) => input.value.trim())
    // Allow negative numbers if type is 'angle'
    const numberRegex = type === 'angle' ? /^-?\d+(\.\d+)?$/ : /^\d+(\.\d+)?$/
    const validValues = values.map((value) =>
      numberRegex.test(value) ? parseFloat(value) : undefined
    )
    return validValues.length > 0 ? validValues : []
  }

  const handleChangeProperties = (scale?: number) => {
    eventEmitter.emit(EInternalEvents.SUBMIT_PRODUCT_IMAGE_ELE_PROPS, elementId, scale)
  }

  const submit = (inputs: HTMLInputElement[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs, type)
    if (values && values.length > 0) {
      switch (type) {
        case 'scale':
          handleChangeProperties(values[0] ? values[0] / 100 : undefined)
          break
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
    const scaleInput = menuSection?.querySelector<HTMLInputElement>('.NAME-form-scale input')
    handleChangeProperties(scaleInput?.value ? parseFloat(scaleInput.value) / 100 : undefined)
  }

  return (
    <div className="NAME-menu-section grid grid-cols-1 gap-1">
      <div className="NAME-form-group NAME-form-scale flex items-center bg-pink-cl rounded px-1 py-1 shadow mb-1 w-full">
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
      <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-1 shadow w-full col-span-2">
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
