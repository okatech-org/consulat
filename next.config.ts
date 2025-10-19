import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withNextIntl = createNextIntlPlugin();

// Only enable service worker in production
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: true,
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qld7pfnhxe.ufs.sh',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'rbvj2i3urx.ufs.sh',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
        pathname: '/embed/**',
      },
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        pathname: '/api/storage/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.consulat.ga https://*.clerk.consulat.ga https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.uploadthing.com https://*.ufs.sh",
              "style-src 'self' 'unsafe-inline' https://*.uploadthing.com https://*.ufs.sh",
              "img-src 'self' data: https: blob: https://*.uploadthing.com https://*.ufs.sh",
              "font-src 'self' data:",
              "connect-src 'self' https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.consulat.ga https://*.clerk.consulat.ga https://api.clerk.dev https://*.api.clerk.dev https://clerk-telemetry.com https://va.vercel-scripts.com https://*.uploadthing.com https://*.ufs.sh https://*.convex.cloud wss:",
              "frame-src 'self' https://challenges.cloudflare.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.consulat.ga https://*.clerk.consulat.ga https://*.ufs.sh",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'uploadthing'];
    return config;
  },
  // Configuration Turbopack stable (Next.js 15.3+)
  turbopack: {
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    resolveAlias: {
      // Alias personnalisés si nécessaire
    },
  },
  output: 'standalone',
};

export default withNextIntl(withSerwist(nextConfig));
