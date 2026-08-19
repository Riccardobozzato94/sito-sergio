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
    // Minify + emit sourcemaps-free production build (esbuild is fast & safe)
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk so it can be cached
        manualChunks(id) {
          // NOTE: @supabase/supabase-js is imported by the PUBLIC site too
          // (Products.jsx + content.js via lib/supabase/client), so it MUST
          // stay in the main vendor chunk — never move it to an admin-only chunk.
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router';
            return 'vendor';
          }
        },
      },
    },
  },
})
