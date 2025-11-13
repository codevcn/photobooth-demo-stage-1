import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UILayoutManager } from '@/utils/layout'
import { cn } from '@/lib/utils'

type TDropdownOption<T = string> = {
  label: string
  value: T
  icon?: React.ReactNode
}

type TDropdownMenuProps<T = string> = {
  options: TDropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  placeholder?: string
  classNames?: {
    container?: string
  }
  disabled?: boolean
}

export const DropdownMenu = <T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  classNames,
  disabled = false,
}: TDropdownMenuProps<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionsBoardRef = useRef<HTMLDivElement>(null)

  // Memoize selected option
  const selectedOption = useMemo(() => options.find((opt) => opt.value === value), [options, value])

  // Memoize handlers
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }, [disabled])

  const handleSelect = useCallback(
    (optionValue: T) => {
      onChange(optionValue)
      setIsOpen(false)
    },
    [onChange]
  )

  // Optimize collision detection
  useEffect(() => {
    if (isOpen && optionsBoardRef.current) {
      // Use requestAnimationFrame instead of setTimeout
      const rafId = requestAnimationFrame(() => {
        if (optionsBoardRef.current) {
          UILayoutManager.handleDropdownCollision(optionsBoardRef.current, 10)
        }
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [isOpen])

  // Click outside handler remains the same
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={cn('relative', classNames?.container)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
          flex items-center justify-between gap-2
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-pink-cl cursor-pointer'}
          ${isOpen ? '  outline-pink-cl outline-2 outline' : ''}
        `}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-chevron-down-icon lucide-chevron-down text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={optionsBoardRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{ minWidth: '150px' }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2 text-left text-sm
                flex items-center gap-2
                transition-colors duration-150
                ${
                  option.value === value
                    ? 'bg-pink-cl text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
