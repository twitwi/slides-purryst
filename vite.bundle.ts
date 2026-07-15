import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJs(),
  ],
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-browser.js'
    }
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SlidesPurryst',
      fileName: () => 'slides-purryst.bundle.js',
      formats: ['umd'],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['shiki'],
      output: {
        globals: {},
      },
    },
  },
})
