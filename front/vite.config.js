import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test:{
    globals:true, //posso testar tudo e qualquer coisa
    environment: 'jsdom'
  }
})
