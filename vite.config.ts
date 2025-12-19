import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Đảm bảo không còn dòng nào chứa process.env ở đây
})
