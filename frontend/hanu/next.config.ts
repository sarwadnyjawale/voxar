import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Engine-specific routes (matched first)
      // Voice previews — try engine first, Node backend also serves as fallback
      { source: '/previews/:path*', destination: `${ENGINE_URL}/previews/:path*` },
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
