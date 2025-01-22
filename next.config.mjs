// next.config.mjs
import { securityHeaders } from './config/security.mjs'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
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
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      }
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      }
    ]
  },

  webpack: (config) => {
    config.externals = [...(config.externals || []), 'uploadthing']
    return config
  },

  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/api/manifest'
      }
    ]
  }
}

export default withNextIntl(nextConfig)