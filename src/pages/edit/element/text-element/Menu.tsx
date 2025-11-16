import useGoogleFont from '@/hooks/use-load-font'
import { useGlobalContext } from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import { TElementType, TTextVisualState } from '@/utils/types/global'
import {
  RefreshCw,
  Move,
  Check,
  ALargeSmall,
  Palette,
  TypeOutline,
  X,
  Pencil,
  Layers2,
  // ChevronUp,
  // ChevronDown,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { createPortal } from 'react-dom'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { getInitialContants } from '@/utils/contants'

type TPropertyType = 'font-size' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

interface ColorPickerModalProps {
  show: boolean
  onHideShow: (show: boolean) => void
  onColorChange: (color: string) => void
}

const ColorPickerModal = ({ show, onHideShow, onColorChange }: ColorPickerModalProps) => {
  const [currentColor, setCurrentColor] = useState<string>('#fe6e87')
  const inputText = useRef<string>('Text để kiểm tra màu chữ')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Hàm convert tên màu CSS sang hex
  const convertColorToHex = (color: string): string => {
    // Tạo element tạm để browser convert màu
    const tempElement = document.createElement('div')
    tempElement.style.color = color
    document.body.appendChild(tempElement)

    const computedColor = window.getComputedStyle(tempElement).color
    document.body.removeChild(tempElement)

    // Convert rgb/rgba sang hex
    const match = computedColor.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0]).toString(16).padStart(2, '0')
      const g = parseInt(match[1]).toString(16).padStart(2, '0')
      const b = parseInt(match[2]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }

    return color
  }

  const handleColorPickerChange = (color: string) => {
    setCurrentColor(color)
    onColorChange(color)
    if (inputRef.current) {
      inputRef.current.value = color
    }
  }

  const validateColorValue = (value: string): boolean => {
    const isValidHex = /^#[0-9A-F]{6}$/i.test(value)
    const isValidShortHex = /^#[0-9A-F]{3}$/i.test(value)
    const isNamedColor = /^[a-z]+$/i.test(value)
    return isValidHex || isValidShortHex || isNamedColor
  }

  const handleInputChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (validateColorValue(value)) {
      // Convert sang hex để HexColorPicker hiểu được
      const hexColor = convertColorToHex(value)
      setCurrentColor(hexColor)
      onColorChange(value) // Gửi giá trị gốc (có thể là tên màu)
    }
  }, 300)

  useEffect(() => {
    const inputElement = inputRef.current
    if (inputElement) {
      inputElement.value = currentColor
    }
  }, [currentColor])

  if (!show) return null

  return (
    <div className="NAME-color-picker-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full mx-4 shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Chọn màu chữ</h3>
          <button
            onClick={() => onHideShow(false)}
            className="text-gray-800 active:scale-90 w-8 h-8 flex items-center justify-center rounded-full transition"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex justify-center mb-4">
          <HexColorPicker
            style={{ width: '100%' }}
            color={currentColor}
            onChange={handleColorPickerChange}
          />
        </div>

        {/* Current Color Display */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Xem trước màu chữ:
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-300 p-2 text-center">
              <p className="text-3xl font-bold" style={{ color: currentColor }}>
                {inputText.current}
              </p>
            </div>
          </div>
        </div>

        {/* Input Color */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập mã màu:</label>
          <input
            type="text"
            ref={inputRef}
            onChange={handleInputChange}
            placeholder="Nhập tên màu (red / pink / ...) hoặc mã màu hex (#fe6e87)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => onHideShow(false)}
            className="bg-pink-cl hover:opacity-90 active:scale-95 text-white font-semibold px-6 py-2 rounded-lg transition-all w-full"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  )
}

// Danh sách các font có sẵn từ fonts.css
const localFonts = [
  'Amatic SC',
  'Bitcount',
  'Bungee Outline',
  'Bungee Spice',
  'Creepster',
  'Emilys Candy',
  'Honk',
  'Jersey 25 Charted',
  'Nosifer',
]

interface TextFontPickerProps {
  show: boolean
  onHideShow: (show: boolean) => void
  onSelectFont: (fontFamily: string) => void
}

const TextFontPicker = ({ show, onHideShow, onSelectFont }: TextFontPickerProps) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { loadFont } = useGoogleFont()
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [loadedGoogleFonts, setLoadedGoogleFonts] = useState<string[]>([])

  const searchFont = (keyword: string) => {
    if (!keyword) return
    if (!loadedGoogleFonts.includes(keyword)) {
      loadFont(keyword, undefined, () => {
        setLoadedGoogleFonts((prev) => [...prev, keyword])
      })
    }
  }

  const onSearchFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value)
      searchFont(value.trim())
    }, 300)
  }

  const handleSelectFont = (fontFamily: string) => {
    onSelectFont(fontFamily)
    onHideShow(false)
  }

  const filteredFonts = useMemo(
    () => localFonts.filter((font) => font.toLowerCase().includes(searchKeyword.toLowerCase())),
    [localFonts, searchKeyword]
  )

  const filteredGoogleFonts = useMemo(
    () =>
      loadedGoogleFonts.filter((font) => font.toLowerCase().includes(searchKeyword.toLowerCase())),
    [loadedGoogleFonts, searchKeyword]
  )

  if (!show) return null

  return (
    <div className="NAME-text-font-picker fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-pink-100 rounded-lg p-4 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header với input search và nút đóng */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            onChange={onSearchFont}
            placeholder="Tìm font chữ..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-pink-500"
          />
          <button
            onClick={() => onHideShow(false)}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-gray-800 mb-2">Các font chữ có sẵn</h3>
          <hr className="border-gray-400" />
        </div>

        {/* Danh sách font */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {/* Google Fonts được load */}
          {filteredGoogleFonts.map((fontFamily) => (
            <div
              key={`google-${fontFamily}`}
              onClick={() => handleSelectFont(fontFamily)}
              className="cursor-pointer hover:bg-pink-200 p-3 rounded-lg transition-colors"
            >
              <div className="text-sm text-gray-600 mb-1">{fontFamily}</div>
              <div className="text-xl text-black" style={{ fontFamily }}>
                Hello I am a new font!!!
              </div>
            </div>
          ))}

          {filteredFonts.map((fontFamily) => (
            <div
              key={fontFamily}
              onClick={() => handleSelectFont(fontFamily)}
              className="cursor-pointer hover:bg-pink-200 p-3 rounded-lg transition-colors"
            >
              <div className="text-sm text-gray-600 mb-1">{fontFamily}</div>
              <div className="text-xl text-black" style={{ fontFamily }}>
                Hello I am a new font!!!
              </div>
            </div>
          ))}

          {filteredFonts.length === 0 && filteredGoogleFonts.length === 0 && searchKeyword && (
            <div className="text-center py-8 text-gray-500">Không tìm thấy font nào</div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PrintedImageMenuProps {
  elementId: string
}

export const TextElementMenu = ({ elementId }: PrintedImageMenuProps) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [showTextFontPicker, setShowTextFontPicker] = useState<boolean>(false)
  const { pickedElementRoot } = useGlobalContext()
  const menuRef = useRef<HTMLDivElement | null>(null)

  const validateInputsPositiveNumber = (
    inputs: (HTMLInputElement | HTMLTextAreaElement)[],
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
    fontSize?: number,
    angle?: number,
    posX?: number,
    posY?: number,
    zindex?: number,
    color?: string,
    content?: string,
    fontFamily?: string
  ) => {
    eventEmitter.emit(
      EInternalEvents.SUBMIT_TEXT_ELE_PROPS,
      elementId,
      fontSize,
      angle,
      posX,
      posY,
      zindex,
      color,
      content,
      fontFamily
    )
  }

  const submit = (inputs: (HTMLInputElement | HTMLTextAreaElement)[], type: TPropertyType) => {
    const values = validateInputsPositiveNumber(inputs, type)
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

  const catchEnter = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: TPropertyType
  ) => {
    if (e.key === 'Enter') {
      const formGroup = e.currentTarget.closest<HTMLElement>('.NAME-form-group')
      const inputs = formGroup?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input,textarea'
      )
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

  const listenClickOnPage = (target: HTMLElement | null) => {
    if (showColorPicker && target) {
      if (!target.closest('.NAME-color-picker')) {
        setShowColorPicker(false)
      }
      if (!target.closest('.NAME-text-font-picker')) {
        setShowTextFontPicker(false)
      }
    }
  }

  const handleAdjustColorOnElement = (color: string) => {
    if (color) {
      handleChangeProperties(undefined, undefined, undefined, undefined, undefined, color)
    }
  }

  const initContentField = () => {
    const textElement = pickedElementRoot?.querySelector<HTMLElement>(
      '.NAME-displayed-text-content'
    )
    if (textElement) {
      const contentInput = menuRef.current?.querySelector<HTMLTextAreaElement>(
        '.NAME-form-content textarea'
      )
      if (contentInput) {
        contentInput.value = textElement.textContent
      }
    }
  }

  const onContentFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChangeProperties(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      e.target.value || undefined
    )
  }

  const handleSelectFont = (fontFamily: string) => {
    handleChangeProperties(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      fontFamily
    )
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

  const listenElementProps = (idOfElement: string | null, type: TElementType) => {
    if (type !== 'text' || elementId !== idOfElement) return
    const dataset = JSON.parse(pickedElementRoot?.getAttribute('data-visual-state') || '{}')
    const { fontSize, angle, position } = dataset as TTextVisualState
    const { x: posX, y: posY } = position || {}
    const menuSection = menuRef.current
    if (fontSize) {
      const fontSizeInput = menuSection?.querySelector<HTMLInputElement>(
        '.NAME-form-fontSize input'
      )
      if (fontSizeInput) fontSizeInput.value = fontSize.toFixed(0)
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
    listenElementProps(elementId, 'text')
  }, [elementId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPage)
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    initContentField()
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPage)
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <div ref={menuRef} className="NAME-menu-section grid grid-cols-2 gap-x-1 gap-y-1">
      <div className="NAME-form-group NAME-form-content col-span-2 flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <Pencil size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1 w-full">
          <textarea
            placeholder="Nhập nội dung..."
            onKeyDown={(e) => catchEnter(e, 'font-size')}
            onChange={onContentFieldChange}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
            rows={1}
          ></textarea>
        </div>
      </div>
      <div className="NAME-form-group NAME-form-fontSize flex items-center bg-pink-cl rounded px-1 py-0.5 shadow w-full">
        <div className="min-w-[22px]">
          <ALargeSmall size={20} className="text-white" strokeWidth={3} />
        </div>
        <div className="flex gap-1 mx-1 grow">
          <input
            type="text"
            placeholder="Cỡ chữ, VD: 18"
            onKeyDown={(e) => catchEnter(e, 'font-size')}
            className="border rounded px-1 py-0.5 text-base outline-none w-full"
          />
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
            className="bg-white border-2 grow text-pink-cl border-pink-cl rounded px-1.5 py-1 flex gap-0.5 items-center justify-center"
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
            className="bg-white border-2 grow text-pink-cl border-pink-cl rounded px-1.5 py-1 flex gap-0.5 items-center justify-center"
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
      <div className="NAME-form-group NAME-form-color flex items-stretch justify-center gap-1 rounded">
        <div
          onClick={() => setShowColorPicker((pre) => !pre)}
          className="flex items-center justify-center cursor-pointer gap-1 active:scale-90 hover:scale-95 transition bg-pink-cl rounded shadow px-1 h-9 w-full"
        >
          <div className="min-w-[22px] text-white font-bold">
            <span>Chọn màu chữ</span>
          </div>
          <div className="flex gap-1 mx-1">
            <div>
              <Palette size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        <ColorPickerModal
          show={showColorPicker}
          onHideShow={setShowColorPicker}
          onColorChange={handleAdjustColorOnElement}
        />
      </div>
      <div className="NAME-form-group NAME-form-font flex items-stretch justify-center gap-1 relative rounded w-full">
        <div
          onClick={() => setShowTextFontPicker((pre) => !pre)}
          className="flex items-center justify-center cursor-pointer gap-1 active:scale-90 hover:scale-95 transition bg-pink-cl rounded shadow px-1 h-9 w-full"
        >
          <div className="min-w-[22px] text-white font-bold">
            <span>Chọn font chữ</span>
          </div>
          <div className="flex gap-1 mx-1">
            <div>
              <TypeOutline size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        {createPortal(
          <TextFontPicker
            show={showTextFontPicker}
            onHideShow={setShowTextFontPicker}
            onSelectFont={handleSelectFont}
          />,
          document.body
        )}
      </div>
      <div className="NAME-form-group NAME-form-position col-span-2 flex items-center bg-pink-cl rounded px-1 h-9 shadow w-full">
        <button
          type="button"
          onClick={handleClickCheck}
          className="group flex items-center justify-center font-bold w-full gap-1 text-white active:bg-white active:text-pink-cl rounded p-1"
        >
          <span>OK</span>
          <Check size={20} className="text-white group-active:text-pink-cl" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
