import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  build: {
    rollupOptions: {
      output: {
        // Keep `createSsrRpc` (from @tanstack/start-server-core) in its own chunk.
        // Otherwise rolldown merges it into a route chunk that sits in an import
        // cycle, so the top-level `createServerFn(...).handler(createSsrRpc(...))`
        // calls run before the binding is initialised and the server throws
        // "TypeError: createSsrRpc is not a function" on every request.
        advancedChunks: {
          groups: [
            {
              name: 'tss-server-core',
              test: new RegExp('node_modules/@tanstack/start-server-core/'),
            },
          ],
        },
      },
    },
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
