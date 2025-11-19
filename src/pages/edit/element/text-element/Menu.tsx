import { useGlobalContext } from '@/context/global-context'
import { EInternalEvents } from '@/utils/enums'
import { eventEmitter } from '@/utils/events'
import {
  TElementType,
  TFontName,
  TFonts,
  TLoadFontStatus,
  TTextVisualState,
} from '@/utils/types/global'
import {
  RefreshCw,
  Move,
  Check,
  ALargeSmall,
  Palette,
  TypeOutline,
  X,
  Pencil,
  // ChevronUp,
  // ChevronDown,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { createPortal } from 'react-dom'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { getInitialContants } from '@/utils/contants'
import { useFontLoader } from '@/hooks/use-font'

type TPropertyType = 'font-size' | 'angle' | 'posXY' | 'zindex-up' | 'zindex-down'

interface ColorPickerModalProps {
  show: boolean
  onHideShow: (show: boolean) => void
  onColorChange: (color: string) => void
  inputText: string
}

const ColorPickerModal = ({
  show,
  onHideShow,
  onColorChange,
  inputText,
}: ColorPickerModalProps) => {
  const [currentColor, setCurrentColor] = useState<string>('#fe6e87')
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
    <div className="NAME-color-picker-modal fixed inset-0 flex items-center justify-center z-50 animate-pop-in">
      <div onClick={() => onHideShow(false)} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white rounded-lg p-4 w-full mx-4 shadow-2xl max-h-[95vh] overflow-y-auto relative z-20">
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
                {inputText}
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

interface TextFontPickerProps {
  show: boolean
  onHideShow: (show: boolean) => void
  onSelectFont: (fontFamily: string) => void
  localFontNames?: TFontName[]
  loadedStatus: TLoadFontStatus
}

const TextFontPicker = ({
  show,
  onHideShow,
  onSelectFont,
  loadedStatus,
  localFontNames,
}: TextFontPickerProps) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const onSearchFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
  }

  const handleSelectFont = (fontFamily: string) => {
    onSelectFont(fontFamily)
    onHideShow(false)
  }

  const filteredFonts = useMemo(
    () =>
      localFontNames?.filter((font) => font.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      [],
    [localFontNames, searchKeyword]
  )

  const isLoading = loadedStatus === 'loading'

  if (!show) return null

  return (
    <div className="NAME-text-font-picker fixed inset-0 flex items-center justify-center z-50 animate-pop-in">
      <div onClick={() => onHideShow(false)} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-pink-100 rounded-lg p-4 max-w-md w-full mx-4 max-h-[90vh] flex flex-col relative z-20">
        {/* Header với input search và nút đóng */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            onChange={onSearchFont}
            placeholder="Tìm font chữ..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-pink-500"
            disabled={isLoading}
          />
          <button
            onClick={() => onHideShow(false)}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="overflow-y-auto grow">
          {/* Tiêu đề */}
          <div className="text-center mb-2">
            <h3 className="text-base font-bold text-gray-800 mb-2">Top 10 font chữ ưa thích</h3>
            <hr className="border-gray-400" />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
              <p className="text-gray-600 font-medium">Đang tải fonts...</p>
            </div>
          )}

          {/* Danh sách font */}
          {!isLoading && (
            <div className="flex-1 space-y-3">
              {filteredFonts.map((fontFamily) => (
                <div
                  key={fontFamily}
                  onClick={() => handleSelectFont(fontFamily)}
                  className="cursor-pointer hover:bg-pink-200 p-3 rounded-lg transition-colors"
                >
                  <div className="text-sm text-gray-600 mb-1">{fontFamily}</div>
                  <div className="text-xl text-black" style={{ fontFamily }}>
                    Xin chào đây là font <span>{fontFamily}</span>
                  </div>
                </div>
              ))}

              {filteredFonts.length === 0 && searchKeyword && (
                <div className="text-center py-8 text-gray-500">Không tìm thấy font nào</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PrintedImageMenuProps {
  elementId: string
  onClose: () => void
}

export const TextElementMenu = ({ elementId, onClose }: PrintedImageMenuProps) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const [showTextFontPicker, setShowTextFontPicker] = useState<boolean>(false)
  const { pickedElementRoot } = useGlobalContext()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [inputText, setInputText] = useState<string>()
  const [localFontNames, fonts] = useMemo<[TFontName[], TFonts]>(() => {
    const fonts: TFonts = {
      'Be Vietnam Pro': { loadFontURL: '/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf' },
      'Cormorant Garamond': {
        loadFontURL: '/fonts/Cormorant_Garamond/static/CormorantGaramond-Regular.ttf',
      },
      'Dancing Script': { loadFontURL: '/fonts/Dancing_Script/static/DancingScript-Regular.ttf' },
      Lora: { loadFontURL: '/fonts/Lora/static/Lora-Regular.ttf' },
      Montserrat: { loadFontURL: '/fonts/Montserrat/static/Montserrat-Regular.ttf' },
      Phudu: { loadFontURL: '/fonts/Phudu/static/Phudu-Regular.ttf' },
      'Playfair Display': {
        loadFontURL: '/fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf',
      },
      Roboto: { loadFontURL: '/fonts/Roboto/static/Roboto-Regular.ttf' },
      'Saira Stencil One': {
        loadFontURL: '/fonts/Saira_Stencil_One/SairaStencilOne-Regular.ttf',
      },
      'Amatic SC': { loadFontURL: '/fonts/Amatic_SC/AmaticSC-Regular.ttf' },
      Bitcount: { loadFontURL: '/fonts/Bitcount/static/Bitcount-Regular.ttf' },
      'Bungee Outline': { loadFontURL: '/fonts/Bungee_Outline/BungeeOutline-Regular.ttf' },
      'Bungee Spice': { loadFontURL: '/fonts/Bungee_Spice/BungeeSpice-Regular.ttf' },
      Creepster: { loadFontURL: '/fonts/Creepster/Creepster-Regular.ttf' },
      'Emilys Candy': { loadFontURL: '/fonts/Emilys_Candy/EmilysCandy-Regular.ttf' },
      Honk: { loadFontURL: '/fonts/Honk/Honk-Regular-VariableFont_MORF,SHLN.ttf' },
      'Jersey 25 Charted': {
        loadFontURL: '/fonts/Jersey_25_Charted/Jersey25Charted-Regular.ttf',
      },
      Nosifer: { loadFontURL: '/fonts/Nosifer/Nosifer-Regular.ttf' },
    }
    return [Object.keys(fonts), fonts]
  }, [])
  const { loadAllAvailableFonts, status } = useFontLoader(fonts)

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
    onClose()
  }

  const listenClickOnPage = (target: HTMLElement | null) => {
    if (showColorPicker && target) {
      if (!target.closest('.NAME-color-picker-modal')) {
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
      setInputText(textElement.textContent)
    }
  }

  const onContentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const textElement = pickedElementRoot?.querySelector<HTMLElement>(
      '.NAME-displayed-text-content'
    )
    if (textElement) {
      const contentInput = menuRef.current?.querySelector<HTMLInputElement>(
        '.NAME-form-content input'
      )
      if (contentInput) {
        contentInput.value = textElement.textContent
      }
    }
  }, [inputText])

  useEffect(() => {
    listenElementProps(elementId, 'text')
  }, [elementId])

  useEffect(() => {
    eventEmitter.on(EInternalEvents.CLICK_ON_PAGE, listenClickOnPage)
    eventEmitter.on(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    initContentField()
    loadAllAvailableFonts()
    return () => {
      eventEmitter.off(EInternalEvents.CLICK_ON_PAGE, listenClickOnPage)
      eventEmitter.off(EInternalEvents.SYNC_ELEMENT_PROPS, listenElementProps)
    }
  }, [])

  return (
    <>
      <div className="absolute top-1/2 -translate-y-1/2 left-1 flex items-center z-30">
        <button
          onClick={onClose}
          className="group flex flex-nowrap items-center justify-center shadow-md outline-2 outline-white outline font-bold bg-pink-cl gap-1 text-white active:scale-90 transition rounded p-1"
        >
          <X size={20} className="text-white" strokeWidth={3} />
        </button>
      </div>

      <div
        ref={menuRef}
        className="NAME-menu-section STYLE-hide-scrollbar relative px-[40px] overflow-x-auto max-w-full flex flex-nowrap items-stretch justify-start md:justify-center gap-y-1 gap-x-1 py-1 rounded-md border border-gray-400/30 border-solid"
      >
        <div className="NAME-form-group NAME-form-content col-span-2 flex items-center bg-pink-cl rounded px-1 py-0.5 shadow">
          <div className="min-w-[22px]">
            <Pencil size={20} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex gap-1 ml-1">
            <input
              placeholder="Nhập nội dung..."
              onKeyDown={(e) => catchEnter(e, 'font-size')}
              onChange={onContentFieldChange}
              className="border rounded px-1 py-0.5 text-base outline-none w-[40px]"
            />
          </div>
        </div>
        <div className="NAME-form-group NAME-form-fontSize flex items-center bg-pink-cl rounded px-1 py-0.5 shadow">
          <div className="min-w-[22px]">
            <ALargeSmall size={20} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex gap-1 ml-1 grow">
            <input
              type="text"
              placeholder="Cỡ chữ, VD: 18"
              onKeyDown={(e) => catchEnter(e, 'font-size')}
              className="border rounded px-1 py-0.5 text-base outline-none w-[40px]"
            />
          </div>
        </div>
        <div className="NAME-form-group NAME-form-angle flex items-center bg-pink-cl rounded px-1 py-0.5 shadow">
          <div className="min-w-[22px]">
            <RefreshCw size={20} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex gap-1 items-center ml-1 grow">
            <input
              type="text"
              placeholder="Độ xoay, VD: 22"
              onKeyDown={(e) => catchEnter(e, 'angle')}
              className="border rounded px-1 py-0.5 text-base outline-none w-[40px]"
            />
            <span className="text-white text-base font-bold">độ</span>
          </div>
        </div>
        <div className="NAME-form-group NAME-form-position flex items-center bg-pink-cl rounded px-1 py-0.5 shadow">
          <div className="min-w-[22px]">
            <Move size={20} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex ml-1 gap-1">
            <input
              type="text"
              placeholder="X, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
              className="border rounded px-1 py-0.5 text-base outline-none w-[40px]"
            />
            <input
              type="text"
              placeholder="Y, VD: 100"
              onKeyDown={(e) => catchEnter(e, 'posXY')}
              className="border rounded px-1 py-0.5 text-base outline-none w-[40px]"
            />
          </div>
        </div>
        <div className="NAME-form-group NAME-form-color flex items-stretch justify-center gap-1 rounded">
          <div
            onClick={() => setShowColorPicker((pre) => !pre)}
            className="flex items-center justify-center cursor-pointer gap-1 active:scale-90 transition bg-pink-cl rounded shadow px-1 h-9"
          >
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
            inputText={inputText || ''}
          />
        </div>
        <div className="NAME-form-group NAME-form-font flex items-stretch justify-center gap-1 relative rounded">
          <div
            onClick={() => setShowTextFontPicker((pre) => !pre)}
            className="flex items-center justify-center cursor-pointer gap-1 active:scale-90 transition bg-pink-cl rounded shadow px-1 h-9"
          >
            <div className="flex gap-1 mx-1">
              <div>
                <TypeOutline size={20} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
          <TextFontPicker
            show={showTextFontPicker}
            onHideShow={setShowTextFontPicker}
            onSelectFont={handleSelectFont}
            loadedStatus={status}
            localFontNames={localFontNames}
          />
        </div>
      </div>

      <div className="z-20 absolute top-1/2 -translate-y-1/2 right-1 flex items-center">
        <button
          onClick={handleClickCheck}
          className="group flex flex-nowrap items-center justify-center shadow-md outline-2 outline-white outline font-bold bg-pink-cl gap-1 text-white active:scale-90 transition rounded p-1"
        >
          <Check size={20} className="text-white" strokeWidth={3} />
        </button>
      </div>
    </>
  )
}
