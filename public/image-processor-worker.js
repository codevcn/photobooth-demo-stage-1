// Service Worker cho việc xử lý image processing
// File: public/image-processor-worker.js

self.addEventListener('message', async (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'PROCESS_IMAGE_DATA':
      try {
        const { imageData, options = {} } = data
        
        // Tạo canvas trong worker context
        const canvas = new OffscreenCanvas(imageData.width, imageData.height)
        const ctx = canvas.getContext('2d')
        
        // Vẽ imageData lên canvas
        ctx.putImageData(imageData, 0, 0)
        
        // Apply filters or transformations if needed
        if (options.quality) {
          // Apply quality adjustments
        }
        
        // Convert to blob
        const blob = await canvas.convertToBlob({
          type: 'image/png',
          quality: options.quality || 0.9
        })
        
        // Convert blob to ArrayBuffer để transfer
        const arrayBuffer = await blob.arrayBuffer()
        
        self.postMessage({
          type: 'IMAGE_PROCESSED',
          data: {
            arrayBuffer,
            success: true
          }
        }, [arrayBuffer]) // Transfer ownership
        
      } catch (error) {
        self.postMessage({
          type: 'IMAGE_PROCESSED',
          data: {
            error: error.message,
            success: false
          }
        })
      }
      break
      
    case 'COMPRESS_IMAGE':
      try {
        const { arrayBuffer, quality = 0.8 } = data
        
        // Create blob from arrayBuffer
        const blob = new Blob([arrayBuffer], { type: 'image/png' })
        
        // Create ImageBitmap
        const imageBitmap = await createImageBitmap(blob)
        
        // Create canvas and compress
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(imageBitmap, 0, 0)
        
        // Convert to compressed blob
        const compressedBlob = await canvas.convertToBlob({
          type: 'image/jpeg',
          quality
        })
        
        const compressedArrayBuffer = await compressedBlob.arrayBuffer()
        
        self.postMessage({
          type: 'IMAGE_COMPRESSED',
          data: {
            arrayBuffer: compressedArrayBuffer,
            originalSize: arrayBuffer.byteLength,
            compressedSize: compressedArrayBuffer.byteLength,
            success: true
          }
        }, [compressedArrayBuffer])
        
      } catch (error) {
        self.postMessage({
          type: 'IMAGE_COMPRESSED',
          data: {
            error: error.message,
            success: false
          }
        })
      }
      break
      
    default:
      self.postMessage({
        type: 'ERROR',
        data: { error: 'Unknown message type' }
      })
  }
})

// Handle worker startup
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  self.clients.claim()
})