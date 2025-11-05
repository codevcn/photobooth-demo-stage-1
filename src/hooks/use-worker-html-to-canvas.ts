import { useRef, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/localstorage'
import { TProductInCart } from '@/utils/types'

type TUseWorkerHtmlToCanvasReturn = {
  editorRef: React.RefObject<HTMLDivElement>
  handleSaveHtmlAsImage: (
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => void
  isProcessing: boolean
}

export const useWorkerHtmlToCanvas = (): TUseWorkerHtmlToCanvasReturn => {
  const editorRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const isProcessingRef = useRef(false)
  const pendingCallbacksRef = useRef<Map<string, Function>>(new Map())

  // Initialize worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker('/image-processor-worker.js')
        
        workerRef.current.onmessage = (event) => {
          const { type, data } = event.data
          
          switch (type) {
            case 'IMAGE_COMPRESSED':
              if (data.success) {
                // Convert ArrayBuffer back to Blob
                const blob = new Blob([data.arrayBuffer], { type: 'image/jpeg' })
                const url = URL.createObjectURL(blob)
                
                // Find and execute pending callback
                const callbackId = 'current' // In real app, use proper ID management
                const callback = pendingCallbacksRef.current.get(callbackId)
                if (callback) {
                  callback(url)
                  pendingCallbacksRef.current.delete(callbackId)
                }
                
                console.log(`Image compressed: ${data.originalSize} → ${data.compressedSize} bytes`)
              } else {
                console.error('Worker compression failed:', data.error)
                toast.error('Failed to compress image')
              }
              isProcessingRef.current = false
              break
              
            case 'ERROR':
              console.error('Worker error:', data.error)
              isProcessingRef.current = false
              break
          }
        }
        
        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error)
          isProcessingRef.current = false
        }
        
      } catch (error) {
        console.warn('Worker not supported, falling back to main thread')
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const processWithWorker = useCallback(async (
    canvas: HTMLCanvasElement,
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => {
    if (!workerRef.current) {
      // Fallback to main thread
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          LocalStorageHelper.saveMockupImageAsBase64(productInfo, url, sessionId)
          onSaved(url)
        }
      }, 'image/png', 0.9)
      return
    }

    try {
      // Convert canvas to blob first
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/png')
      })

      // Convert to ArrayBuffer for worker transfer
      const arrayBuffer = await blob.arrayBuffer()
      
      // Store callback
      const callbackId = 'current' // In real app, use crypto.randomUUID()
      pendingCallbacksRef.current.set(callbackId, (url: string) => {
        LocalStorageHelper.saveMockupImageAsBase64(productInfo, url, sessionId)
        onSaved(url)
      })

      // Send to worker for compression
      workerRef.current.postMessage({
        type: 'COMPRESS_IMAGE',
        data: {
          arrayBuffer,
          quality: 0.85 // Good balance between quality and size
        }
      }, [arrayBuffer]) // Transfer ownership

    } catch (error) {
      console.error('Error processing with worker:', error)
      isProcessingRef.current = false
      toast.error('Failed to process image')
    }
  }, [])

  const handleSaveHtmlAsImage = useCallback((
    productInfo: TProductInCart,
    sessionId: string,
    onSaved: (imageUrl: string) => void
  ) => {
    if (isProcessingRef.current) {
      toast.warn('Image processing in progress, please wait...')
      return
    }

    isProcessingRef.current = true

    const processImage = async () => {
      try {
        if (!editorRef.current) {
          throw new Error('Editor ref not available')
        }

        // Optimized html2canvas options
        const options = {
          backgroundColor: null,
          scale: Math.min(window.devicePixelRatio || 2, 2), // Cap at 2x for performance
          useCORS: true,
          logging: false,
          allowTaint: false,
          foreignObjectRendering: false,
          imageTimeout: 10000,
          removeContainer: true,
          ignoreElements: (element: Element) => {
            const style = window.getComputedStyle(element)
            return style.display === 'none' || 
                   style.visibility === 'hidden' || 
                   parseFloat(style.opacity) === 0
          }
        }

        const canvas = await html2canvas(editorRef.current, options)
        await processWithWorker(canvas, productInfo, sessionId, onSaved)
        
      } catch (error) {
        console.error('Error in handleSaveHtmlAsImage:', error)
        toast.error('Failed to save image. Please try again.')
        isProcessingRef.current = false
      }
    }

    // Use proper scheduling
    queueMicrotask(() => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(processImage, { timeout: 8000 })
      } else {
        setTimeout(processImage, 0)
      }
    })
  }, [processWithWorker])

  return {
    editorRef,
    handleSaveHtmlAsImage,
    isProcessing: isProcessingRef.current,
  }
}