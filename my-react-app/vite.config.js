import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0',  // 讓外部網路也能訪問
    port: 5173,       // 你前端原本用的 port
  },
})
