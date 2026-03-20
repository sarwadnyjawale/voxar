import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'
const ENGINE_URL = process.env.ENGINE_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Engine-specific routes (matched first)
      { source: '/api/v1/generate', destination: `${ENGINE_URL}/api/v1/generate` },
      { source: '/api/v1/health', destination: `${ENGINE_URL}/api/v1/health` },
      { source: '/previews/:path*', destination: `${ENGINE_URL}/previews/:path*` },
      // All other /api/v1/* routes (including /jobs/*) → Node.js backend
      { source: '/api/v1/:path*', destination: `${BACKEND_URL}/api/v1/:path*` },
    ]
  }
};

export default nextConfig;
