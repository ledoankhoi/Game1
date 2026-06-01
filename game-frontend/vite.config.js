import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const games = [
  'hex', 'monster', 'race', 'chess', 'speed',
  'decryption', 'sequence', 'pixel', 'puzzle',
  'minesweeper_maze', 'maze', 'memory', 'escape',
  'rubik', 'chess-multi', 'othello-multi'
]

const rollupInput = {
  main: resolve(__dirname, 'index.html'),
}

for (const game of games) {
  rollupInput[game.replace('-', '_')] = resolve(__dirname, `${game}.html`)
}

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: true,
    allowedHosts: ['mathquest.com', 'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: rollupInput
    }
  }
})
