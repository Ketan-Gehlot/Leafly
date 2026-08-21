import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'generate-version-json',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({
            version: '1.4.0',
            buildTime: Date.now()
          })
        });
      }
    }
  ],
  define: {
    __APP_BUILD_TIME__: JSON.stringify(Date.now()),
  },
})
