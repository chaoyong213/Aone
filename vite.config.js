import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {join, resolve} from 'path'

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

const assetsPath = (path) => {
  return join('static', path)
}

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
    vue()
  ],
  
  base:"./",  
  root: "./src/pages",
  build: {
    outDir: resolve(process.cwd(),'build'),
    sourcemap: false, 
    chunkSizeWarningLimit: 1500,
    assetsDir: 'static',
    minify: 'esbuild',
    rollupOptions: {      
      input: {       
        index: resolve(__dirname, 'src/pages/index/index.html'),        
        favroite: resolve(__dirname, 'src/pages/favroite/index.html'),
      },
      output: {
        entryFileNames: assetsPath('js/[name].js'),
        chunkFileNames: assetsPath('js/[name].js'),
        assetFileNames: assetsPath('css/[name].[ext]'),
        compact: true,
        manualChunks: (id) => {
          if(id.includes("node_modules")) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    emptyOutDir: true,
  }
})
