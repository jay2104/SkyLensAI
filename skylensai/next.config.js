/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  turbopack: {
    rules: {
      // Exclude test files from build in Turbopack
      '*.{test,spec}.{js,jsx,ts,tsx}': {
        loaders: ['ignore-loader'],
      },
    },
  },
  
  // Security headers for production security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing attacks
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Content Security Policy - restrictive but allows necessary resources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com", // Tailwind and Google Fonts
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob:", // Allow data URLs for charts and blob URLs for downloads
              "connect-src 'self' *.supabase.co wss://*.supabase.co", // Supabase connections
              "frame-src 'none'", // No frames allowed
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default config;
