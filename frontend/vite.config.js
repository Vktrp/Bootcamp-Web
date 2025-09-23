import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      strict: false,
      allow: ['..']
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    },
    
  test: {

    environment: "jsdom",  

    globals: true         

  },
  }
});
