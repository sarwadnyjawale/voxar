import type { NextConfig } from "next";

// Hardcode the Railway URL here to guarantee Vercel's Edge Proxy NEVER hits localhost
const BACKEND_URL = 'https://voxar-production-95a3.up.railway.app'
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Voice previews — Backend serves these directly
      { source: '/previews/:path*', destination: `${BACKEND_URL}/previews/:path*` },
      // All other /api/v1/* routes (including /jobs/*) → Node.js backend
      { source: '/api/v1/:path*', destination: `${BACKEND_URL}/api/v1/:path*` },
    ]
  },
  async headers() {
    return [
      {
        source: '/previews/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800' },
        ],
      },
    ]
  },
};

export default nextConfig;
