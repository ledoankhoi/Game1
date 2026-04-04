import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Tạo chứng chỉ SSL giả lập cho HTTPSz
  ],
  server: {
    host: 'mathquest.com', // Chấp nhận truy cập qua mathquest
    port: 5173,
    https: true // Bật chế độ HTTPS
  }
})