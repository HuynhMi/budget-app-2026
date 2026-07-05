import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {
      id: '/',
      start_url: '/',
      scope: '/',
      name: 'Quản lí Chi tiêu',
      short_name: 'Chi tiêu',
      description: 'Quản lí ví, thu chi, danh mục, ngân sách, thống kê và quét giỏ hàng — chạy offline.',
      lang: 'vi',
      dir: 'ltr',
      categories: ['finance', 'productivity'],
      theme_color: '#a78bfa',
      background_color: '#faf7ff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
    }
  }), cloudflare()],
  test: {
    environment: 'node'
  }
})