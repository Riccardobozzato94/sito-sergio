import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Per GitHub Pages con dominio custom — vedi .github/workflows/deploy.yml
  base: '/',
  plugins: [react(), tailwindcss()],

  // ── Security headers for the Vite dev server ─────────────────────────────
  // In production these must be set by your hosting provider (Netlify/Vercel/
  // nginx). This block is dev-only but helps catch CSP violations early.
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",   // Vite HMR needs inline scripts in dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        // Supabase REST + Realtime WebSocket
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "img-src 'self' data: blob: https://*.supabase.co",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ].join('; '),
    },
  },

  // ── Build optimisations ──────────────────────────────────────────────────
  build: {
    // Warn (not fail) when a chunk exceeds 600 kB — helps monitor bundle size
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk so it can be cached
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
