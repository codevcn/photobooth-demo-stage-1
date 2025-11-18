import { useCallback, useEffect, useRef, useState } from 'react'
import { TPrintAreaInfo } from '@/utils/types/global'

type TPrintAreaBounds = {
  x: number
  y: number
  width: number
  height: number
}

type TUsePrintAreaReturn = {
  printAreaRef: React.RefObject<HTMLDivElement>
  overlayRef: React.RefObject<HTMLDivElement>
  containerElementRef: React.MutableRefObject<HTMLElement | null>
  isOutOfBounds: boolean
  printAreaBounds: TPrintAreaBounds | null
  checkElementBounds: (
    elementRect: DOMRect | { left: number; top: number; right: number; bottom: number }
  ) => boolean
  initializePrintArea: (
    productPrintArea: TPrintAreaInfo['area'],
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
  const containerElementRef = useRef<HTMLElement | null>(null)

  const calculatePrintAreaFromContainer = useCallback(
    (productPrintArea: TPrintAreaInfo['area'], containerElement: HTMLElement) => {
      if (
        typeof productPrintArea.printX === 'number' &&
        typeof productPrintArea.printY === 'number' &&
        typeof productPrintArea.printW === 'number' &&
        typeof productPrintArea.printH === 'number'
      ) {
        // Tìm ảnh sản phẩm
        const imageElement = containerElement.querySelector(
          '.NAME-product-image'
        ) as HTMLImageElement
        if (!imageElement) {
          setPrintAreaBounds(null)
          containerSizeRef.current = null
          return null
        }

        // Kích thước container
        const containerWidth = containerElement.offsetWidth
        const containerHeight = containerElement.offsetHeight

        // Kích thước gốc của ảnh
        const naturalWidth = imageElement.naturalWidth
        const naturalHeight = imageElement.naturalHeight

        if (naturalWidth === 0 || naturalHeight === 0) {
          // Ảnh chưa load xong
          setPrintAreaBounds(null)
          containerSizeRef.current = null
          return null
        }

        // Tính toán kích thước thực tế của ảnh sau khi object-contain
        const containerRatio = containerWidth / containerHeight
        const imageRatio = naturalWidth / naturalHeight

        let actualImageWidth: number
        let actualImageHeight: number
        let offsetX = 0
        let offsetY = 0

        if (imageRatio > containerRatio) {
          // Ảnh rộng hơn - width = containerWidth, height tính theo tỷ lệ
          actualImageWidth = containerWidth
          actualImageHeight = containerWidth / imageRatio
          offsetY = (containerHeight - actualImageHeight) / 2
        } else {
          // Ảnh cao hơn - height = containerHeight, width tính theo tỷ lệ
          actualImageHeight = containerHeight
          actualImageWidth = containerHeight * imageRatio
          offsetX = (containerWidth - actualImageWidth) / 2
        }

        // Lưu lại kích thước container
        containerSizeRef.current = { width: containerWidth, height: containerHeight }

        // Tính toán scale factor từ ảnh gốc (real size) sang ảnh hiển thị (displayed size)
        // API cung cấp print area coordinates dựa trên kích thước ảnh gốc (width_real_px × height_real_px)
        // Ta cần convert sang pixel trên màn hình dựa trên actualImageWidth × actualImageHeight
        const baseWidth = naturalWidth
        const baseHeight = naturalHeight

        // Scale factor = (kích thước hiển thị) / (kích thước gốc)
        const scaleX = actualImageWidth / baseWidth
        const scaleY = actualImageHeight / baseHeight

        // Convert từ pixel coordinates (dựa trên ảnh gốc) sang pixel trên màn hình
        // x_displayed = offsetX + (x_original * scale)
        const x = offsetX + productPrintArea.printX * scaleX
        const y = offsetY + productPrintArea.printY * scaleY
        const width = productPrintArea.printW * scaleX
        const height = productPrintArea.printH * scaleY

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
    const editContainer = containerElementRef.current

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
      const editableElements = document.body.querySelectorAll('.NAME-root-element')
      // Nếu không có element nào thì không out of bounds
      if (editableElements.length === 0) {
        updateOverlayVisibility(false)
        return
      }

      let hasOutOfBounds = false
      const editContainer = containerElementRef.current
      if (editContainer) {
        for (const element of editableElements) {
          const rect = element.getBoundingClientRect()

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
            break // Thoát sớm khi tìm thấy element ngoài bounds
          }
        }
      }
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
    containerElementRef,
    isOutOfBounds,
    printAreaBounds,
    checkElementBounds,
    initializePrintArea: calculatePrintAreaFromContainer,
    checkIfAnyElementOutOfBounds,
  }
}
