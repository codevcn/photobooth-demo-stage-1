import { useRef, useCallback, useMemo } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/localstorage'
import { TProductInCart } from '@/utils/types'
import { useDebounce } from './use-debounce'

type TUseOptimizedHtmlToCanvasReturn = {
  editorRef: React.RefObject<HTMLDivElement>
  handleSaveHtmlAsImage: (
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => void
  isProcessing: boolean
}

export const useOptimizedHtmlToCanvas = (): TUseOptimizedHtmlToCanvasReturn => {
  const editorRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)
  const cacheRef = useRef<Map<string, string>>(new Map())

  // Optimized html2canvas options
  const html2canvasOptions = useMemo(() => ({
    backgroundColor: null,
    scale: window.devicePixelRatio || 2, // Responsive scale
    useCORS: true,
    logging: false,
    allowTaint: false,
    foreignObjectRendering: false,
    imageTimeout: 15000,
    removeContainer: true,
    ignoreElements: (element: Element) => {
      // Skip invisible elements
      const style = window.getComputedStyle(element)
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0'
    }
  }), [])

  const generateCacheKey = useCallback((productInfo: TProductInCart, sessionId: string) => {
    return `${sessionId}-${productInfo.id}-${JSON.stringify(productInfo)}`
  }, [])

  const processImageWithWorkerLikeApproach = useCallback(async (
    canvas: HTMLCanvasElement,
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => {
    return new Promise<void>((resolve, reject) => {
      // Tách blob conversion thành chunks nhỏ
      const processInChunks = () => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const cacheKey = generateCacheKey(productInfo, sessionId)
            
            // Cache result
            cacheRef.current.set(cacheKey, url)
            
            // Schedule localStorage save for later
            requestIdleCallback(() => {
              try {
                LocalStorageHelper.saveMockupImageAsBase64(productInfo, url, sessionId)
                onSaved(url)
                resolve()
              } catch (error) {
                reject(error)
              }
            }, { timeout: 2000 })
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png', 0.85) // Slightly lower quality for better performance
      }

      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(processInChunks, { timeout: 3000 })
      } else {
        setTimeout(processInChunks, 0)
      }
    })
  }, [generateCacheKey])

  const handleSaveHtmlAsImage = useCallback((
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => {
    if (isProcessingRef.current) {
      toast.warn('Image processing in progress, please wait...')
      return
    }

    // Check cache first
    const cacheKey = generateCacheKey(productInfo, sessionId)
    const cachedUrl = cacheRef.current.get(cacheKey)
    if (cachedUrl) {
      onSaved(cachedUrl)
      return
    }

    isProcessingRef.current = true

    const processImage = async () => {
      try {
        if (!editorRef.current) {
          throw new Error('Editor ref not available')
        }

        // Pre-process: ensure all images are loaded
        const images = editorRef.current.querySelectorAll('img')
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            setTimeout(reject, 5000) // 5s timeout
          })
        }))

        // Add dynamic dimensions based on actual content
        const rect = editorRef.current.getBoundingClientRect()
        const options = {
          ...html2canvasOptions,
          width: rect.width,
          height: rect.height,
          windowWidth: rect.width,
          windowHeight: rect.height,
        }

        const canvas = await html2canvas(editorRef.current, options)
        await processImageWithWorkerLikeApproach(canvas, productInfo, sessionId, onSaved)
        
      } catch (error) {
        console.error('Error processing image:', error)
        toast.error('Failed to save image. Please try again.')
      } finally {
        isProcessingRef.current = false
      }
    }

    // Use microtask to ensure DOM is ready
    queueMicrotask(() => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(processImage, { timeout: 10000 })
      } else {
        setTimeout(processImage, 16) // ~1 frame delay
      }
    })
  }, [html2canvasOptions, generateCacheKey, processImageWithWorkerLikeApproach])

  // Debounced version for rapid calls
  const debounce = useDebounce()
  const debouncedHandleSave = debounce(handleSaveHtmlAsImage, 300)

  return {
    editorRef,
    handleSaveHtmlAsImage: debouncedHandleSave,
    isProcessing: isProcessingRef.current,
  }
}