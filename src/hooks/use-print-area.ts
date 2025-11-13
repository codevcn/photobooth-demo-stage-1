import { useCallback, useEffect, useRef, useState } from 'react'
import { TProductImage } from '@/utils/types/global'

type TPrintAreaBounds = {
  x: number
  y: number
  width: number
  height: number
}

type TUsePrintAreaReturn = {
  printAreaRef: React.RefObject<HTMLDivElement>
  overlayRef: React.RefObject<HTMLDivElement>
  isOutOfBounds: boolean
  printAreaBounds: TPrintAreaBounds | null
  checkElementBounds: (
    elementRect: DOMRect | { left: number; top: number; right: number; bottom: number }
  ) => boolean
  updatePrintArea: (productPrintArea: TProductImage['printArea'], containerRect: DOMRect) => void
  initializePrintArea: (
    productPrintArea: TProductImage['printArea'],
    containerElement: HTMLElement
  ) => TPrintAreaBounds | null
  checkIfAnyElementOutOfBounds: () => boolean
}

export const usePrintArea = (): TUsePrintAreaReturn => {
  const printAreaRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)
  const [printAreaBounds, setPrintAreaBounds] = useState<TPrintAreaBounds | null>(null)
  const containerSizeRef = useRef<{ width: number; height: number } | null>(null)

  const calculatePrintAreaFromContainer = useCallback(
    (productPrintArea: TProductImage['printArea'], containerElement: HTMLElement) => {
      if (
        typeof productPrintArea.print_x === 'number' &&
        typeof productPrintArea.print_y === 'number' &&
        typeof productPrintArea.print_w === 'number' &&
        typeof productPrintArea.print_h === 'number'
      ) {
        // Sử dụng offsetWidth/offsetHeight thay vì getBoundingClientRect để tránh layout shift
        const containerWidth = containerElement.offsetWidth
        const containerHeight = containerElement.offsetHeight

        // Lưu lại kích thước container
        containerSizeRef.current = { width: containerWidth, height: containerHeight }

        // Chuyển đổi từ phần trăm sang pixel
        const x = (productPrintArea.print_x / 100) * containerWidth
        const y = (productPrintArea.print_y / 100) * containerHeight
        const width = (productPrintArea.print_w / 100) * containerWidth
        const height = (productPrintArea.print_h / 100) * containerHeight

        const newBounds = { x, y, width, height }
        setPrintAreaBounds(newBounds)

        // Cập nhật CSS cho print area
        if (printAreaRef.current) {
          printAreaRef.current.style.left = `${x}px`
          printAreaRef.current.style.top = `${y}px`
          printAreaRef.current.style.width = `${width}px`
          printAreaRef.current.style.height = `${height}px`
        }

        return newBounds
      } else {
        setPrintAreaBounds(null)
        containerSizeRef.current = null
        return null
      }
    },
    []
  )

  const updatePrintArea = useCallback(
    (productPrintArea: TProductImage['printArea'], containerRect: DOMRect) => {
      // Chỉ update nếu kích thước container thực sự thay đổi
      if (
        !containerSizeRef.current ||
        Math.abs(containerSizeRef.current.width - containerRect.width) > 5 ||
        Math.abs(containerSizeRef.current.height - containerRect.height) > 5
      ) {
        // Tìm container element để sử dụng offset thay vì rect
        const containerElement = document.querySelector(
          '[data-edit-container="true"]'
        ) as HTMLElement
        if (containerElement) {
          calculatePrintAreaFromContainer(productPrintArea, containerElement)
        }
      }
    },
    [calculatePrintAreaFromContainer]
  )

  const checkElementBounds = useCallback(
    (
      elementRect: DOMRect | { left: number; top: number; right: number; bottom: number }
    ): boolean => {
      if (!printAreaBounds) return true

      // Kiểm tra xem element có nằm hoàn toàn trong vùng in không
      const isInBounds =
        elementRect.left >= printAreaBounds.x &&
        elementRect.top >= printAreaBounds.y &&
        elementRect.right <= printAreaBounds.x + printAreaBounds.width &&
        elementRect.bottom <= printAreaBounds.y + printAreaBounds.height

      return isInBounds
    },
    [printAreaBounds]
  )

  const updateOverlayVisibility = useCallback((outOfBounds: boolean) => {
    setIsOutOfBounds(outOfBounds)
    if (overlayRef.current) {
      overlayRef.current.style.opacity = outOfBounds ? '1' : '0'
      overlayRef.current.style.pointerEvents = outOfBounds ? 'auto' : 'none'
    }
  }, [])

  // Hàm kiểm tra xem có element nào đang nằm ngoài vùng in không
  const checkIfAnyElementOutOfBounds = useCallback((): boolean => {
    if (!printAreaBounds) return false

    const editableElements = document.querySelectorAll('.NAME-root-element')
    const editContainer = document.querySelector('[data-edit-container="true"]')

    if (!editContainer) return false

    const containerRect = editContainer.getBoundingClientRect()

    for (const element of editableElements) {
      const rect = element.getBoundingClientRect()

      // Chuyển đổi tọa độ element về tọa độ tương đối với container
      const relativeRect = {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top,
      }

      if (!checkElementBounds(relativeRect as DOMRect)) {
        return true // Có ít nhất 1 element nằm ngoài vùng in
      }
    }

    return false // Tất cả elements đều nằm trong vùng in
  }, [printAreaBounds, checkElementBounds])

  // Đơn giản hóa observer - chỉ check khi cần thiết
  useEffect(() => {
    if (!printAreaBounds) return

    let checkTimeout: NodeJS.Timeout

    const checkBounds = () => {
      const editableElements = document.querySelectorAll('.NAME-root-element')
      let hasOutOfBounds = false

      editableElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const editContainer = document.querySelector('[data-edit-container="true"]')

        if (editContainer) {
          const containerRect = editContainer.getBoundingClientRect()

          // Chuyển đổi tọa độ element về tọa độ tương đối với container
          const relativeRect = {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            right: rect.right - containerRect.left,
            bottom: rect.bottom - containerRect.top,
          }

          if (!checkElementBounds(relativeRect as DOMRect)) {
            hasOutOfBounds = true
          }
        }
      })

      updateOverlayVisibility(hasOutOfBounds)
    }

    const debouncedCheck = () => {
      clearTimeout(checkTimeout)
      checkTimeout = setTimeout(checkBounds, 50) // Debounce để tránh check quá nhiều
    }

    // Chỉ listen mouse/touch move, không dùng MutationObserver nữa
    document.addEventListener('mousemove', debouncedCheck, { passive: true })
    document.addEventListener('touchmove', debouncedCheck, { passive: true })

    // Check ban đầu
    checkBounds()

    return () => {
      clearTimeout(checkTimeout)
      document.removeEventListener('mousemove', debouncedCheck)
      document.removeEventListener('touchmove', debouncedCheck)
    }
  }, [printAreaBounds, checkElementBounds, updateOverlayVisibility])

  return {
    printAreaRef,
    overlayRef,
    isOutOfBounds,
    printAreaBounds,
    checkElementBounds,
    updatePrintArea,
    initializePrintArea: calculatePrintAreaFromContainer,
    checkIfAnyElementOutOfBounds,
  }
}
