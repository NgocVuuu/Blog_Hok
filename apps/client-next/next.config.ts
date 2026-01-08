import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'camp.honorofkings.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.honorofkings.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.honorofkings.com',
        pathname: '/**',
      }
    ],
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Reduce bundle size with optimized imports
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'react-icons',
    ],
  },

  // Faster dev server
  reactStrictMode: true,
  // Add a small identifying header so deployed Pages responses show which app produced them
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-App-Project',
            value: 'client-next',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
