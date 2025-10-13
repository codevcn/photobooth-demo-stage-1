import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Cho phép truy cập từ các thiết bị khác trong mạng
    port: 3000, // Cổng mặc định, có thể đổi nếu cần
    strictPort: true, // Nếu port bị chiếm, không tự động đổi
  },
})
