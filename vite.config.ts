import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is only set by the GitHub Pages deploy workflow (project pages
// are served from https://<org>.github.io/<repo>/, not the domain root). Local
// dev and the bundled-server production build both want the default "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
