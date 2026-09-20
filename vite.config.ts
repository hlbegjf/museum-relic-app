import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点部署在 /museum-relic-app/ 子路径下；
  // 本地开发仍使用根路径
  base: process.env.CI ? '/museum-relic-app/' : '/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
