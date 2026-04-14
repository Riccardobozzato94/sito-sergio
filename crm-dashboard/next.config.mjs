/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Security Headers ──────────────────────────────────────────────────────
  // Applied to every response from the Next.js server. Adjust the
  // Content-Security-Policy if you add third-party scripts or iframes.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Block MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS for 1 year (enable HSTS preload once stable)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Limit referrer information sent to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not used by the app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Content Security Policy
          // 'unsafe-inline' is required for Next.js inline styles; tighten once
          // you add a nonce-based approach or move to CSS modules.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js hot-reload scripts + Supabase JS
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Inline styles are used by Tailwind / Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Supabase API + Google OAuth + Google Drive API
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://drive.google.com",
              "frame-src https://accounts.google.com",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
