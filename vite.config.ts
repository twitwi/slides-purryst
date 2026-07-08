import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    },
    ...(isProd && {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'SlidesPurryst',
          fileName: (format) =>
            `slides-purryst.${format}.${format === 'umd' ? 'cjs' : 'js'}`
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: { vue: 'Vue' },
            assetFileNames: (chunk) => {
              if (chunk.name === 'style.css') return 'slides-purryst.css'
              return 'slides-purryst.[ext]'
            }
          }
        }
      }
    })
  }
})